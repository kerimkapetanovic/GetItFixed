from urllib import request

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.dateparse import parse_datetime
from django.contrib.auth import get_user_model # Required to link the Handyman
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated # Dodaj ovo gore ako fali
from rest_framework.permissions import AllowAny # Dodaj ovo gore ako fali
from datetime import timedelta # Dodaj ovo
from django.utils import timezone # Već bi trebalo da imaš od ranije
from django.shortcuts import get_object_or_404 # Dodaj ovo ako fali
from django.db import transaction
from decimal import Decimal

from .models import Booking
from .serializers import BookingSerializer
from .deadline_utils import (
    set_handyman_response_deadline,
    process_handyman_negotiation_expiry,
    repair_stale_handyman_deadline,
)
from accounts.authentication import CookieTokenAuthentication 

User = get_user_model()


def _parse_agreed_price(data, *, required: bool):
    """Reads agreed_price or price from request body. Returns (Decimal | None, error_message | None)."""
    raw = data.get("agreed_price")
    if raw is None or raw == "":
        raw = data.get("price")
    if raw is None or raw == "":
        if required:
            return None, "Agreed price (KM) is required."
        return None, None
    try:
        d = Decimal(str(raw).strip().replace(",", "."))
    except Exception:
        return None, "Invalid agreed price."
    if d <= 0:
        return None, "Agreed price must be greater than zero."
    if d > Decimal("999999.99"):
        return None, "Agreed price is too large."
    return d.quantize(Decimal("0.01")), None


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
            | Q(handyman=user, status='in_progress')
            | Q(handyman=user, status='handyman_done')
            | Q(handyman=user, status='awaiting_payment')
            | Q(handyman=user, status='paid')
            | Q(handyman=user, status='closed')
            | Q(handyman=user, status='completed')
            | Q(handyman=user, status='not_completed')
        ).order_by('-id').distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        for booking in queryset:
            repair_stale_handyman_deadline(booking)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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

            agreed, price_err = _parse_agreed_price(request.data, required=True)
            if price_err:
                return Response({"error": price_err}, status=status.HTTP_400_BAD_REQUEST)

            if booking.handyman and booking.handyman != request.user:
                return Response({"error": "Job is assigned to another handyman."}, status=status.HTTP_403_FORBIDDEN)

            booking.handyman = request.user
            knows_fix = request.data.get('knows_fix')
            if knows_fix is not None:
                booking.knows_fix = knows_fix
            # 2. Spremanje trajanja
            booking.duration_minutes = int(duration)
            booking.agreed_price = agreed

            base_time = booking.client_proposed_time or booking.scheduled_time
            if not base_time:
                return Response(
                    {"error": "This request has no appointment time. The client must pick a time first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            booking.scheduled_time = base_time
            booking.handyman_proposed_time = base_time
            booking.status = 'pending'
            booking.negotiation_status = 'awaiting_client'
            _hr = 1 if booking.is_urgent else 3
            booking.expires_at = timezone.now() + timedelta(hours=_hr)
            booking.last_action_by = 'handyman'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)
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
        knows_fix = request.data.get('knows_fix')

        if action not in {'accept', 'decline', 'counter'}:
            return Response(
                {"error": "Action must be one of: accept, decline, counter."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if action == 'accept' and booking.handyman_response_phase == 'after_client_time':
            return Response(
                {
                    "error": "The client's requested time has passed. Send a counter offer with a new time, or decline."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 1. AKCIJA: ACCEPT (Prihvatanje ponude)
        if action == 'accept':
            if not duration:
                return Response({"error": "Duration hours is required to accept a job."}, status=status.HTTP_400_BAD_REQUEST)

            agreed, price_err = _parse_agreed_price(request.data, required=True)
            if price_err:
                return Response({"error": price_err}, status=status.HTTP_400_BAD_REQUEST)
            
            # Određujemo finalno vrijeme (ono oko kojeg su se zadnje složili)
            agreed_time = booking.handyman_proposed_time or booking.client_proposed_time or booking.scheduled_time
            if not agreed_time:
                return Response(
                    {"error": "No appointment time is set on this request."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not Booking.is_timeslot_available(request.user, agreed_time, duration, exclude_booking_id=booking.id):
                return Response({
                    "error": "You already have a job at this time or too close to it (30min buffer required)."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            booking.scheduled_time = agreed_time
            # Expose the slot on handyman_proposed_time so the client UI matches the counter flow.
            booking.handyman_proposed_time = agreed_time
            booking.duration_minutes = int(duration) # Spašavamo sate
            booking.agreed_price = agreed
            if knows_fix is not None:
                booking.knows_fix = knows_fix
            booking.status = 'pending'
            booking.negotiation_status = 'awaiting_client'
            _hr = 1 if booking.is_urgent else 3
            booking.expires_at = timezone.now() + timedelta(hours=_hr)
            booking.last_action_by = 'handyman'
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

            counter_price, cp_err = _parse_agreed_price(request.data, required=False)
            if cp_err:
                return Response({"error": cp_err}, status=status.HTTP_400_BAD_REQUEST)
            if counter_price is not None:
                booking.agreed_price = counter_price
            
            booking.handyman_proposed_time = proposed_time
            booking.handyman_counter_message = message or None
            if knows_fix is not None:
                booking.knows_fix = knows_fix
            booking.status = 'pending'
            booking.negotiation_status = 'awaiting_client' # Sada klijent mora odgovoriti
            _hr = 1 if booking.is_urgent else 3
            booking.expires_at = timezone.now() + timedelta(hours=_hr)
            booking.last_action_by = 'handyman'
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
        is_urgent = serializer.validated_data.get('is_urgent', False)
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
        booking = serializer.save(
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
        if handyman and negotiation_status == 'awaiting_handyman':
            set_handyman_response_deadline(booking)
            booking.save(update_fields=['expires_at', 'handyman_response_phase', 'updated_at'])

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
            if booking.negotiation_status != 'awaiting_client':
                return Response(
                    {"error": "There is no expert offer waiting for your confirmation."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Klijent prihvata ono što je zadnje predloženo
            agreed_time = (
                booking.handyman_proposed_time
                or booking.scheduled_time
                or booking.client_proposed_time
            )
            booking.scheduled_time = agreed_time
            booking.status = 'accepted'
            booking.negotiation_status = 'agreed'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        if action == 'decline':
            if booking.negotiation_status != 'awaiting_client':
                return Response(
                    {"error": "There is no expert offer to decline."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            booking.status = 'cancelled'
            booking.negotiation_status = 'declined'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        if action == 'counter':
            if booking.negotiation_status != 'awaiting_client':
                return Response(
                    {"error": "You can only counter while an expert offer is pending."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
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
            booking.last_action_by = 'client'
            set_handyman_response_deadline(booking)
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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        repair_stale_handyman_deadline(instance)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
class TicketTrackingView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        clean_id = str(ticket_id).replace('GIT-', '').replace('#', '').strip()
        
        try:
            numeric_id = int(clean_id)
            booking = Booking.objects.get(id=numeric_id)
            
            if booking.client != request.user:
                return Response({"message": "Ovaj tiket ne pripada vama!"}, status=403)
                
            serializer = BookingSerializer(booking)
            return Response(serializer.data)

        except (ValueError, Booking.DoesNotExist):
            return Response({"message": "Tiket nije pronađen."}, status=404)
        

class HandymanBusySlotsView(APIView):
    # Dodaj ove dvije linije:
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [AllowAny] # Dozvoli svima da vide zauzete termine kako bi kalendar radio

    def get(self, request, handyman_id):
        # Uzimamo termine koji su potvrđeni ('accepted')
        busy_bookings = Booking.objects.filter(
            handyman_id=handyman_id, 
            status='accepted',
            scheduled_time__isnull=False
        ).values('scheduled_time', 'duration_minutes')
        
        return Response(list(busy_bookings))
    

@method_decorator(csrf_exempt, name='dispatch')
class ExpireBookingView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, status='pending')
        except Booking.DoesNotExist:
            return Response({"error": "Job not found or already processed."}, status=status.HTTP_404_NOT_FOUND)

        if not booking.expires_at or timezone.now() < booking.expires_at:
            return Response({"error": "Job has not expired yet."}, status=status.HTTP_400_BAD_REQUEST)

        result = process_handyman_negotiation_expiry(booking)
        booking.refresh_from_db()

        if result == "no_op":
            booking.status = 'cancelled'
            if booking.negotiation_status in ('awaiting_handyman', 'none'):
                booking.negotiation_status = 'declined'
            booking.save(update_fields=['status', 'negotiation_status', 'updated_at'])

        return Response(
            {
                "message": "Deadline processed.",
                "result": result,
                "booking": BookingSerializer(booking).data,
            },
            status=status.HTTP_200_OK,
        )
        
@method_decorator(csrf_exempt, name='dispatch')
class CompleteBookingView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        user = request.user
        action = request.data.get('action')

        # Samo client ili handyman mogu pristupiti
        if user not in (booking.client, booking.handyman):
            return Response({"error": "Forbidden."}, status=403)

        # ── CLIENT: plati iz novčanika (nakon što je posao potvrđen) ──
        if action == 'pay':
            if user != booking.client:
                return Response({"error": "Only the client can pay."}, status=403)
            if booking.status != 'awaiting_payment':
                return Response({"error": "Payment is not pending for this booking."}, status=400)
            if not booking.handyman_id:
                return Response({"error": "No handyman assigned."}, status=400)

            amount = booking.get_payment_amount_decimal()
            client_preview = booking.client.wallet_balance or Decimal("0")
            if client_preview < amount:
                return Response(
                    {"error": "Insufficient balance. Add funds in your Profile."},
                    status=400,
                )

            with transaction.atomic():
                client_u = User.objects.select_for_update().get(pk=booking.client_id)
                handyman_u = User.objects.select_for_update().get(pk=booking.handyman_id)
                cur = client_u.wallet_balance or Decimal("0")
                if cur < amount:
                    return Response(
                        {"error": "Insufficient balance. Add funds in your Profile."},
                        status=400,
                    )
                client_u.wallet_balance = cur - amount
                hm_bal = handyman_u.wallet_balance or Decimal("0")
                handyman_u.wallet_balance = hm_bal + amount
                client_u.save(update_fields=["wallet_balance"])
                handyman_u.save(update_fields=["wallet_balance"])
                booking.payment_amount = amount
                booking.paid_at = timezone.now()
                booking.status = "paid"
                booking.save()

            return Response(BookingSerializer(booking).data, status=200)

        # ── HANDYMAN: potvrdi primitak uplate / završi flow ──
        if action == 'acknowledge_payment':
            if user != booking.handyman:
                return Response({"error": "Only the handyman can confirm payment receipt."}, status=403)
            if booking.status != 'paid':
                return Response({"error": "Payment must be completed first."}, status=400)
            booking.status = 'closed'
            booking.save(update_fields=["status", "updated_at"])
            return Response(BookingSerializer(booking).data, status=200)

        # ── KORAK 1: Handyman označava kraj ──
        if action == 'mark_done':
            if user != booking.handyman:
                return Response({"error": "Only the handyman can mark job as done."}, status=403)
            if booking.status != 'in_progress':
                return Response({"error": "Job must be in_progress to mark as done."}, status=400)

            booking.status = 'handyman_done'
            booking.handyman_marked_done_at = timezone.now()
            booking.save()
            return Response(BookingSerializer(booking).data, status=200)

        # ── KORAK 2: Klijent potvrđuje ──
        if action == 'confirm_done':
            if user != booking.client:
                return Response({"error": "Only the client can confirm completion."}, status=403)
            if booking.status != 'handyman_done':
                return Response({"error": "Handyman hasn't marked job as done yet."}, status=400)

            booking.status = 'awaiting_payment'
            booking.client_confirmed_done_at = timezone.now()
            booking.save()
            return Response(BookingSerializer(booking).data, status=200)

        # ── KORAK 2b: Klijent prijavljuje da posao nije završen ──
        if action == 'mark_not_completed':
            if user != booking.client:
                return Response({"error": "Only the client can mark job as not completed."}, status=403)
            if booking.status != 'handyman_done':
                return Response({"error": "Handyman hasn't marked job as done yet."}, status=400)

            booking.status = 'not_completed'
            booking.save()
            return Response(BookingSerializer(booking).data, status=200)

        # ── KORAK 3: Auto-complete provjera (polling) ──
        if action == 'check_auto_complete':
            if user != booking.client:
                return Response({"error": "Only the client can trigger auto-complete check."}, status=403)
            if booking.status != 'handyman_done':
                return Response({"error": "Not in handyman_done state."}, status=400)
            if not booking.handyman_marked_done_at:
                return Response({"error": "No done timestamp found."}, status=400)

            deadline = booking.handyman_marked_done_at + timedelta(hours=1)
            if timezone.now() >= deadline:
                booking.status = 'awaiting_payment'
                booking.client_confirmed_done_at = timezone.now()
                booking.save()
                return Response({
                    **BookingSerializer(booking).data,
                    "auto_completed": True
                }, status=200)

            seconds_left = (deadline - timezone.now()).total_seconds()
            return Response({
                "status": "awaiting_client",
                "seconds_left": int(seconds_left)
            }, status=200)

        return Response(
            {
                "error": "Invalid action. Use: mark_done, confirm_done, mark_not_completed, "
                "check_auto_complete, pay, acknowledge_payment."
            },
            status=400,
        )
    
@method_decorator(csrf_exempt, name='dispatch')
class JobStatusCheckView(APIView):
    """
    Frontend polling — provjeri je li scheduled_time (početak termina) prošao.
    Ako jeste, prebaci status accepted -> in_progress.
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                status='accepted'
            )
        except Booking.DoesNotExist:
            # Možda je već in_progress/completed — vrati trenutni state
            booking = get_object_or_404(Booking, id=booking_id)
            return Response(BookingSerializer(booking).data, status=200)

        if request.user not in (booking.client, booking.handyman):
            return Response({"error": "Forbidden."}, status=403)

        if not booking.scheduled_time:
            return Response({"error": "Missing scheduled_time."}, status=400)

        job_start_time = booking.scheduled_time

        if timezone.now() >= job_start_time:
            booking.status = 'in_progress'
            booking.save()
            return Response(BookingSerializer(booking).data, status=200)

        seconds_left = (job_start_time - timezone.now()).total_seconds()
        return Response({
            "status": "not_yet",
            "seconds_left": int(seconds_left)
        }, status=200)