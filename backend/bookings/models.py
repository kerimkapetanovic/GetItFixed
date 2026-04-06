from datetime import timedelta

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
    # Primjer logike unutar save metode
    def save(self, *args, **kwargs):
        if not self.ticket_id:
            last_booking = Booking.objects.all().order_by('id').last()
            if last_booking and last_booking.ticket_id:
                # Izvuci broj, povećaj ga i provjeri u petlji dok ne nađeš slobodan
                last_id = int(last_booking.ticket_id.split('-')[1])
                new_id = f"GIT-{str(last_id + 1).zfill(5)}"
                while Booking.objects.filter(ticket_id=new_id).exists():
                    last_id += 1
                    new_id = f"GIT-{str(last_id + 1).zfill(5)}"
                self.ticket_id = new_id
            else:
                self.ticket_id = "GIT-00001"
        super().save(*args, **kwargs)

    def __str__(self):
        # Added a fallback for first_name just in case it's empty
        client_name = self.client.first_name if self.client.first_name else self.client.email
        return f"{self.service_type} for {client_name} - {self.status}"
    
    @staticmethod
    def is_timeslot_available(handyman, start_time, duration_minutes, exclude_booking_id=None):
        if not handyman or not start_time or not duration_minutes:
            return True # Ako nemamo sve podatke, ne možemo raditi validaciju ovdje
        
        # 1. Izračunaj kraj novog termina + 25 min buffer
        new_start = start_time
        new_end_with_buffer = new_start + timedelta(minutes=int(duration_minutes) + 25)
        
        # 2. Provjeri preklapanja sa POSTOJEĆIM terminima tog majstora
        # Tražimo termine koji su 'accepted' (zauzeti)
        # Buffer od 25 min se dodaje na svaki postojeći termin
        
        overlapping_jobs = Booking.objects.filter(
            handyman=handyman,
            status='accepted'
        ).exclude(id=exclude_booking_id)

        for job in overlapping_jobs:
            if not job.scheduled_time or not job.duration_minutes:
                continue
                
            job_start = job.scheduled_time
            # Dodajemo 25 min buffera na kraj svakog postojećeg posla
            job_end_with_buffer = job_start + timedelta(minutes=job.duration_minutes + 25)
            
            # Logika preklapanja: (StartA < EndB) AND (EndA > StartB)
            if new_start < job_end_with_buffer and new_end_with_buffer > job_start:
                return False # Postoji preklapanje
                
        return True