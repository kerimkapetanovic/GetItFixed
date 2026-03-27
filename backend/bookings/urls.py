from django.urls import path
from .views import (
    HandymanDashboardView, 
    AcceptJobView, 
    CreateBookingView, 
    ClientRequestsView, 
    BookingDetailView # <--- ADDED THIS HERE
)

urlpatterns = [
    path('dashboard/', HandymanDashboardView.as_view(), name='handyman-dashboard'),
    path('accept/<int:booking_id>/', AcceptJobView.as_view(), name='accept-job'),
    
    # NEW: The route for clients to post a job
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    
    # NEW: The route for fetching the client's own requests
    path('my-requests/', ClientRequestsView.as_view(), name='my-requests'),
    
    # NEW: The route for a single job's details
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
]