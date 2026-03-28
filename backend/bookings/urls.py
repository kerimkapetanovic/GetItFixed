from django.urls import path
from .views import (
    HandymanDashboardView, 
    AcceptJobView, 
    HandymanNegotiationActionView,
    CreateBookingView, 
    ClientRequestsView, 
    BookingDetailView,
    ClientNegotiationActionView,
)

urlpatterns = [
    path('dashboard/', HandymanDashboardView.as_view(), name='handyman-dashboard'),
    path('accept/<int:booking_id>/', AcceptJobView.as_view(), name='accept-job'),
    path('<int:booking_id>/handyman-action/', HandymanNegotiationActionView.as_view(), name='handyman-negotiation-action'),
    
    # NEW: The route for clients to post a job
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    
    # NEW: The route for fetching the client's own requests
    path('my-requests/', ClientRequestsView.as_view(), name='my-requests'),
    
    # NEW: The route for a single job's details
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:booking_id>/client-action/', ClientNegotiationActionView.as_view(), name='client-negotiation-action'),
]