from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from services.views import AIHelperView

urlpatterns = [
    # Promijeni .path u .urls
    path('admin/', admin.site.urls), 
    path("api/ai-helper/", AIHelperView.as_view(), name="ai-helper"),
    path('api/accounts/', include('accounts.urls')),
    path('api/services/', include('services.urls')),
    path('api/bookings/', include('bookings.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)