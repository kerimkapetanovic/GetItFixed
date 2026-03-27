from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Promijeni .path u .urls
    path('admin/', admin.site.urls), 
    path('api/accounts/', include('accounts.urls')),
    path('api/services/', include('services.urls')),
    path('api/bookings/', include('bookings.urls')),
]