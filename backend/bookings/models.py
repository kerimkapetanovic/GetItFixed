from django.db import models
from django.conf import settings

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),   
        ('accepted', 'Accepted'), 
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    NEGOTIATION_STATUS_CHOICES = (
        ('none', 'None'),
        ('awaiting_handyman', 'Awaiting Handyman'),
        ('awaiting_client', 'Awaiting Client'),
        ('agreed', 'Agreed'),
        ('declined', 'Declined'),
    )
    ticket_id = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)

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
    client_proposed_time = models.DateTimeField(null=True, blank=True)
    client_counter_message = models.TextField(blank=True, null=True)
    handyman_proposed_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True) 
    handyman_counter_message = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    negotiation_status = models.CharField(
        max_length=30,
        choices=NEGOTIATION_STATUS_CHOICES,
        default='none'
    )
    def save(self, *args, **kwargs):
        if not self.ticket_id:
            last_booking = Booking.objects.all().order_by('id').last()
            if not last_booking:
                new_id = 1
            else:
                new_id = last_booking.id + 1
            
            self.ticket_id = f"GIT-{new_id:05d}"
            
        super(Booking, self).save(*args, **kwargs)

    def __str__(self):
        # Added a fallback for first_name just in case it's empty
        client_name = self.client.first_name if self.client.first_name else self.client.email
        return f"{self.service_type} for {client_name} - {self.status}"