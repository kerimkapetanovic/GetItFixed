import json
import logging
import os
import random
import re
import time
from difflib import get_close_matches
from typing import Any

from django.contrib.auth import get_user_model

try:
    from google.genai.errors import ClientError as GeminiClientError
except Exception:  # pragma: no cover - graceful if dependency is unavailable
    GeminiClientError = None

logger = logging.getLogger(__name__)

NO_MATCH_MESSAGE = (
    "Thank you for reaching out! We don't have a specialist for that yet, "
    "but our network is growing daily. Please check back soon!"
)

# Mirrors frontend registration display names from translations.register.services (English).
SERVICE_DISPLAY_NAMES: dict[str, str] = {
    "mechanic": "Auto mechanic",
    "pools": "Pool maintenance & swimming pools",
    "carpenter": "Carpenter & woodwork",
    "tiler": "Ceramics & tiling",
    "cleaning": "Cleaning services",
    "electrician": "Electrician",
    "excavation": "Excavation & groundwork",
    "facade": "Facade & insulation",
    "fencing": "Fencing & gates",
    "flooring": "Flooring & parquet",
    "renovation": "Full renovation expert",
    "gardener": "Gardening & landscaping",
    "heating": "Heating & plumbing systems",
    "hvac": "HVAC & air conditioning",
    "it_support": "IT support & tech solutions",
    "masonry": "Masonry & brickwork",
    "painter": "Painter & decorator",
    "plumber": "Plumbing specialist",
    "security": "Security & surveillance systems",
    "solar": "Solar panel installation",
    "transport": "Transport & moving services",
    "upholstery": "Upholstery & furniture repair",
    "windows": "Window & door installation",
    "roofing": "Roofing specialist",
    "appliances": "Appliance repair & maintenance",
    "pest_control": "Pest control & extermination",
}

# Normalization aliases for DB values that differ from registration keys.
SERVICE_DISPLAY_ALIASES: dict[str, str] = {
    "plumbing": "plumber",
    "electrical": "electrician",
    "painting": "painter",
    "carpentry": "carpenter",
}

GEMINI_MODEL_NAME = "gemini-2.5-flash-lite"
GEMINI_QUOTA_RETRY_DELAY_MIN_SECONDS = 15
GEMINI_QUOTA_RETRY_MAX_SECONDS = 20
GEMINI_QUOTA_MAX_RETRIES = 1


def build_no_match_response(message: str = NO_MATCH_MESSAGE) -> dict[str, str]:
    return {
        "status": "no_match",
        "message": message,
    }


def get_available_service_types() -> list[str]:
    user_model = get_user_model()
    raw_values = (
        user_model.objects.filter(role="handyman")
        .exclude(service_type__isnull=True)
        .values_list("service_type", flat=True)
    )

    normalized_values: dict[str, str] = {}
    for value in raw_values:
        cleaned = (value or "").strip()
        if not cleaned:
            continue
        normalized_values.setdefault(cleaned.lower(), cleaned)

    service_types = sorted(normalized_values.values(), key=str.lower)
    logger.warning("AI helper available services from DB: %s", service_types)
    return service_types


def _normalize_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _format_category_list(service_types: list[str]) -> str:
    # Keep category list clean and predictable for the model.
    return ", ".join(_normalize_text(service) for service in service_types if service.strip())


def _build_category_catalog(service_types: list[str]) -> list[tuple[str, str]]:
    catalog: list[tuple[str, str]] = []
    for service in service_types:
        normalized = _normalize_text(service)
        lookup_key = SERVICE_DISPLAY_ALIASES.get(normalized, normalized)
        display_name = SERVICE_DISPLAY_NAMES.get(lookup_key, service.strip())
        catalog.append((service, display_name))
    return catalog


def _resolve_category_by_alias(alias: str, service_types: list[str]) -> str | None:
    normalized_alias = _normalize_text(alias)
    lookup = {_normalize_text(service): service for service in service_types}

    # Exact normalized match first.
    exact = lookup.get(normalized_alias)
    if exact:
        return exact

    # Then fuzzy matching for close category names.
    close = get_close_matches(normalized_alias, lookup.keys(), n=1, cutoff=0.72)
    if close:
        return lookup[close[0]]
    return None


def _build_system_prompt(service_types: list[str]) -> str:
    categories = _format_category_list(service_types)
    category_catalog = _build_category_catalog(service_types)
    catalog_lines = [f"- {db_value}: {display_name}" for db_value, display_name in category_catalog]
    catalog_text = "\n".join(catalog_lines) if catalog_lines else "- (none)"
    return "\n".join(
        [
            "You are an expert at mapping home repair problems to professional categories.",
            "Use semantic understanding of symptoms and context (not keyword-only matching).",
            f"Available Categories: {categories}",
            "Knowledge Base (DB value -> display label used in registration UI):",
            catalog_text,
            (
                "Treat plural and variation forms as the same intent, such as "
                "plumber/plumbing and mechanic/mechanical."
            ),
            (
                'If a user mentions tasks like "laying parquet," "carpeting," or "laminate," '
                'map them to the "flooring" category when available.'
            ),
            (
                "If a user's request clearly falls under the expertise of one of the "
                "available services, you must facilitate the match even if the exact "
                "keyword is not used."
            ),
            (
                "You are allowed to make logical inferences. If a task requires a specific trade, "
                "match it to the most relevant available category even if the exact word is not in "
                "the user's message."
            ),
            (
                "Rule: If the user's problem (for example leaking, pipes, toilet) logically "
                "falls under one available category (for example plumbing), you MUST return match."
            ),
            "If there is a clear best category from the available list, always choose it.",
            (
                'Return match as JSON: {"status": "match", "category": "CategoryName", '
                '"explanation": "Short, friendly explanation that guides the user to that service."}'
            ),
            (
                "If none of the available categories reasonably fit, return: "
                '{"status": "no_match", "message": "Thank you for reaching out! '
                "We don't have a specialist for that yet, but our network is "
                'growing daily. Please check back soon!"}.'
            ),
            "Return JSON only, without markdown fences or additional text.",
        ]
    )


def _extract_response_text(response: Any) -> str:
    text = getattr(response, "text", None)
    if isinstance(text, str) and text.strip():
        return text.strip()

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None) or []
        for part in parts:
            part_text = getattr(part, "text", None)
            if isinstance(part_text, str) and part_text.strip():
                return part_text.strip()

    return ""


def _parse_json_payload(raw_text: str) -> dict[str, Any]:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    json_match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if not json_match:
        raise ValueError("Gemini response did not contain JSON.")

    parsed = json.loads(json_match.group(0))
    if not isinstance(parsed, dict):
        raise ValueError("Gemini JSON payload is not an object.")
    return parsed


def _call_gemini(user_message: str, service_types: list[str], api_key: str) -> dict[str, Any]:
    from google import genai

    prompt = (
        f"{_build_system_prompt(service_types)}\n\n"
        f"User Problem: {user_message}\n"
    )
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=GEMINI_MODEL_NAME,
        contents=prompt,
        config={"temperature": 0.2},
    )

    raw_text = _extract_response_text(response)
    if not raw_text:
        raise ValueError("Gemini response was empty.")
    logger.debug("AI helper raw Gemini response: %s", raw_text)

    return _parse_json_payload(raw_text)


def _validate_ai_payload(payload: Any, service_types: list[str]) -> dict[str, str]:
    if not isinstance(payload, dict):
        raise ValueError("AI payload is not a JSON object.")

    status = payload.get("status")
    if status == "match":
        category = str(payload.get("category", "")).strip()
        explanation = str(payload.get("explanation", "")).strip()
        if not category or not explanation:
            raise ValueError("Match payload is missing required fields.")

        normalized = _resolve_category_by_alias(category, service_types)
        if not normalized:
            return build_no_match_response()

        return {
            "status": "match",
            "category": normalized,
            "explanation": explanation,
        }

    if status == "no_match":
        message = str(payload.get("message", "")).strip() or NO_MATCH_MESSAGE
        return build_no_match_response(message)

    raise ValueError("AI payload has unsupported status.")


def classify_problem_to_service(user_message: str) -> dict[str, str]:
    service_types = get_available_service_types()
    if not service_types:
        return build_no_match_response()

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logger.warning("GEMINI_API_KEY is missing. Returning no-match fallback.")
        return build_no_match_response()

    attempts = GEMINI_QUOTA_MAX_RETRIES + 1
    for attempt in range(attempts):
        try:
            payload = _call_gemini(
                user_message=user_message,
                service_types=service_types,
                api_key=api_key,
            )
            return _validate_ai_payload(payload, service_types)
        except Exception as exc:
            status_code = getattr(exc, "status_code", None)
            is_quota_error = status_code == 429 or "429" in str(exc)
            if is_quota_error and (GeminiClientError is None or isinstance(exc, GeminiClientError)):
                if attempt < GEMINI_QUOTA_MAX_RETRIES:
                    retry_delay = random.uniform(
                        GEMINI_QUOTA_RETRY_DELAY_MIN_SECONDS,
                        GEMINI_QUOTA_RETRY_MAX_SECONDS,
                    )
                    logger.warning(
                        "Gemini Quota Exceeded - retrying in %s seconds",
                        round(retry_delay, 2),
                    )
                    time.sleep(retry_delay)
                    continue
                logger.warning("Gemini Quota Exceeded - Using Fallback")
                return build_no_match_response()
            is_model_error = status_code == 404 or "not found" in str(exc).lower()
            if is_model_error and (GeminiClientError is None or isinstance(exc, GeminiClientError)):
                logger.warning("Gemini Model Not Available - Using Fallback")
                return build_no_match_response()
            logger.exception("Gemini classification failed. Returning no-match fallback.")
            return build_no_match_response()

    return build_no_match_response()
