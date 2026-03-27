from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    # This shows you a nice overview of all jobs in the system
    list_display = ('id', 'client_name', 'handyman_name', 'service_type', 'status', 'scheduled_time')
    list_filter = ('status', 'service_type')
    search_fields = ('client__email', 'handyman__email', 'description')

    def client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"
    
    def handyman_name(self, obj):
        if obj.handyman:
            return f"{obj.handyman.first_name} {obj.handyman.last_name}"
        return "Unassigned"