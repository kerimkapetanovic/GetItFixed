from datetime import timedelta
from django.utils import timezone
from django.db import models
from django.conf import settings
from decimal import Decimal
from .storage import BookingAttachmentStorage


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),   # NOVO — termin je počeo
        ('visit_completed', 'Visit Completed'),
        ('visit_fee_pending', 'Visit Fee Pending'),
        ('visit_fee_paid', 'Visit Fee Paid'),
        ('quote_pending_client', 'Quote Pending Client'),
        ('funds_locked', 'Funds Locked'),
        ('handyman_done', 'Handyman Done'), # NOVO — majstor kliknuo "Job Finished"
        ('not_completed', 'Not Completed'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('paid', 'Paid'),
        ('closed', 'Closed'),
        ('completed', 'Completed'),  # legacy terminal state
        ('cancelled', 'Cancelled'),
    )
    QUOTE_STATUS_CHOICES = (
        ('none', 'None'),
        ('draft', 'Draft'),
        ('pending_client', 'Pending Client Decision'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('countered', 'Countered'),
        ('expired', 'Expired'),
    )
    NEGOTIATION_STATUS_CHOICES = (
        ('none', 'None'),
        ('awaiting_handyman', 'Awaiting Handyman'),
        ('awaiting_client', 'Awaiting Client'),
        ('agreed', 'Agreed'),
        ('declined', 'Declined'),
    )
    HANDYMAN_RESPONSE_PHASE_CHOICES = (
        ('before_client_time', 'Before client proposed time'),
        ('after_client_time', 'After client proposed time'),
        ('negotiation', 'Counter-offer negotiation'),
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
    handyman_response_phase = models.CharField(
        max_length=30,
        choices=HANDYMAN_RESPONSE_PHASE_CHOICES,
        default='before_client_time',
    )
    knows_fix = models.BooleanField(null=True, blank=True) 
    handyman_marked_done_at = models.DateTimeField(null=True, blank=True)
    visit_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    visit_fee_paid_at = models.DateTimeField(null=True, blank=True)
    continue_job_requested = models.BooleanField(default=False)
    continue_job_confirmed = models.BooleanField(null=True, blank=True)
    job_continued_at = models.DateTimeField(null=True, blank=True)
    quote_status = models.CharField(
        max_length=20,
        choices=QUOTE_STATUS_CHOICES,
        default='none',
    )
    quote_locked_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    funds_locked_at = models.DateTimeField(null=True, blank=True)
    
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


class Quote(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending_client', 'Pending Client Decision'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('countered', 'Countered'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='quotes')
    handyman = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_quotes',
    )
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal_materials = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    subtotal_labor = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    subtotal_other = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    proposed_visit_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    client_decision_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('booking', 'version')

    def __str__(self):
        return f"Quote v{self.version} for booking {self.booking_id}"


class QuoteLineItem(models.Model):
    CATEGORY_CHOICES = (
        ('materials', 'Materials'),
        ('labor', 'Labor/Handiwork'),
        ('other', 'Other'),
    )

    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='line_items')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("1.00"))
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    line_total = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'id']

    def save(self, *args, **kwargs):
        self.line_total = (self.quantity or Decimal("0.00")) * (self.unit_price or Decimal("0.00"))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category}: {self.description}"


class BookingAttachment(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(
        storage=BookingAttachmentStorage(),
        upload_to='%Y/%m/'
    )
    file_type = models.CharField(max_length=10)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class EscrowHold(models.Model):
    PURPOSE_CHOICES = (
        ('visit_fee', 'Visit Fee'),
        ('quote', 'Quote'),
    )
    STATUS_CHOICES = (
        ('locked', 'Locked'),
        ('released', 'Released'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='escrow_holds')
    quote = models.ForeignKey(Quote, on_delete=models.SET_NULL, null=True, blank=True, related_name='escrow_holds')
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='escrow_locks_made',
    )
    handyman = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='escrow_locks_received',
    )
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES, default='quote')
    handyman_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    app_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    pdv_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='locked')
    reason = models.CharField(max_length=255, blank=True, null=True)
    locked_at = models.DateTimeField(default=timezone.now)
    released_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Escrow {self.id} for booking {self.booking_id} ({self.status})"


class WalletTransaction(models.Model):
    TX_TYPE_CHOICES = (
        ('credit', 'Credit'),
        ('debit', 'Debit'),
        ('lock', 'Lock'),
        ('unlock', 'Unlock'),
        ('release', 'Release'),
        ('refund', 'Refund'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wallet_transactions')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='wallet_transactions')
    escrow_hold = models.ForeignKey(EscrowHold, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    tx_type = models.CharField(max_length=20, choices=TX_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_before = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    balance_after = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    note = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.tx_type} {self.amount} for user {self.user_id}"

class Review(models.Model):
    booking = models.OneToOneField(
        Booking, 
        on_delete=models.CASCADE, 
        related_name='review'
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews_given'
    )
    handyman = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='reviews_received'
    )
    rating = models.PositiveIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        help_text="Ocjena od 1 do 5"
    )
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review for {self.handyman.username} by {self.client.username} ({self.rating}/5)"