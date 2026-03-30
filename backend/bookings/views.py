from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.dateparse import parse_datetime
from django.contrib.auth import get_user_model # Required to link the Handyman
from django.db.models import Q

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

        # Show open pending jobs in their category and direct jobs waiting on them.
        return Booking.objects.filter(
            Q(status='pending', handyman__isnull=True, service_type=user.service_type)
            | Q(handyman=user, negotiation_status='awaiting_handyman')
            | Q(handyman=user, negotiation_status='awaiting_client')
            | Q(handyman=user, status='accepted')
        ).order_by('-id').distinct()

@method_decorator(csrf_exempt, name='dispatch')
class AcceptJobView(APIView):
    """Allows a handyman to manually claim a 'pending' job."""
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, status='pending')
            
            # 1. Hvatanje duration_minutes iz requesta
            duration = request.data.get('duration_minutes')
            if not duration:
                return Response({"error": "Duration is required."}, status=status.HTTP_400_BAD_REQUEST)

            if booking.handyman and booking.handyman != request.user:
                return Response({"error": "Job is assigned to another handyman."}, status=status.HTTP_403_FORBIDDEN)

            booking.handyman = request.user
            
            # 2. Spremanje trajanja
            booking.duration_minutes = int(duration)

            if booking.negotiation_status == 'awaiting_handyman':
                booking.scheduled_time = booking.client_proposed_time or booking.scheduled_time
                booking.negotiation_status = 'agreed'
            
            booking.status = 'accepted'
            booking.save()
            return Response({"message": "Job accepted successfully!"}, status=status.HTTP_200_OK)
        except Booking.DoesNotExist:
            return Response({"error": "Job not available"}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class HandymanNegotiationActionView(APIView):
    """Allows assigned handyman to accept, decline, or counter direct requests."""
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            # Pronalazimo booking koji pripada ovom majstoru
            booking = Booking.objects.get(id=booking_id, handyman=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        duration = request.data.get('duration_minutes') # Hvatanje sati sa frontenda

        if action not in {'accept', 'decline', 'counter'}:
            return Response(
                {"error": "Action must be one of: accept, decline, counter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. AKCIJA: ACCEPT (Prihvatanje ponude)
        if action == 'accept':
            if not duration:
                return Response({"error": "Duration hours is required to accept a job."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Određujemo finalno vrijeme (ono oko kojeg su se zadnje složili)
            agreed_time = booking.handyman_proposed_time or booking.client_proposed_time or booking.scheduled_time
            
            booking.scheduled_time = agreed_time
            booking.duration_minutes = int(duration) # Spašavamo sate
            booking.status = 'accepted'
            booking.negotiation_status = 'agreed'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        # 2. AKCIJA: DECLINE (Odbijanje ponude)
        if action == 'decline':
            booking.status = 'cancelled'
            booking.negotiation_status = 'declined'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        # 3. AKCIJA: COUNTER (Kontra-ponuda novog vremena i sati)
        if action == 'counter':
            proposed_time_raw = request.data.get('proposed_time')
            proposed_time = parse_datetime(proposed_time_raw) if proposed_time_raw else None
            
            if not proposed_time:
                return Response(
                    {"error": "A valid proposed_time is required for counter action."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            message = (request.data.get('message') or "").strip()
            
            # Ako je majstor poslao i novi duration tokom kontra-ponude, spasi ga
            if duration:
                booking.duration_minutes = int(duration)
            
            booking.handyman_proposed_time = proposed_time
            booking.handyman_counter_message = message or None
            booking.status = 'pending'
            booking.negotiation_status = 'awaiting_client' # Sada klijent mora odgovoriti
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


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
        negotiation_status = 'none'
        client_proposed_time = None

        if handyman_id:
            try:
                # 2. Direct booking starts as awaiting handyman response.
                handyman = User.objects.get(id=handyman_id, role='handyman')
                negotiation_status = 'awaiting_handyman'
                client_proposed_time = serializer.validated_data.get('scheduled_time')
                print(f"--- DIRECT BOOKING: {handyman.email} assigned to Job ---")
            except User.DoesNotExist:
                print(f"--- WARNING: Handyman ID {handyman_id} not found, defaulting to pending ---")

        # 3. Save the booking with the client and current status
        print(f"--- NEW JOB CREATED BY: {self.request.user.email} ---")
        serializer.save(
            client=self.request.user, 
            handyman=handyman,
            service_type=(
                handyman.service_type
                if handyman and handyman.service_type
                else serializer.validated_data.get('service_type') or 'general'
            ),
            status=final_status,
            negotiation_status=negotiation_status,
            client_proposed_time=client_proposed_time,
        )

@method_decorator(csrf_exempt, name='dispatch')
class ClientRequestsView(generics.ListAPIView):
    """Shows the user all the jobs they have personally requested."""
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user).order_by('-id')

@method_decorator(csrf_exempt, name='dispatch')
class ClientNegotiationActionView(APIView):
    """Allows client to accept, decline, or counter handyman's proposal."""
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, client=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        
        if action == 'accept':
            # Klijent prihvata ono što je zadnje predloženo
            agreed_time = booking.handyman_proposed_time or booking.client_proposed_time or booking.scheduled_time
            booking.scheduled_time = agreed_time
            booking.status = 'accepted'
            booking.negotiation_status = 'agreed'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        if action == 'decline':
            booking.status = 'cancelled'
            booking.negotiation_status = 'declined'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        if action == 'counter':
            proposed_time_raw = request.data.get('proposed_time')
            proposed_time = parse_datetime(proposed_time_raw) if proposed_time_raw else None
            if not proposed_time:
                return Response({"error": "Valid proposed_time required."}, status=status.HTTP_400_BAD_REQUEST)

            booking.client_proposed_time = proposed_time
            message = (request.data.get('message') or "").strip()
            booking.client_counter_message = message or None
            
            # BITNO: Ne diraj scheduled_time dok majstor ne prihvati!
            booking.status = 'pending'
            booking.negotiation_status = 'awaiting_handyman'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

class BookingDetailView(generics.RetrieveAPIView):
    """Fetches details for a single specific booking."""
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(Q(client=user) | Q(handyman=user))