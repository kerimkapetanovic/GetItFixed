from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone

from .models import Booking, EscrowHold, Quote, WalletTransaction

User = get_user_model()


def _to_decimal(amount) -> Decimal:
    value = Decimal(str(amount or "0")).quantize(Decimal("0.01"))
    if value <= Decimal("0.00"):
        raise ValueError("Amount must be greater than zero.")
    return value


def lock_client_funds(
    *,
    booking: Booking,
    actor: User,
    quote: Quote | None = None,
    amount: Decimal | None = None,
    purpose: str = "quote",
) -> EscrowHold:
    """Locks client funds into escrow for visit fee or quote."""
    if actor != booking.client:
        raise PermissionError("Only the booking client can lock escrow funds.")
    if purpose not in {"visit_fee", "quote"}:
        raise ValueError("Invalid escrow purpose.")
    if purpose == "quote":
        if quote is None:
            raise ValueError("Quote is required for quote escrow lock.")
        if quote.booking_id != booking.id:
            raise ValueError("Quote does not belong to this booking.")
    elif quote is not None and quote.booking_id != booking.id:
        raise ValueError("Quote does not belong to this booking.")
    if not booking.handyman_id:
        raise ValueError("Booking has no assigned handyman.")

    if amount is None:
        if quote is None:
            raise ValueError("Amount is required when quote is missing.")
        lock_amount = _to_decimal(quote.total_amount)
    else:
        lock_amount = _to_decimal(amount)

    with transaction.atomic():
        booking_locked = Booking.objects.select_for_update().get(pk=booking.pk)
        client = User.objects.select_for_update().get(pk=booking.client_id)

        available = (client.wallet_balance or Decimal("0.00")) - (
            client.wallet_locked_balance or Decimal("0.00")
        )
        if available < lock_amount:
            raise ValueError("Insufficient available balance.")

        client_before = client.wallet_locked_balance or Decimal("0.00")
        client.wallet_locked_balance = client_before + lock_amount
        client.save(update_fields=["wallet_locked_balance"])

        hold = EscrowHold.objects.create(
            booking=booking_locked,
            quote=quote,
            client=client,
            handyman=booking_locked.handyman,
            amount=lock_amount,
            purpose=purpose,
            status="locked",
            locked_at=timezone.now(),
        )

        WalletTransaction.objects.create(
            user=client,
            booking=booking_locked,
            escrow_hold=hold,
            tx_type="lock",
            amount=lock_amount,
            balance_before=client_before,
            balance_after=client.wallet_locked_balance,
            note=f"Escrow lock for booking #{booking_locked.id}",
        )

        if purpose == "quote":
            booking_locked.quote_locked_amount = lock_amount
            booking_locked.funds_locked_at = timezone.now()
            booking_locked.quote_status = "accepted"
            booking_locked.status = "funds_locked"
            booking_locked.save(
                update_fields=[
                    "quote_locked_amount",
                    "funds_locked_at",
                    "quote_status",
                    "status",
                    "updated_at",
                ]
            )
            if quote and quote.status != "accepted":
                quote.status = "accepted"
                quote.client_decision_at = timezone.now()
                quote.save(update_fields=["status", "client_decision_at", "updated_at"])
        else:
            booking_locked.visit_fee_amount = lock_amount
            booking_locked.save(update_fields=["visit_fee_amount", "updated_at"])

        return hold


def release_funds_to_handyman(
    *,
    hold: EscrowHold,
    note: str = "",
    set_booking_paid: bool = True,
    booking_status: str | None = None,
) -> EscrowHold:
    """Moves locked funds from client to handyman on successful completion."""
    with transaction.atomic():
        hold_locked = (
            EscrowHold.objects.select_for_update()
            .select_related("booking")
            .get(pk=hold.pk)
        )
        if hold_locked.status != "locked":
            raise ValueError("Escrow hold is not in a releasable state.")

        client = User.objects.select_for_update().get(pk=hold_locked.client_id)
        handyman = User.objects.select_for_update().get(pk=hold_locked.handyman_id)
        booking = Booking.objects.select_for_update().get(pk=hold_locked.booking_id)
        amount = _to_decimal(hold_locked.amount)

        client_locked_before = client.wallet_locked_balance or Decimal("0.00")
        client_total_before = client.wallet_balance or Decimal("0.00")
        handyman_before = handyman.wallet_balance or Decimal("0.00")

        if client_locked_before < amount or client_total_before < amount:
            raise ValueError("Client wallet does not contain enough locked funds.")

        client.wallet_locked_balance = client_locked_before - amount
        client.wallet_balance = client_total_before - amount
        handyman.wallet_balance = handyman_before + amount

        client.save(update_fields=["wallet_locked_balance", "wallet_balance"])
        handyman.save(update_fields=["wallet_balance"])

        hold_locked.status = "released"
        hold_locked.released_at = timezone.now()
        hold_locked.save(update_fields=["status", "released_at", "updated_at"])

        WalletTransaction.objects.create(
            user=client,
            booking=booking,
            escrow_hold=hold_locked,
            tx_type="release",
            amount=amount,
            balance_before=client_total_before,
            balance_after=client.wallet_balance,
            note=note or f"Escrow release for booking #{booking.id}",
        )
        WalletTransaction.objects.create(
            user=handyman,
            booking=booking,
            escrow_hold=hold_locked,
            tx_type="credit",
            amount=amount,
            balance_before=handyman_before,
            balance_after=handyman.wallet_balance,
            note=note or f"Escrow credit from booking #{booking.id}",
        )

        if set_booking_paid:
            booking.status = booking_status or "paid"
            booking.paid_at = timezone.now()
            booking.payment_amount = amount
            booking.save(update_fields=["status", "paid_at", "payment_amount", "updated_at"])
        elif booking_status:
            booking.status = booking_status
            if booking_status == "visit_fee_paid":
                booking.visit_fee_paid_at = timezone.now()
            booking.save(update_fields=["status", "visit_fee_paid_at", "updated_at"])

        return hold_locked


def refund_locked_funds(
    *,
    hold: EscrowHold,
    reason: str = "",
    booking_status: str = "not_completed",
) -> EscrowHold:
    """Unlocks funds back to client spendable balance (no transfer to handyman)."""
    with transaction.atomic():
        hold_locked = (
            EscrowHold.objects.select_for_update()
            .select_related("booking")
            .get(pk=hold.pk)
        )
        if hold_locked.status != "locked":
            raise ValueError("Escrow hold is not in a refundable state.")

        client = User.objects.select_for_update().get(pk=hold_locked.client_id)
        booking = Booking.objects.select_for_update().get(pk=hold_locked.booking_id)
        amount = _to_decimal(hold_locked.amount)

        locked_before = client.wallet_locked_balance or Decimal("0.00")
        if locked_before < amount:
            raise ValueError("Client locked balance is lower than hold amount.")

        client.wallet_locked_balance = locked_before - amount
        client.save(update_fields=["wallet_locked_balance"])

        hold_locked.status = "refunded"
        hold_locked.refunded_at = timezone.now()
        hold_locked.reason = reason or hold_locked.reason
        hold_locked.save(update_fields=["status", "refunded_at", "reason", "updated_at"])

        WalletTransaction.objects.create(
            user=client,
            booking=booking,
            escrow_hold=hold_locked,
            tx_type="unlock",
            amount=amount,
            balance_before=locked_before,
            balance_after=client.wallet_locked_balance,
            note=reason or f"Escrow unlocked for booking #{booking.id}",
        )

        booking.status = booking_status
        if hold_locked.purpose == "quote":
            booking.quote_locked_amount = Decimal("0.00")
            booking.funds_locked_at = None
            booking.save(update_fields=["status", "quote_locked_amount", "funds_locked_at", "updated_at"])
        else:
            booking.save(update_fields=["status", "updated_at"])

        return hold_locked

