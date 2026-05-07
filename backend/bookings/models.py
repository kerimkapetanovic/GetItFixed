from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.conf import settings
from decimal import Decimal

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),   # NOVO — termin je počeo
        ('handyman_done', 'Handyman Done'), # NOVO — majstor kliknuo "Job Finished"
        ('not_completed', 'Not Completed'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('paid', 'Paid'),
        ('closed', 'Closed'),
        ('completed', 'Completed'),  # legacy terminal state
        ('cancelled', 'Cancelled'),
    )
    NEGOTIATION_STATUS_CHOICES = (
        ('none', 'None'),
        ('awaiting_handyman', 'Awaiting Handyman'),
        ('awaiting_client', 'Awaiting Client'),
        ('agreed', 'Agreed'),
        ('declined', 'Declined'),
    )
    
    # Core Fields
    ticket_id = models.CharField(max_length=20, unique=True, editable=False, null=True, blank=True)
    is_urgent = models.BooleanField(default=False) # Nova logika za hitnost

    
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
    service_type = models.CharField(max_length=50)
    description = models.TextField()
    
    # Scheduling & Negotiation
    scheduled_time = models.DateTimeField(null=True, blank=True) 
    client_proposed_time = models.DateTimeField(null=True, blank=True)
    client_counter_message = models.TextField(blank=True, null=True)
    handyman_proposed_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True) 
    handyman_counter_message = models.TextField(blank=True, null=True)
    client_confirmed_done_at = models.DateTimeField(null=True, blank=True)  # NOVO
    agreed_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Price (KM) fixed when the handyman accepts or counters.",
    )
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    last_action_by = models.CharField(
        max_length=10, 
        choices=[('client', 'Client'), ('handyman', 'Handyman')], 
        default='client'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    knows_fix = models.BooleanField(null=True, blank=True) 
    handyman_marked_done_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    negotiation_status = models.CharField(
        max_length=30,
        choices=NEGOTIATION_STATUS_CHOICES,
        default='none'
    )

    def save(self, *args, **kwargs):
        # 1. Ticket ID Generation
        if not self.ticket_id:
            last_booking = Booking.objects.all().order_by('id').last()
            if last_booking and last_booking.ticket_id:
                try:
                    last_id = int(last_booking.ticket_id.split('-')[1])
                    new_id = f"GIT-{str(last_id + 1).zfill(5)}"
                    while Booking.objects.filter(ticket_id=new_id).exists():
                        last_id += 1
                        new_id = f"GIT-{str(last_id + 1).zfill(5)}"
                    self.ticket_id = new_id
                except (ValueError, IndexError):
                    self.ticket_id = "GIT-00001"
            else:
                self.ticket_id = "GIT-00001"

        # 2. Expiration Logic: Urgent tickets expire faster
        if not self.pk and not self.expires_at:
            if self.is_urgent:
                # Urgent requests must be handled within 30 minutes
                self.expires_at = timezone.now() + timedelta(minutes=30)
            else:
                # Standard requests have a 3-hour window
                self.expires_at = timezone.now() + timedelta(hours=3)

        super().save(*args, **kwargs)

    def get_estimated_price(self):
        """Uses agreed_price when set; otherwise hourly rate × duration (urgent ×1.5)."""
        if self.agreed_price is not None:
            return float(self.agreed_price)
        if self.handyman and getattr(self.handyman, "hourly_rate", None):
            base_hourly_rate = int(self.handyman.hourly_rate)
        else:
            base_hourly_rate = 30
        duration_hours = (self.duration_minutes / 60) if self.duration_minutes else 1
        total = float(base_hourly_rate) * float(duration_hours)

        if self.is_urgent:
            return total * 1.5
        return total

    def get_payment_amount_decimal(self) -> Decimal:
        """Wallet debit amount: agreed_price when set, else same basis as get_estimated_price."""
        if self.agreed_price is not None:
            return self.agreed_price.quantize(Decimal("0.01"))
        return Decimal(str(self.get_estimated_price())).quantize(Decimal("0.01"))

    def __str__(self):
        client_name = self.client.first_name if self.client.first_name else self.client.email
        urgent_tag = "[URGENT] " if self.is_urgent else ""
        return f"{urgent_tag}{self.service_type} for {client_name} - {self.status}"
    
    @staticmethod
    def is_timeslot_available(handyman, start_time, duration_minutes, exclude_booking_id=None):
        if not handyman or not start_time or not duration_minutes:
            return True 
        
        new_start = start_time
        # Using 30 min buffer as per your design documentation
        new_end_with_buffer = new_start + timedelta(minutes=int(duration_minutes) + 30)
        
        overlapping_jobs = Booking.objects.filter(
            handyman=handyman,
            status='accepted'
        ).exclude(id=exclude_booking_id)

        for job in overlapping_jobs:
            if not job.scheduled_time or not job.duration_minutes:
                continue
                
            job_start = job.scheduled_time
            job_end_with_buffer = job_start + timedelta(minutes=job.duration_minutes + 30)
            
            if new_start < job_end_with_buffer and new_end_with_buffer > job_start:
                return False 
                
        return True