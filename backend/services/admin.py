from django.contrib import admin
from .models import HandymanProfile

@admin.register(HandymanProfile)
class HandymanProfileAdmin(admin.ModelAdmin):
    # This controls which columns you see in the admin list view
    list_display = ('get_full_name', 'get_email', 'hourly_rate', 'rating', 'jobs_completed')
    # This adds a search bar to find handymen by name or email
    search_fields = ('user__first_name', 'user__last_name', 'user__email')

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    get_full_name.short_description = 'Full Name'

    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'