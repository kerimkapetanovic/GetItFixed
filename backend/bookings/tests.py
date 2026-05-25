from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from bookings.models import Booking, Quote, EscrowHold
from decimal import Decimal

User = get_user_model()

class Phase2EscrowLifecycleTests(APITestCase):
    def setUp(self):
        # 1. Create our test actors
        self.client_user = User.objects.create_user(
            username="client_test",
            email="client@test.com", 
            password="Password123!", 
            role="client"
        )
        self.client_user.wallet_balance = Decimal('200.00') # Total Equity
        self.client_user.save()

        self.handyman_user = User.objects.create_user(
            username="handyman_test",
            email="handy@test.com", 
            password="Password123!", 
            role="handyman"
        )
        self.handyman_user.wallet_balance = Decimal('0.00')
        self.handyman_user.save()

        self.admin_user = User.objects.create_superuser(
            username="admin_test",
            email="admin@test.com", 
            password="Password123!", 
            role="admin"
        )

        # 2. Create a booking at the visit fee stage
        self.booking = Booking.objects.create(
            client=self.client_user,
            handyman=self.handyman_user,
            service_type="plumbing",
            status="visitFeePaid", 
            description="Fixing the main pipe"
        )

    def test_handyman_can_create_quote(self):
        """Ensure handymen can draft quotes only after client approves."""
        self.booking.continue_job_confirmed = True
        self.booking.save()

        self.client.force_authenticate(user=self.handyman_user)
        payload = {
            "total_amount": 100.00,
            "description": "Full pipe replacement",
            "line_items": [
                {"category": "Materials", "description": "PVC Pipes", "unit_price": 50.00, "quantity": 1},
                {"category": "Labor", "description": "Labor hours", "unit_price": 25.00, "quantity": 2}
            ]
        }
        
        response = self.client.post(f'/api/bookings/{self.booking.id}/quotes/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "quote_pending_client")

    def test_client_cannot_create_quote(self):
        """Ensure clients get a 403 Forbidden if they try to quote themselves."""
        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(f'/api/bookings/{self.booking.id}/quotes/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_escrow_lock_on_quote_acceptance(self):
        """Ensure accepting a quote safely creates an EscrowHold ledger entry."""
        self.booking.continue_job_confirmed = True
        self.booking.status = "quote_pending_client"
        self.booking.save()

        quote = Quote.objects.create(
            booking=self.booking,
            handyman=self.handyman_user, 
            total_amount=Decimal('100.00'),
            status="pending"
        )

        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(f'/api/bookings/{self.booking.id}/quotes/{quote.id}/client-action/', {
            "action": "accept",
            "status": "accepted"
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 3. Verify Balances Escrowed using the Ledger
        self.client_user.refresh_from_db()
        self.booking.refresh_from_db()
        
        # Verify money wasn't destroyed
        self.assertEqual(self.client_user.wallet_balance, Decimal('200.00')) 
        self.assertEqual(self.booking.status, "funds_locked") 
        
        # The ultimate source of truth: The Escrow Ledger Record exists
        self.assertTrue(EscrowHold.objects.filter(booking=self.booking, amount=Decimal('100.00'), status="locked").exists())

    def test_insufficient_funds_prevents_lock(self):
        """Ensure the backend blocks quote acceptance if the wallet is too low."""
        self.booking.continue_job_confirmed = True
        self.booking.status = "quote_pending_client"
        self.booking.save()

        quote = Quote.objects.create(
            booking=self.booking,
            handyman=self.handyman_user, 
            total_amount=Decimal('500.00'), 
            status="pending"
        )

        self.client.force_authenticate(user=self.client_user)
        response = self.client.post(f'/api/bookings/{self.booking.id}/quotes/{quote.id}/client-action/', {
            "action": "accept",
            "status": "accepted"
        })
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        self.client_user.refresh_from_db()
        self.assertEqual(self.client_user.wallet_balance, Decimal('200.00'))