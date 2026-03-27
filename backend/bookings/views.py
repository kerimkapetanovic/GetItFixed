from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model # Required to link the Handyman

from .models import Booking
from .serializers import BookingSerializer
from accounts.authentication import CookieTokenAuthentication 

User = get_user_model()

# --- HANDYMAN VIEWS ---

@method_decorator(csrf_exempt, name='dispatch')
class HandymanDashboardView(generics.ListAPIView):
    """Returns jobs matching the handyman's specialty or jobs they've accepted."""
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Booking.objects.none()

        # Show pending jobs in their category OR jobs already assigned to them
        return Booking.objects.filter(
            status='pending', 
            service_type=user.service_type
        ) | Booking.objects.filter(
            handyman=user, 
            status='accepted'
        )

@method_decorator(csrf_exempt, name='dispatch')
class AcceptJobView(APIView):
    """Allows a handyman to manually claim a 'pending' job."""
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, status='pending')
            booking.handyman = request.user
            booking.status = 'accepted'
            booking.save()
            return Response({"message": "Job accepted successfully!"}, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({"error": "Job not available"}, status=status.HTTP_404_NOT_FOUND)


# --- CLIENT VIEWS ---

@method_decorator(csrf_exempt, name='dispatch')
class CreateBookingView(generics.CreateAPIView):
    """Handles creating a new job, supporting both direct and general requests."""
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # 1. Check if a specific handyman was targeted via the 'Book This Expert' button
        handyman_id = self.request.data.get('handyman_id')
        handyman = None
        final_status = 'pending'

        if handyman_id:
            try:
                # 2. Find the handyman and auto-accept the job if found
                handyman = User.objects.get(id=handyman_id)
                final_status = 'accepted'
                print(f"--- DIRECT BOOKING: {handyman.email} assigned to Job ---")
            except User.DoesNotExist:
                print(f"--- WARNING: Handyman ID {handyman_id} not found, defaulting to pending ---")

        # 3. Save the booking with the client and current status
        print(f"--- NEW JOB CREATED BY: {self.request.user.email} ---")
        serializer.save(
            client=self.request.user, 
            handyman=handyman,
            status=final_status
        )

@method_decorator(csrf_exempt, name='dispatch')
class ClientRequestsView(generics.ListAPIView):
    """Shows the user all the jobs they have personally requested."""
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user).order_by('-id')

class BookingDetailView(generics.RetrieveAPIView):
    """Fetches details for a single specific booking."""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]