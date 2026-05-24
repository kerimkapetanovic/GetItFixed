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
    JobStatusCheckView,
    CompleteBookingView,
    ContinueJobView,
    CreateQuoteView,
    LatestQuoteView,
    QuoteClientActionView,
    EscrowStatusView,
    # Task C1: Admin View Imports
    AdminTrackingListView,
    AdminVerificationQueueView,
    AdminVerifyUserActionView,
    AdminServicesManagementView,
    AdminFinancesLedgerView,
)

urlpatterns = [
    # --- HANDYMAN/CLIENT WORKFLOW ENDPOINTS ---
    path('dashboard/', HandymanDashboardView.as_view(), name='handyman-dashboard'),
    path('accept/<int:booking_id>/', AcceptJobView.as_view(), name='accept-job'),
    
    path('<int:booking_id>/expire/', ExpireBookingView.as_view(), name='expire-booking'),
    path('<int:booking_id>/handyman-action/', HandymanNegotiationActionView.as_view(), name='handyman-negotiation-action'),
    path('<int:booking_id>/client-action/', ClientNegotiationActionView.as_view(), name='client-negotiation-action'),
    path('<int:booking_id>/status-check/', JobStatusCheckView.as_view(), name='job-status-check'),
    path('<int:booking_id>/complete/', CompleteBookingView.as_view(), name='job-complete'),
    path('<int:booking_id>/continue-job/', ContinueJobView.as_view(), name='continue-job'),
    path('<int:booking_id>/quotes/', CreateQuoteView.as_view(), name='create-quote'),
    path('<int:booking_id>/quotes/latest/', LatestQuoteView.as_view(), name='latest-quote'),
    path('<int:booking_id>/quotes/<int:quote_id>/client-action/', QuoteClientActionView.as_view(), name='quote-client-action'),
    path('<int:booking_id>/escrow/', EscrowStatusView.as_view(), name='escrow-status'),
    
    path('create/', CreateBookingView.as_view(), name='create-booking'),
    path('my-requests/', ClientRequestsView.as_view(), name='my-requests'),
    path('tickets/<str:ticket_id>/', TicketTrackingView.as_view(), name='ticket-detail'),
    path('busy-slots/<int:handyman_id>/', HandymanBusySlotsView.as_view()),

    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    # --- TASK C1: ADMIN MANAGEMENT CORE ENDPOINTS ---
    path('admin/tracking/', AdminTrackingListView.as_view(), name='admin-tracking'),
    path('admin/verification/', AdminVerificationQueueView.as_view(), name='admin-verification'),
    path('admin/verification/<int:user_id>/action/', AdminVerifyUserActionView.as_view(), name='admin-verify-action'),
    path('admin/services/', AdminServicesManagementView.as_view(), name='admin-services'),
    path('admin/finances/', AdminFinancesLedgerView.as_view(), name='admin-finances'),
]