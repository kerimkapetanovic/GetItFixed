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
)
urlpatterns = [
    path('dashboard/', HandymanDashboardView.as_view(), name='handyman-dashboard'),
    path('accept/<int:booking_id>/', AcceptJobView.as_view(), name='accept-job'),
    
    # POMJERI OVE TRI RUTE IZNAD <int:pk>/
    path('<int:booking_id>/expire/', ExpireBookingView.as_view(), name='expire-booking'),
    path('<int:booking_id>/handyman-action/', HandymanNegotiationActionView.as_view(), name='handyman-negotiation-action'),
    path('<int:booking_id>/client-action/', ClientNegotiationActionView.as_view(), name='client-negotiation-action'),
    
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('my-requests/', ClientRequestsView.as_view(), name='my-requests'),
    path('tickets/<str:ticket_id>/', TicketTrackingView.as_view(), name='ticket-detail'),
    path('busy-slots/<int:handyman_id>/', HandymanBusySlotsView.as_view()),

    # OVA MORA BITI ZADNJA jer je najopštija
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
]