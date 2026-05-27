from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from bookings.models import Booking, Quote, EscrowHold
from django.contrib.auth import get_user_model

User = get_user_model()

class Phase2E2ETests(APITestCase):
    def setUp(self):
        # Added unique emails here
        self.client_user = User.objects.create_user(
            username="client", 
            email="client@test.com", # Added
            password="password", 
            role="client"
        )
        self.client_user.wallet_balance = Decimal('500.00')
        self.client_user.save()
        
        self.handyman = User.objects.create_user(
            username="handyman", 
            email="handy@test.com", # Added
            password="password", 
            role="handyman"
        )
        self.handyman.wallet_balance = Decimal('0.00')
        self.handyman.save()

        self.booking = Booking.objects.create(
            client=self.client_user,
            handyman=self.handyman,
            status="in_progress",
            description="Fixing the pipe"
        )

    def test_full_happy_path(self):
        # 1. Handyman completes visit
        self.client.force_authenticate(user=self.handyman)
        self.client.post(f'/api/bookings/{self.booking.id}/visit-complete/')
        
        # 2. Client continues job
        self.client.force_authenticate(user=self.client_user)
        self.client.post(f'/api/bookings/{self.booking.id}/continue-job/', {"continue_job": True})
        
        # 3. Handyman submits quote
        self.client.force_authenticate(user=self.handyman)
        self.client.post(f'/api/bookings/{self.booking.id}/quotes/', {
            "line_items": [{"category": "labor", "description": "Fixing", "quantity": 1, "unit_price": 100}]
        }, format='json')
        
        # 4. Client accepts
        quote = Quote.objects.get(booking=self.booking)
        self.client.force_authenticate(user=self.client_user)
        self.client.post(f'/api/bookings/{self.booking.id}/quotes/{quote.id}/client-action/', {"action": "accept"})
        
        # 5. Verify Escrow locked
        self.assertTrue(EscrowHold.objects.filter(booking=self.booking, status="locked").exists())
        
        # 6. Client releases payment
        self.client.post(f'/api/bookings/{self.booking.id}/complete/', {"action": "pay"})
        
        # 7. Final assertions
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "paid")
        self.client_user.refresh_from_db()
        self.handyman.refresh_from_db()
        self.assertEqual(self.client_user.wallet_balance, Decimal('400.00'))
        self.assertEqual(self.handyman.wallet_balance, Decimal('100.00'))