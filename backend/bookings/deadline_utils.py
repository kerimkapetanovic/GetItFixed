from datetime import timedelta

from django.utils import timezone


def handyman_response_hours(is_urgent: bool) -> int:
    return 1 if is_urgent else 3


def is_first_handyman_turn(booking) -> bool:
    """True only for the first assignment (before handyman has ever countered)."""
    return booking.handyman_proposed_time is None


def set_handyman_response_deadline(booking) -> None:
    """
    Set handyman response timer.
    - First turn: may cap at client proposed time if it is sooner than 3h.
    - After any handyman counter / client counter-back: always a fresh 3h window.
    """
    now = timezone.now()
    hours = handyman_response_hours(booking.is_urgent)

    if not is_first_handyman_turn(booking):
        booking.expires_at = now + timedelta(hours=hours)
        booking.handyman_response_phase = "negotiation"
        return

    standard_deadline = now + timedelta(hours=hours)
    client_time = booking.client_proposed_time

    if client_time and client_time <= now:
        booking.handyman_response_phase = "after_client_time"
        booking.expires_at = now + timedelta(hours=hours)
        return

    if client_time and client_time > now and client_time <= standard_deadline:
        booking.expires_at = client_time
    else:
        booking.expires_at = standard_deadline

    booking.handyman_response_phase = "before_client_time"


# Backwards-compatible alias
set_initial_handyman_deadline = set_handyman_response_deadline


def repair_stale_handyman_deadline(booking) -> bool:
    """Fix pending tickets with incorrect expires_at (e.g. snapped to far-future client time)."""
    if booking.status != "pending":
        return False

    needs_handyman = booking.negotiation_status == "awaiting_handyman" or (
        booking.negotiation_status == "none" and booking.handyman_id is not None
    )
    if not needs_handyman:
        return False

    now = timezone.now()
    hours = handyman_response_hours(booking.is_urgent)
    max_deadline = now + timedelta(hours=hours)

    # Counter-negotiation: deadline must never be beyond a fresh 3h window from now
    if not is_first_handyman_turn(booking):
        if booking.expires_at and booking.expires_at > max_deadline + timedelta(seconds=30):
            booking.expires_at = max_deadline
            booking.handyman_response_phase = "negotiation"
            booking.save(update_fields=["expires_at", "handyman_response_phase", "updated_at"])
            return True
        return False

    phase = booking.handyman_response_phase or "before_client_time"
    if phase in ("after_client_time", "negotiation"):
        return False

    anchor = booking.created_at or now
    standard_deadline = anchor + timedelta(hours=hours)
    client_time = booking.client_proposed_time

    if client_time and client_time <= now:
        if phase != "after_client_time" or not booking.expires_at:
            booking.handyman_response_phase = "after_client_time"
            booking.expires_at = max_deadline
            booking.save(update_fields=["handyman_response_phase", "expires_at", "updated_at"])
            return True
        return False

    if not client_time:
        return False

    expected = client_time if client_time <= standard_deadline else standard_deadline
    if booking.expires_at and abs((booking.expires_at - expected).total_seconds()) < 5:
        return False

    # Do not extend to a far-future client time on first turn
    if expected > max_deadline + timedelta(seconds=30):
        expected = max_deadline

    booking.expires_at = expected
    booking.handyman_response_phase = "before_client_time"
    booking.save(update_fields=["expires_at", "handyman_response_phase", "updated_at"])
    return True


def process_handyman_negotiation_expiry(booking) -> str:
    """
    Returns: extended_to_client_time | post_proposal_started | declined | no_op
    """
    if booking.status != "pending":
        return "no_op"

    needs_handyman = booking.negotiation_status == "awaiting_handyman" or (
        booking.negotiation_status == "none" and booking.handyman_id is not None
    )
    if not needs_handyman:
        return "no_op"

    now = timezone.now()
    hours = handyman_response_hours(booking.is_urgent)

    # Counter back-and-forth: simple 3h window, then auto-decline
    if not is_first_handyman_turn(booking):
        booking.status = "cancelled"
        booking.negotiation_status = "declined"
        booking.save(update_fields=["status", "negotiation_status", "updated_at"])
        return "declined"

    phase = booking.handyman_response_phase or "before_client_time"
    client_time = booking.client_proposed_time

    if phase == "before_client_time":
        if client_time and now < client_time:
            booking.expires_at = client_time
            booking.save(update_fields=["expires_at", "updated_at"])
            return "extended_to_client_time"

        if client_time and now >= client_time:
            booking.handyman_response_phase = "after_client_time"
            booking.expires_at = now + timedelta(hours=hours)
            booking.save(update_fields=["handyman_response_phase", "expires_at", "updated_at"])
            return "post_proposal_started"

        booking.status = "cancelled"
        booking.negotiation_status = "declined"
        booking.save(update_fields=["status", "negotiation_status", "updated_at"])
        return "declined"

    if phase == "after_client_time":
        booking.status = "cancelled"
        booking.negotiation_status = "declined"
        booking.save(update_fields=["status", "negotiation_status", "updated_at"])
        return "declined"

    return "no_op"
