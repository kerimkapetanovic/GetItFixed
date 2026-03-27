from django.db import models
from django.conf import settings

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),   # Request is live, no handyman yet
        ('accepted', 'Accepted'), # Handyman has claimed it
        ('completed', 'Completed'),
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='client_bookings'
    )
    handyman = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='handyman_jobs'
    )
    service_type = models.CharField(max_length=50) # e.g., 'plumbing'
    description = models.TextField()
    
    # UPDATED: Added null=True and blank=True so this field is no longer required
    scheduled_time = models.DateTimeField(null=True, blank=True) 
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        # Added a fallback for first_name just in case it's empty
        client_name = self.client.first_name if self.client.first_name else self.client.email
        return f"{self.service_type} for {client_name} - {self.status}"