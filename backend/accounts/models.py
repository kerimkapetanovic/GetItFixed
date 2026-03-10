from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Definisanje uloga (roles)
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('handyman', 'Handyman'),
        ('admin', 'Administrator'),
    )
    
    # Osnovna polja koja si naveo
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='client')
    service_type = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Lokacija
    county = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)

    # Django vec ima first_name, last_name, email i password u AbstractUser, 
    # tako da ih ne moramo ponovo pisati, ali mozemo dodati email kao obavezan
    email = models.EmailField(unique=True)
    USERNAME_FIELD = 'email'       # Ovo kaže Djangu: "Email je sada glavni za login"
    REQUIRED_FIELDS = ['username']

    # Koristimo email za login umjesto username-a (opcionalno, ali preporuceno za moderne aplikacije)
    # USERNAME_FIELD = 'email' 
    # REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"