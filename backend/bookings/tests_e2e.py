from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from bookings.models import Booking, EscrowHold, Quote

User = get_user_model()


class EscrowFirstE2ETests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@getitfixed.com",
            password="password",
            role="admin",
        )
        self.admin_user.wallet_balance = Decimal("0.00")
        self.admin_user.wallet_locked_balance = Decimal("0.00")
        self.admin_user.save()

        self.client_user = User.objects.create_user(
            username="client",
            email="client_e2e@test.com",
            password="password",
            role="client",
        )
        self.client_user.wallet_balance = Decimal("500.00")
        self.client_user.save()

        self.handyman = User.objects.create_user(
            username="handyman",
            email="handy_e2e@test.com",
            password="password",
            role="handyman",
        )
        self.handyman.wallet_balance = Decimal("0.00")
        self.handyman.save()

        self.booking = Booking.objects.create(
            client=self.client_user,
            handyman=self.handyman,
            service_type="plumbing",
            description="Fixing the pipe",
            status="pending",
            negotiation_status="awaiting_client",
            agreed_price=Decimal("50.00"),
            scheduled_time=timezone.now() + timedelta(minutes=5),
        )

    def test_full_happy_path_escrow_only(self):
        self.client.force_authenticate(user=self.client_user)
        accept_offer = self.client.post(
            f"/api/bookings/{self.booking.id}/client-action/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(accept_offer.status_code, status.HTTP_200_OK)
        self.assertTrue(
            EscrowHold.objects.filter(booking=self.booking, purpose="visit_fee", status="locked").exists()
        )

        self.booking.status = "in_progress"
        self.booking.save(update_fields=["status", "updated_at"])

        self.client.force_authenticate(user=self.handyman)
        mark_done_visit1 = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "mark_done"},
            format="json",
        )
        self.assertEqual(mark_done_visit1.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.client_user)
        confirm_visit1 = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "confirm_done"},
            format="json",
        )
        self.assertEqual(confirm_visit1.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "visit_fee_paid")

        continue_job = self.client.post(
            f"/api/bookings/{self.booking.id}/continue-job/",
            {"continue_job": True},
            format="json",
        )
        self.assertEqual(continue_job.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.handyman)
        create_quote = self.client.post(
            f"/api/bookings/{self.booking.id}/quotes/",
            {
                "line_items": [
                    {"category": "labor", "description": "Fixing", "quantity": 1, "unit_price": 100}
                ],
                "proposed_visit_time": (timezone.now() + timedelta(hours=2)).isoformat(),
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

        self.booking.status = "in_progress"
        self.booking.save(update_fields=["status", "updated_at"])
        self.client.force_authenticate(user=self.handyman)
        mark_done_visit2 = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "mark_done"},
            format="json",
        )
        self.assertEqual(mark_done_visit2.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.client_user)
        confirm_visit2 = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "confirm_done"},
            format="json",
        )
        self.assertEqual(confirm_visit2.status_code, status.HTTP_200_OK)

        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "paid")
        self.client_user.refresh_from_db()
        self.handyman.refresh_from_db()
        self.admin_user.refresh_from_db()
        self.assertEqual(self.client_user.wallet_balance, Decimal("289.40"))
        self.assertEqual(self.handyman.wallet_balance, Decimal("150.00"))
        self.assertEqual(self.admin_user.wallet_balance, Decimal("30.00"))