from django.db import models
from django.conf import settings

class HandymanProfile(models.Model):
    # Links to the User model your friend made in 'accounts'
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='handyman_profile')
    
    # Extra fields for the marketplace
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    jobs_completed = models.IntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} Profile"