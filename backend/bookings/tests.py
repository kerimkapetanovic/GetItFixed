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
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@getitfixed.com",
            password="Password123!",
            role="admin",
        )
        self.admin_user.wallet_balance = Decimal("0.00")
        self.admin_user.wallet_locked_balance = Decimal("0.00")
        self.admin_user.save()

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
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("42.12"))
        self.assertTrue(
            EscrowHold.objects.filter(
                booking=self.booking,
                purpose="visit_fee",
                amount=Decimal("42.12"),
                status="locked",
            ).exists()
        )

        hold = EscrowHold.objects.get(booking=self.booking, purpose="visit_fee", status="locked")
        self.assertEqual(hold.handyman_amount, Decimal("30.00"))
        self.assertEqual(hold.app_fee_amount, Decimal("6.00"))
        self.assertEqual(hold.pdv_amount, Decimal("6.12"))

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
        self.admin_user.refresh_from_db()
        self.assertEqual(self.booking.status, "visit_fee_paid")
        self.assertEqual(self.client_user.wallet_balance, Decimal("257.88"))
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("0.00"))
        self.assertEqual(self.handyman_user.wallet_balance, Decimal("30.00"))
        self.assertEqual(self.admin_user.wallet_balance, Decimal("6.00"))

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
        self.admin_user.refresh_from_db()
        self.assertEqual(self.booking.status, "paid")
        self.assertEqual(self.client_user.wallet_balance, Decimal("159.60"))
        self.assertEqual(self.client_user.wallet_locked_balance, Decimal("42.12"))
        self.assertEqual(self.handyman_user.wallet_balance, Decimal("100.00"))
        self.assertEqual(self.admin_user.wallet_balance, Decimal("20.00"))

    def test_handyman_cannot_mark_done_before_second_visit_starts(self):
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

        self.client.force_authenticate(user=self.handyman_user)
        mark_done = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "mark_done"},
            format="json",
        )
        self.assertEqual(mark_done.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("in_progress", str(mark_done.data.get("error", "")))

    def _close_booking_with_quote(self):
        self.client.force_authenticate(user=self.client_user)
        self.client.post(f"/api/bookings/{self.booking.id}/client-action/", {"action": "accept"}, format="json")

        self.booking.status = "handyman_done"
        self.booking.handyman_marked_done_at = timezone.now()
        self.booking.save(update_fields=["status", "handyman_marked_done_at", "updated_at"])

        self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "confirm_done"},
            format="json",
        )
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "visit_fee_paid")

        self.client.post(
            f"/api/bookings/{self.booking.id}/continue-job/",
            {"continue_job": True},
            format="json",
        )

        self.client.force_authenticate(user=self.handyman_user)
        quote_response = self.client.post(
            f"/api/bookings/{self.booking.id}/quotes/",
            {
                "line_items": [
                    {
                        "category": "materials",
                        "description": "Tiles (30 pieces)",
                        "quantity": 30,
                        "unit_price": 2,
                    },
                    {
                        "category": "labor",
                        "description": "Assistant",
                        "quantity": 1,
                        "unit_price": 50,
                    },
                ],
                "proposed_visit_time": (timezone.now() + timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(quote_response.status_code, status.HTTP_201_CREATED)
        quote = Quote.objects.get(id=quote_response.data["id"])

        self.client.force_authenticate(user=self.client_user)
        accept_quote = self.client.post(
            f"/api/bookings/{self.booking.id}/quotes/{quote.id}/client-action/",
            {"action": "accept"},
            format="json",
        )
        self.assertEqual(accept_quote.status_code, status.HTTP_200_OK)

        self.booking.refresh_from_db()
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
        self.assertEqual(self.booking.status, "paid")

        self.client.force_authenticate(user=self.handyman_user)
        acknowledge = self.client.post(
            f"/api/bookings/{self.booking.id}/complete/",
            {"action": "acknowledge_payment"},
            format="json",
        )
        self.assertEqual(acknowledge.status_code, status.HTTP_200_OK)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "closed")

    def test_closed_booking_invoice_json_has_phase1_and_phase2_items(self):
        self._close_booking_with_quote()

        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(f"/api/bookings/{self.booking.id}/invoice/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ticket_id"], self.booking.ticket_id)
        self.assertEqual(response.data["currency"], "KM")
        self.assertEqual(response.data["status"], "closed")
        self.assertEqual(len(response.data["phase1_items"]), 1)
        self.assertEqual(len(response.data["phase2_items"]), 2)
        self.assertEqual(Decimal(response.data["subtotal_phase1"]), Decimal("30.00"))
        self.assertEqual(Decimal(response.data["subtotal_phase1_app_fee"]), Decimal("6.00"))
        self.assertEqual(Decimal(response.data["subtotal_phase1_pdv"]), Decimal("6.12"))
        self.assertEqual(Decimal(response.data["subtotal_phase1_total"]), Decimal("42.12"))
        self.assertEqual(Decimal(response.data["subtotal_phase2"]), Decimal("110.00"))
        self.assertEqual(Decimal(response.data["subtotal_phase2_app_fee"]), Decimal("22.00"))
        self.assertEqual(Decimal(response.data["subtotal_phase2_pdv"]), Decimal("22.44"))
        self.assertEqual(Decimal(response.data["subtotal_phase2_total"]), Decimal("154.44"))
        self.assertEqual(Decimal(response.data["total_handyman_amount"]), Decimal("140.00"))
        self.assertEqual(Decimal(response.data["total_app_fee_amount"]), Decimal("28.00"))
        self.assertEqual(Decimal(response.data["total_pdv_amount"]), Decimal("28.56"))
        self.assertEqual(Decimal(response.data["grand_total"]), Decimal("196.56"))

    def test_closed_booking_invoice_pdf_and_access_guards(self):
        self._close_booking_with_quote()

        self.client.force_authenticate(user=self.handyman_user)
        forbidden = self.client.get(f"/api/bookings/{self.booking.id}/invoice/")
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.client_user)
        pdf_response = self.client.get(f"/api/bookings/{self.booking.id}/invoice/pdf/")
        self.assertEqual(pdf_response.status_code, status.HTTP_200_OK)
        self.assertEqual(pdf_response["Content-Type"], "application/pdf")
        self.assertIn("attachment;", pdf_response["Content-Disposition"])
        self.assertGreater(len(pdf_response.content), 200)

        open_booking = Booking.objects.create(
            client=self.client_user,
            handyman=self.handyman_user,
            service_type="electrical",
            description="Light repair",
            status="accepted",
            negotiation_status="agreed",
            agreed_price=Decimal("20.00"),
            scheduled_time=timezone.now() + timedelta(hours=1),
        )
        closed_only = self.client.get(f"/api/bookings/{open_booking.id}/invoice/")
        self.assertEqual(closed_only.status_code, status.HTTP_400_BAD_REQUEST)