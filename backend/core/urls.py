from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Promijeni .path u .urls
    path('admin/', admin.site.urls), 
    path('api/accounts/', include('accounts.urls')),
]