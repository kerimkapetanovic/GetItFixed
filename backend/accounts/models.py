from django.contrib.auth.models import AbstractUser
from django.db import models
from decimal import Decimal

class User(AbstractUser):
    # Defining roles
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('handyman', 'Handyman'),
        ('admin', 'Administrator'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    service_type = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Location
    county = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)

    # NEW: Handyman specific stats for the UI
    # Using DecimalField for rating (e.g., 4.8) and Integer for hourly rate
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5.0)
    hourly_rate = models.IntegerField(default=30)
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.TextField(blank=True, null=True)  # čuva Supabase URL kao string
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    terms_accepted = models.BooleanField(default=False)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    wallet_locked_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Email as primary identifier
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    @property
    def wallet_available_balance(self) -> Decimal:
        """Amount that can be spent right now (total minus locked)."""
        total = self.wallet_balance or Decimal("0.00")
        locked = self.wallet_locked_balance or Decimal("0.00")
        available = total - locked
        if available < Decimal("0.00"):
            return Decimal("0.00")
        return available

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"