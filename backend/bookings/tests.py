from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from bookings.models import Booking, EscrowHold, Quote

User = get_user_model()


class EscrowFirstLifecycleTests(APITestCase):
    def setUp(self):
        self.client_user = User.objects.create_user(
            username="client_test",
            email="client@test.com",
            password="Password123!",
            role="client",
        )
        self.client_user.wallet_balance = Decimal("300.00")
        self.client_user.wallet_locked_balance = Decimal("0.00")
        self.client_user.save()

        self.handyman_user = User.objects.create_user(
            username="handyman_test",
            email="handy@test.com",
            password="Password123!",
            role="handyman",
        )
        self.handyman_user.wallet_balance = Decimal("0.00")
        self.handyman_user.save()

        self.booking = Booking.objects.create(
            client=self.client_user,
            handyman=self.handyman_user,
            service_type="flooring",
            description="Kitchen tiles",
            status="pending",
            negotiation_status="awaiting_client",
            agreed_price=Decimal("30.00"),
            scheduled_time=timezone.now() + timedelta(hours=1),
        )

    def test_accept_offer_locks_first_visit_funds(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(
            f"/api/bookings/{self.booking.id}/client-action/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.client_user.refresh_from_db()
        self.assertEqual(self.booking.status, "accepted")
        self.assertEqual(self.booking.negotiation_status, "agreed")
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("30.00"))
        self.assertTrue(
            EscrowHold.objects.filter(
                booking=self.booking,
                purpose="visit_fee",
                amount=Decimal("30.00"),
                status="locked",
            ).exists()
        )

    def test_confirm_done_releases_first_visit_hold(self):
        self.client.force_authenticate(user=self.client_user)
        self.client.post(f"/api/bookings/{self.booking.id}/client-action/", {"action": "accept"}, format="json")

        self.booking.status = "handyman_done"
        self.booking.handyman_marked_done_at = timezone.now()
        self.booking.save(update_fields=["status", "handyman_marked_done_at", "updated_at"])

        response = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "confirm_done"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.client_user.refresh_from_db()
        self.handyman_user.refresh_from_db()
        self.assertEqual(self.booking.status, "visit_fee_paid")
        self.assertEqual(self.client_user.wallet_balance, Decimal("270.00"))
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("0.00"))
        self.assertEqual(self.handyman_user.wallet_balance, Decimal("30.00"))

    def test_mark_not_completed_refunds_first_visit_hold(self):
        self.client.force_authenticate(user=self.client_user)
        self.client.post(f"/api/bookings/{self.booking.id}/client-action/", {"action": "accept"}, format="json")

        self.booking.status = "handyman_done"
        self.booking.handyman_marked_done_at = timezone.now()
        self.booking.save(update_fields=["status", "handyman_marked_done_at", "updated_at"])

        response = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "mark_not_completed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.client_user.refresh_from_db()
        self.handyman_user.refresh_from_db()
        self.assertEqual(self.booking.status, "not_completed")
        self.assertEqual(self.client_user.wallet_balance, Decimal("300.00"))
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("0.00"))
        self.assertEqual(self.handyman_user.wallet_balance, Decimal("0.00"))

    def test_quote_accept_locks_and_confirm_done_releases_second_visit(self):
        self.client.force_authenticate(user=self.client_user)
        self.client.post(f"/api/bookings/{self.booking.id}/client-action/", {"action": "accept"}, format="json")
        self.booking.refresh_from_db()
        self.booking.status = "visit_fee_paid"
        self.booking.continue_job_requested = True
        self.booking.continue_job_confirmed = True
        self.booking.quote_status = "draft"
        self.booking.save(
            update_fields=[
                "status",
                "continue_job_requested",
                "continue_job_confirmed",
                "quote_status",
                "updated_at",
            ]
        )

        self.client.force_authenticate(user=self.handyman_user)
        create_quote = self.client.post(
            f"/api/bookings/{self.booking.id}/quotes/",
            {
                "line_items": [
                    {
                        "category": "labor",
                        "description": "Install finishing strips",
                        "quantity": 1,
                        "unit_price": 100,
                    }
                ],
                "proposed_visit_time": (timezone.now() + timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(create_quote.status_code, status.HTTP_201_CREATED)
        quote = Quote.objects.get(id=create_quote.data["id"])

        self.client.force_authenticate(user=self.client_user)
        accept_quote = self.client.post(
            f"/api/bookings/{self.booking.id}/quotes/{quote.id}/client-action/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(accept_quote.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "funds_locked")
        self.assertTrue(
            EscrowHold.objects.filter(booking=self.booking, purpose="quote", status="locked").exists()
        )

        self.booking.status = "handyman_done"
        self.booking.handyman_marked_done_at = timezone.now()
        self.booking.save(update_fields=["status", "handyman_marked_done_at", "updated_at"])
        confirm_second = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "confirm_done"},
            format="json",
        )
        self.assertEqual(confirm_second.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.client_user.refresh_from_db()
        self.handyman_user.refresh_from_db()
        self.assertEqual(self.booking.status, "paid")
        self.assertEqual(self.client_user.wallet_balance, Decimal("200.00"))
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("30.00"))
        self.assertEqual(self.handyman_user.wallet_balance, Decimal("100.00"))