import os
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from services.handyman_ai import (
    NO_MATCH_MESSAGE,
    _build_system_prompt,
    classify_problem_to_service,
    get_available_service_types,
)

User = get_user_model()


class HandymanAIServiceTests(APITestCase):
    def test_get_available_service_types_returns_unique_cleaned_values(self):
        User.objects.create_user(
            username="h1",
            email="h1@example.com",
            password="Password123!",
            role="handyman",
            service_type=" Plumbing ",
        )
        User.objects.create_user(
            username="h2",
            email="h2@example.com",
            password="Password123!",
            role="handyman",
            service_type="plumbing",
        )
        User.objects.create_user(
            username="h3",
            email="h3@example.com",
            password="Password123!",
            role="handyman",
            service_type="Electrical",
        )
        User.objects.create_user(
            username="c1",
            email="c1@example.com",
            password="Password123!",
            role="client",
            service_type="Painting",
        )
        User.objects.create_user(
            username="h4",
            email="h4@example.com",
            password="Password123!",
            role="handyman",
            service_type="",
        )

        service_types = get_available_service_types()
        self.assertEqual(service_types, ["Electrical", "Plumbing"])

    def test_classify_problem_returns_no_match_when_no_handymen_services(self):
        result = classify_problem_to_service("My sink is leaking")
        self.assertEqual(result["status"], "no_match")
        self.assertEqual(result["message"], NO_MATCH_MESSAGE)

    @patch.dict(os.environ, {}, clear=True)
    def test_classify_problem_returns_no_match_when_api_key_missing(self):
        User.objects.create_user(
            username="h1",
            email="h1@example.com",
            password="Password123!",
            role="handyman",
            service_type="Plumbing",
        )

        result = classify_problem_to_service("My sink is leaking")
        self.assertEqual(result["status"], "no_match")
        self.assertEqual(result["message"], NO_MATCH_MESSAGE)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "dummy-key"}, clear=True)
    @patch("services.handyman_ai._call_gemini")
    def test_classify_problem_falls_back_when_gemini_payload_invalid(self, mock_call_gemini):
        User.objects.create_user(
            username="h1",
            email="h1@example.com",
            password="Password123!",
            role="handyman",
            service_type="Plumbing",
        )
        mock_call_gemini.return_value = {"status": "unknown"}

        result = classify_problem_to_service("My sink is leaking")
        self.assertEqual(result["status"], "no_match")
        self.assertEqual(result["message"], NO_MATCH_MESSAGE)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "dummy-key"}, clear=True)
    @patch("services.handyman_ai._call_gemini")
    def test_classify_problem_returns_no_match_when_gemini_cannot_classify(self, mock_call_gemini):
        User.objects.create_user(
            username="h5",
            email="h5@example.com",
            password="Password123!",
            role="handyman",
            service_type="Mechanic",
        )
        mock_call_gemini.return_value = {"status": "unknown"}

        result = classify_problem_to_service("My car is broken and engine makes noise")
        self.assertEqual(result["status"], "no_match")
        self.assertEqual(result["message"], NO_MATCH_MESSAGE)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "dummy-key"}, clear=True)
    def test_classify_problem_returns_standard_no_match_on_quota_error(self):
        class FakeClientError(Exception):
            status_code = 429

        User.objects.create_user(
            username="h6",
            email="h6@example.com",
            password="Password123!",
            role="handyman",
            service_type="Plumbing",
        )

        with patch("services.handyman_ai.GeminiClientError", FakeClientError):
            with patch("services.handyman_ai._call_gemini", side_effect=FakeClientError()):
                with patch("services.handyman_ai.random.uniform", return_value=17.5):
                    with patch("services.handyman_ai.time.sleep", return_value=None) as sleep_mock:
                        result = classify_problem_to_service("My sink is leaking")
                        sleep_mock.assert_called_once_with(17.5)

        self.assertEqual(result["status"], "no_match")
        self.assertEqual(result["message"], NO_MATCH_MESSAGE)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "dummy-key"}, clear=True)
    @patch("services.handyman_ai._call_gemini")
    def test_classify_problem_returns_valid_match_payload(self, mock_call_gemini):
        User.objects.create_user(
            username="h1",
            email="h1@example.com",
            password="Password123!",
            role="handyman",
            service_type="Plumbing",
        )
        mock_call_gemini.return_value = {
            "status": "match",
            "category": "plumbing",
            "explanation": "This sounds like a plumbing issue.",
        }

        result = classify_problem_to_service("My sink is leaking")
        self.assertEqual(result["status"], "match")
        self.assertEqual(result["category"], "Plumbing")
        self.assertIn("plumbing", result["explanation"].lower())

    def test_system_prompt_includes_registration_display_names(self):
        prompt = _build_system_prompt(["flooring", "mechanic", "masonry"])
        self.assertIn("Available Categories: flooring, mechanic, masonry", prompt)
        self.assertIn("flooring: Flooring & parquet", prompt)
        self.assertIn("mechanic: Auto mechanic", prompt)
        self.assertIn("masonry: Masonry & brickwork", prompt)


class AIHelperEndpointTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="client1",
            email="client1@example.com",
            password="Password123!",
            role="client",
        )
        self.url = "/api/ai-helper/"

    @patch("services.views.classify_problem_to_service")
    def test_endpoint_allows_unauthenticated_requests(self, mock_classifier):
        mock_classifier.return_value = {
            "status": "no_match",
            "message": NO_MATCH_MESSAGE,
        }
        response = self.client.post(self.url, {"message": "help"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "no_match")

    def test_endpoint_rejects_missing_message(self):
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["status"], "error")

    @patch("services.views.classify_problem_to_service")
    def test_endpoint_returns_service_payload(self, mock_classifier):
        self.client.force_authenticate(user=self.user)
        mock_classifier.return_value = {
            "status": "match",
            "category": "Plumbing",
            "explanation": "This sounds like plumbing.",
        }

        response = self.client.post(self.url, {"message": "leak"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "match")
        self.assertEqual(response.data["category"], "Plumbing")
