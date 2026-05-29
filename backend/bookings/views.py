from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.dateparse import parse_datetime
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from decimal import Decimal
from .models import Booking, Review

from .models import Booking, Quote, QuoteLineItem, EscrowHold
from .serializers import BookingSerializer, QuoteSerializer, EscrowHoldSerializer
from .deadline_utils import (
    set_handyman_response_deadline,
    process_handyman_negotiation_expiry,
    repair_stale_handyman_deadline,
)
from .escrow_service import lock_client_funds, release_funds_to_handyman, refund_locked_funds
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


def _latest_locked_hold(booking: Booking, *, purpose: str | None = None):
    queryset = booking.escrow_holds.filter(status="locked")
    if purpose:
        queryset = queryset.filter(purpose=purpose)
    return queryset.order_by("-created_at").first()


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
            | Q(handyman=user, negotiation_status='awaiting_client')
            | Q(handyman=user, negotiation_status='awaiting_handyman')
            | Q(handyman=user, status='accepted')
            | Q(handyman=user, status='in_progress')
            | Q(handyman=user, status='visit_completed')
            | Q(handyman=user, status='visit_fee_pending')
            | Q(handyman=user, status='visit_fee_paid')
            | Q(handyman=user, status='quote_pending_client')
            | Q(handyman=user, status='funds_locked')
            | Q(handyman=user, status='handyman_done')
            | Q(handyman=user, status='awaiting_payment')
            | Q(handyman=user, status='paid')
            | Q(handyman=user, status='closed')
            | Q(handyman=user, status='completed')
            | Q(handyman=user, status='not_completed')
            | Q(handyman=user, status='cancelled')
            | Q(handyman=user, negotiation_status='declined')
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
            booking = Booking.objects.get(id=booking_id, handyman=request.user)
        except Booking.DoesNotExist:
            action = request.data.get('action')
            if action == 'decline':
                try:
                    booking = Booking.objects.get(
                        id=booking_id,
                        status='pending',
                        handyman__isnull=True,
                        service_type=request.user.service_type,
                    )
                    booking.handyman = request.user
                except Booking.DoesNotExist:
                    return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "Request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        duration = request.data.get('duration_minutes')
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

        if action == 'accept':
            if not duration:
                return Response({"error": "Duration hours is required to accept a job."}, status=status.HTTP_400_BAD_REQUEST)

            agreed, price_err = _parse_agreed_price(request.data, required=True)
            if price_err:
                return Response({"error": price_err}, status=status.HTTP_400_BAD_REQUEST)
            
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
            booking.handyman_proposed_time = agreed_time
            booking.duration_minutes = int(duration)
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

        if action == 'decline':
            booking.status = 'cancelled'
            booking.negotiation_status = 'declined'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

        if action == 'counter':
            proposed_time_raw = request.data.get('proposed_time')
            proposed_time = parse_datetime(proposed_time_raw) if proposed_time_raw else None
            
            if not proposed_time:
                return Response(
                    {"error": "A valid proposed_time is required for counter action."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            message = (request.data.get('message') or "").strip()
            
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
            booking.negotiation_status = 'awaiting_client'
            _hr = 1 if booking.is_urgent else 3
            booking.expires_at = timezone.now() + timedelta(hours=_hr)
            booking.last_action_by = 'handyman'
            booking.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CompleteVisitView(APIView):
    """
    Allows the assigned handyman to mark current visit as finished.
    Client must then confirm completion (release) or mark not completed (refund).
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)

        # Guardrail 1: Only the assigned Handyman can click this
        if request.user != booking.handyman:
            return Response(
                {"error": "Only the assigned handyman can complete the initial visit."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Guardrail 2: Booking must actually be in progress
        if booking.status != "in_progress":
            return Response(
                {"error": f"Cannot complete visit. Current status is {booking.status}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = "handyman_done"
        booking.handyman_marked_done_at = timezone.now()
        booking.save(update_fields=["status", "handyman_marked_done_at", "updated_at"])

        return Response(
            {
                "message": "Visit marked as finished. Waiting for client confirmation.",
                "booking": BookingSerializer(booking).data
            }, 
            status=status.HTTP_200_OK
        )


# --- CLIENT VIEWS ---

@method_decorator(csrf_exempt, name='dispatch')
class CreateBookingView(generics.CreateAPIView):
    """Handles creating a new job, supporting both direct and general requests."""
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        handyman_id = self.request.data.get('handyman_id')
        handyman = None
        final_status = 'pending'
        negotiation_status = 'none'
        client_proposed_time = None

        if handyman_id:
            try:
                handyman = User.objects.get(id=handyman_id, role='handyman')
                negotiation_status = 'awaiting_handyman'
                client_proposed_time = serializer.validated_data.get('scheduled_time')
                print(f"--- DIRECT BOOKING: {handyman.email} assigned to Job ---")
            except User.DoesNotExist:
                print(f"--- WARNING: Handyman ID {handyman_id} not found, defaulting to pending ---")

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
            agreed_time = (
                booking.handyman_proposed_time
                or booking.scheduled_time
                or booking.client_proposed_time
            )
            if booking.agreed_price is None or booking.agreed_price <= 0:
                return Response(
                    {"error": "Accepted offer is missing agreed price."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                with transaction.atomic():
                    booking.scheduled_time = agreed_time
                    
                    # --- NOVO: SKIP INSPECTION LOGIKA ---
                    if booking.knows_fix:
                        booking.status = 'visit_fee_paid'
                        booking.continue_job_requested = True
                        booking.continue_job_confirmed = True
                        booking.job_continued_at = timezone.now()
                        fields_to_update = ["scheduled_time", "status", "negotiation_status", "last_action_by", "updated_at", "continue_job_requested", "continue_job_confirmed", "job_continued_at"]
                    else:
                        booking.status = 'accepted'
                        fields_to_update = ["scheduled_time", "status", "negotiation_status", "last_action_by", "updated_at"]
                    # ------------------------------------
                    
                    booking.negotiation_status = 'agreed'
                    booking.last_action_by = 'client'
                    
                    booking.save(update_fields=fields_to_update)
                    
                    lock_client_funds(
                        booking=booking,
                        actor=request.user,
                        amount=booking.agreed_price,
                        purpose="visit_fee",
                    )
            except Exception as exc:
                return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
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
        return Booking.objects.filter(
            Q(client=user)
            | Q(handyman=user)
            | Q(
                status='pending',
                handyman__isnull=True,
                service_type=user.service_type,
            )
        )

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
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [AllowAny]

    def get(self, request, handyman_id):
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
class ContinueJobView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user != booking.client:
            return Response({"error": "Only the client can decide to continue."}, status=403)
        if booking.status != "visit_fee_paid":
            return Response({"error": "Continue decision is allowed only after first visit is paid."}, status=400)

        continue_job = request.data.get("continue_job")
        if continue_job is None:
            return Response({"error": "continue_job is required."}, status=400)

        continue_job = str(continue_job).lower() in {"1", "true", "yes", "on"}
        booking.continue_job_requested = True
        booking.continue_job_confirmed = continue_job
        if continue_job:
            booking.job_continued_at = timezone.now()
            booking.quote_status = "draft"
            booking.status = "visit_fee_paid"
        else:
            booking.status = "closed"
        booking.save(
            update_fields=[
                "continue_job_requested",
                "continue_job_confirmed",
                "job_continued_at",
                "quote_status",
                "status",
                "updated_at",
            ]
        )
        return Response(BookingSerializer(booking).data, status=200)


def _normalize_line_items(items):
    totals = {
        "materials": Decimal("0.00"),
        "labor": Decimal("0.00"),
        "other": Decimal("0.00"),
        "total": Decimal("0.00"),
    }
    normalized = []
    for idx, item in enumerate(items):
        category = (item.get("category") or "other").strip().lower()
        if category not in {"materials", "labor", "other"}:
            raise ValueError(f"Invalid category for line item {idx + 1}.")
        description = (item.get("description") or "").strip()
        if not description:
            raise ValueError(f"Description is required for line item {idx + 1}.")
        quantity = Decimal(str(item.get("quantity", "1"))).quantize(Decimal("0.01"))
        unit_price = Decimal(str(item.get("unit_price", "0"))).quantize(Decimal("0.01"))
        if quantity <= 0 or unit_price < 0:
            raise ValueError(f"Invalid quantity/unit_price for line item {idx + 1}.")
        line_total = (quantity * unit_price).quantize(Decimal("0.01"))
        totals[category] += line_total
        totals["total"] += line_total
        normalized.append(
            {
                "category": category,
                "description": description,
                "quantity": quantity,
                "unit_price": unit_price,
                "line_total": line_total,
                "sort_order": int(item.get("sort_order", idx)),
            }
        )
    return normalized, totals


@method_decorator(csrf_exempt, name='dispatch')
class CreateQuoteView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user != booking.handyman:
            return Response({"error": "Only assigned handyman can create quote."}, status=403)
        if booking.status != "visit_fee_paid":
            return Response({"error": "Quote can only be created after first visit is settled."}, status=400)
        if booking.continue_job_confirmed is not True:
            return Response({"error": "Client has not approved continue-job flow yet."}, status=400)
        proposed_visit_time_raw = request.data.get("proposed_visit_time")
        proposed_visit_time = parse_datetime(proposed_visit_time_raw) if proposed_visit_time_raw else None
        if not proposed_visit_time:
            return Response({"error": "proposed_visit_time is required."}, status=400)
        if proposed_visit_time <= timezone.now():
            return Response({"error": "proposed_visit_time must be in the future."}, status=400)

        line_items = request.data.get("line_items")
        if not isinstance(line_items, list) or not line_items:
            return Response({"error": "line_items must be a non-empty list."}, status=400)

        try:
            normalized_items, totals = _normalize_line_items(line_items)
        except Exception as exc:
            return Response({"error": str(exc)}, status=400)

        with transaction.atomic():
            Quote.objects.filter(booking=booking, is_active=True).update(is_active=False)
            latest = Quote.objects.filter(booking=booking).order_by("-version").first()
            version = (latest.version + 1) if latest else 1

            quote = Quote.objects.create(
                booking=booking,
                handyman=request.user,
                version=version,
                status="pending_client",
                subtotal_materials=totals["materials"],
                subtotal_labor=totals["labor"],
                subtotal_other=totals["other"],
                total_amount=totals["total"],
                proposed_visit_time=proposed_visit_time,
                notes=(request.data.get("notes") or "").strip() or None,
                submitted_at=timezone.now(),
                is_active=True,
            )
            QuoteLineItem.objects.bulk_create(
                [
                    QuoteLineItem(
                        quote=quote,
                        category=item["category"],
                        description=item["description"],
                        quantity=item["quantity"],
                        unit_price=item["unit_price"],
                        line_total=item["line_total"],
                        sort_order=item["sort_order"],
                    )
                    for item in normalized_items
                ]
            )
            booking.quote_status = "pending_client"
            booking.status = "quote_pending_client"
            booking.save(update_fields=["quote_status", "status", "updated_at"])

        return Response(QuoteSerializer(quote).data, status=201)


@method_decorator(csrf_exempt, name='dispatch')
class LatestQuoteView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user not in (booking.client, booking.handyman):
            return Response({"error": "Forbidden."}, status=403)
        quote = booking.quotes.order_by("-version", "-created_at").first()
        if not quote:
            return Response({"error": "No quote found for this booking."}, status=404)
        return Response(QuoteSerializer(quote).data, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class QuoteClientActionView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id, quote_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user != booking.client:
            return Response({"error": "Only client can act on quote."}, status=403)

        quote = get_object_or_404(Quote, id=quote_id, booking=booking)
        action = (request.data.get("action") or "").strip().lower()
        if action not in {"accept", "reject", "counter"}:
            return Response({"error": "Action must be accept, reject, or counter."}, status=400)

        if action == "accept":
            if not quote.proposed_visit_time:
                return Response({"error": "Quote is missing proposed_visit_time."}, status=400)
            try:
                with transaction.atomic():
                    hold = lock_client_funds(
                        booking=booking,
                        quote=quote,
                        actor=request.user,
                        purpose="quote",
                    )
                    booking.scheduled_time = quote.proposed_visit_time
                    booking.save(update_fields=["scheduled_time", "updated_at"])
            except Exception as exc:
                return Response({"error": str(exc)}, status=400)
            booking.refresh_from_db()
            quote.refresh_from_db()
            return Response(
                {
                    "booking": BookingSerializer(booking).data,
                    "quote": QuoteSerializer(quote).data,
                    "escrow": EscrowHoldSerializer(hold).data,
                },
                status=200,
            )

        quote.status = "rejected" if action == "reject" else "countered"
        quote.client_decision_at = timezone.now()
        quote.is_active = action == "counter"
        quote.save(update_fields=["status", "client_decision_at", "is_active", "updated_at"])

        booking.quote_status = quote.status
        if action == "reject":
            booking.status = "visit_fee_paid"
        booking.save(update_fields=["quote_status", "status", "updated_at"])
        return Response(QuoteSerializer(quote).data, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class EscrowStatusView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        if request.user not in (booking.client, booking.handyman):
            return Response({"error": "Forbidden."}, status=403)

        hold = booking.escrow_holds.order_by("-created_at").first()
        if not hold:
            return Response({"booking_id": booking.id, "escrow": None}, status=200)
        return Response({"booking_id": booking.id, "escrow": EscrowHoldSerializer(hold).data}, status=200)


@method_decorator(csrf_exempt, name='dispatch')
class CompleteBookingView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        booking = get_object_or_404(Booking, id=booking_id)
        user = request.user
        action = request.data.get('action')

        if user not in (booking.client, booking.handyman):
            return Response({"error": "Forbidden."}, status=403)

        if action == 'pay':
            if user != booking.client:
                return Response({"error": "Only the client can pay."}, status=403)
            # Backward-compatible manual release endpoint for legacy UI.
            if booking.status != "funds_locked":
                return Response(
                    {"error": "Direct pay is disabled in escrow-first flow. Confirm completion instead."},
                    status=400,
                )
            hold = _latest_locked_hold(booking, purpose="quote")
            if not hold:
                return Response({"error": "No active quote escrow hold found."}, status=400)
            try:
                release_funds_to_handyman(hold=hold, note="Legacy pay fallback")
            except Exception as exc:
                return Response({"error": str(exc)}, status=400)
            booking.refresh_from_db()
            return Response(BookingSerializer(booking).data, status=200)

        if action == 'acknowledge_payment':
            if user != booking.handyman:
                return Response({"error": "Only the handyman can confirm payment receipt."}, status=403)
            if booking.status != 'paid':
                return Response({"error": "Payment must be completed first."}, status=400)
            booking.status = 'closed'
            booking.save(update_fields=["status", "updated_at"])
            return Response(BookingSerializer(booking).data, status=200)

        if action == 'mark_done':
            if user != booking.handyman:
                return Response({"error": "Only the handyman can mark job as done."}, status=403)
            
            # --- NOVO: Dodan 'funds_locked' ---
            if booking.status not in ['in_progress', 'funds_locked']:
                return Response({"error": "Job must be in_progress or funds_locked to mark as done."}, status=400)

            booking.status = 'handyman_done'
            booking.handyman_marked_done_at = timezone.now()
            booking.save()
            return Response(BookingSerializer(booking).data, status=200)

        if action == 'confirm_done':
            if user != booking.client:
                return Response({"error": "Only the client can confirm completion."}, status=403)
            if booking.status != 'handyman_done':
                return Response({"error": "Handyman hasn't marked job as done yet."}, status=400)
            hold = _latest_locked_hold(booking)
            if not hold:
                return Response({"error": "No active escrow hold found for completion."}, status=400)
            try:
                if hold.purpose == "visit_fee":
                    release_funds_to_handyman(
                        hold=hold,
                        note="First visit confirmed by client.",
                        set_booking_paid=False,
                        booking_status="visit_fee_paid",
                    )
                    booking.refresh_from_db()
                    booking.client_confirmed_done_at = timezone.now()
                    booking.save(update_fields=["client_confirmed_done_at", "updated_at"])
                else:
                    release_funds_to_handyman(
                        hold=hold,
                        note="Quote visit confirmed by client.",
                        set_booking_paid=True,
                    )
                    booking.refresh_from_db()
                    booking.client_confirmed_done_at = timezone.now()
                    booking.save(update_fields=["client_confirmed_done_at", "updated_at"])
            except Exception as exc:
                return Response({"error": str(exc)}, status=400)
            return Response(BookingSerializer(booking).data, status=200)

        if action == 'mark_not_completed':
            if user != booking.client:
                return Response({"error": "Only the client can mark job as not completed."}, status=403)
            if booking.status != 'handyman_done':
                return Response({"error": "Handyman hasn't marked job as done yet."}, status=400)
            hold = _latest_locked_hold(booking)
            try:
                if hold:
                    refund_locked_funds(
                        hold=hold,
                        reason="Client marked job as not completed.",
                        booking_status="not_completed",
                    )
                    booking.refresh_from_db()
                else:
                    booking.status = 'not_completed'
                    booking.save(update_fields=["status", "updated_at"])
            except Exception as exc:
                return Response({"error": str(exc)}, status=400)
            return Response(BookingSerializer(booking).data, status=200)

        if action == "reopen_after_issue":
            if booking.status != "not_completed":
                return Response({"error": "Booking is not in not_completed state."}, status=400)
            booking.status = "in_progress"
            booking.save(update_fields=["status", "updated_at"])
            return Response(BookingSerializer(booking).data, status=200)

        if action == 'check_auto_complete':
            if user != booking.client:
                return Response({"error": "Only the client can trigger auto-complete check."}, status=403)
            if booking.status != 'handyman_done':
                return Response({"error": "Not in handyman_done state."}, status=400)
            if not booking.handyman_marked_done_at:
                return Response({"error": "No done timestamp found."}, status=400)

            deadline = booking.handyman_marked_done_at + timedelta(hours=1)
            if timezone.now() >= deadline:
                hold = _latest_locked_hold(booking)
                if not hold:
                    return Response({"error": "No active escrow hold found for auto-complete."}, status=400)
                try:
                    if hold.purpose == "visit_fee":
                        release_funds_to_handyman(
                            hold=hold,
                            note="Auto-confirmed first visit.",
                            set_booking_paid=False,
                            booking_status="visit_fee_paid",
                        )
                    else:
                        release_funds_to_handyman(
                            hold=hold,
                            note="Auto-confirmed quote visit.",
                            set_booking_paid=True,
                        )
                except Exception as exc:
                    return Response({"error": str(exc)}, status=400)
                booking.refresh_from_db()
                booking.client_confirmed_done_at = timezone.now()
                booking.save(update_fields=["client_confirmed_done_at", "updated_at"])
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
                "check_auto_complete, reopen_after_issue, pay, acknowledge_payment."
            },
            status=400,
        )
    

@method_decorator(csrf_exempt, name='dispatch')
class JobStatusCheckView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(
                id=booking_id,
                status__in=['accepted', 'funds_locked']
            )
        except Booking.DoesNotExist:
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


# =========================================================================
# Task C1: Admin Backend APIs (Tracking, Verification, Services, Finances)
# =========================================================================

class AdminTrackingListView(generics.ListAPIView):
    """
    Tracking API: Monitors all system-wide lifecycles, calculates real-time
    queue statistics, and supports administrative pipeline overrides.
    """
    serializer_class = BookingSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Booking.objects.all().order_by('-id')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        stats = Booking.objects.aggregate(
            total_jobs=Count('id'),
            pending_jobs=Count('id', filter=Q(status='pending')),
            escrow_locked=Count('id', filter=Q(status='funds_locked')),
            in_progress=Count('id', filter=Q(status='in_progress')),
        )
        response.data = {
            'metrics': stats,
            'results': response.data
        }
        return response


class AdminVerificationQueueView(generics.ListAPIView):
    """
    Verification API: Exposes all service provider onboarding fields
    for validation audits.
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        handymen = User.objects.filter(role__iexact='handyman').order_by('-id')
        data = [{
            "id": h.id,
            "name": f"{h.first_name} {h.last_name}".strip() or h.username,
            "email": h.email,
            "service_type": getattr(h, 'service_type', 'N/A'),
            "is_active": h.is_active,
            "date_joined": h.date_joined
        } for h in handymen]
        return Response(data, status=status.HTTP_200_OK)


class AdminVerifyUserActionView(APIView):
    """
    Onboarding Actions: Supports instant status approval or systemic revocation.
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, user_id):
        action = request.data.get("action")
        user = get_object_or_404(User, id=user_id)
        
        if action == "approve":
            user.is_active = True
            user.save()
            return Response({"message": f"User {user.email} approved successfully."}, status=status.HTTP_200_OK)
        elif action == "suspend":
            user.is_active = False
            user.save()
            return Response({"message": f"User {user.email} suspended successfully."}, status=status.HTTP_200_OK)
            
        return Response({"error": "Invalid action parameter specified."}, status=status.HTTP_400_BAD_REQUEST)


class AdminServicesManagementView(APIView):
    """
    Services API: Aggregates real-time marketplace availability analytics.
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        services_breakdown = User.objects.filter(
            role__iexact='handyman'
        ).values('service_type').annotate(
            total_pros=Count('id'),
            active_pros=Count('id', filter=Q(is_active=True))
        ).order_by('-total_pros')
        
        return Response(list(services_breakdown), status=status.HTTP_200_OK)


class AdminFinancesLedgerView(generics.ListAPIView):
    """
    Finances API: Reconciles total frozen assets across the ecosystem.
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication, SessionAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_escrow_volume = EscrowHold.objects.filter(status='locked').aggregate(Sum('amount'))['amount__sum'] or Decimal("0.00")
        
        recent_holds = EscrowHold.objects.all().order_by('-id')[:30]
        serializer = EscrowHoldSerializer(recent_holds, many=True)

        return Response({
            "total_escrow_locked_systemwide": float(total_escrow_volume),
            "ledger": serializer.data
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class SubmitReviewView(APIView):
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, client=request.user)
            
            if booking.status not in ['closed', 'completed']:
                return Response({"error": "Posao nije završen."}, status=status.HTTP_400_BAD_REQUEST)
            
            if Review.objects.filter(booking=booking).exists():
                return Response({"error": "Recenzija je već ostavljena."}, status=status.HTTP_400_BAD_REQUEST)

            rating = request.data.get('rating')
            comment = request.data.get('comment')

            if not rating or not (1 <= int(rating) <= 5):
                return Response({"error": "Ocjena mora biti od 1 do 5."}, status=status.HTTP_400_BAD_REQUEST)

            Review.objects.create(
                booking=booking,
                handyman=booking.handyman,
                client=request.user,
                rating=int(rating),
                comment=comment
            )
            
            return Response({"message": "Hvala na recenziji!"}, status=status.HTTP_201_CREATED)
            
        except Booking.DoesNotExist:
            return Response({"error": "Rezervacija nije pronađena."}, status=status.HTTP_404_NOT_FOUND)