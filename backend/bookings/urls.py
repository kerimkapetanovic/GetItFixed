from django.urls import path
from .views import (
    ExpireBookingView,
    HandymanBusySlotsView,
    HandymanDashboardView, 
    AcceptJobView, 
    HandymanNegotiationActionView,
    CreateBookingView, 
    ClientRequestsView, 
    BookingDetailView,
    ClientNegotiationActionView,
    TicketTrackingView,
    JobStatusCheckView,   # DODAJ
    CompleteBookingView,  # DODAJ
)

urlpatterns = [
    path('dashboard/', HandymanDashboardView.as_view(), name='handyman-dashboard'),
    path('accept/<int:booking_id>/', AcceptJobView.as_view(), name='accept-job'),
    
    path('<int:booking_id>/expire/', ExpireBookingView.as_view(), name='expire-booking'),
    path('<int:booking_id>/handyman-action/', HandymanNegotiationActionView.as_view(), name='handyman-negotiation-action'),
    path('<int:booking_id>/client-action/', ClientNegotiationActionView.as_view(), name='client-negotiation-action'),
    path('<int:booking_id>/status-check/', JobStatusCheckView.as_view(), name='job-status-check'),   # NOVO
    path('<int:booking_id>/complete/', CompleteBookingView.as_view(), name='job-complete'),           # NOVO
    
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('my-requests/', ClientRequestsView.as_view(), name='my-requests'),
    path('tickets/<str:ticket_id>/', TicketTrackingView.as_view(), name='ticket-detail'),
    path('busy-slots/<int:handyman_id>/', HandymanBusySlotsView.as_view()),

    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
]