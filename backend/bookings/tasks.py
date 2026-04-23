from celery import shared_task
from django.utils import timezone
from .models import Booking

@shared_task
def auto_complete_booking(booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        

        if booking.status == 'handyman_done':
            booking.status = 'completed'
            booking.save()
            
    except Booking.DoesNotExist:
        pass