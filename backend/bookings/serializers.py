from rest_framework import serializers
from .models import Booking, Quote, QuoteLineItem, EscrowHold, Review
from django.contrib.auth import get_user_model

User = get_user_model()

class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    client_phone = serializers.SerializerMethodField()
    handyman_name = serializers.SerializerMethodField()
    handyman_email = serializers.SerializerMethodField()
    handyman_phone = serializers.SerializerMethodField()
    handyman_id = serializers.SerializerMethodField()
    estimated_price = serializers.ReadOnlyField(source='get_estimated_price')
    latest_quote = serializers.SerializerMethodField()
    latest_escrow_hold = serializers.SerializerMethodField()
    
    handyman = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = Booking
        # We must include 'handyman' here so the 'perform_create' can see it!
        fields = [
            'id',
            'ticket_id',
            'is_urgent', # OBAVEZNO DODAJ OVO POLJE
            'handyman', # The ID field for writing
            'handyman_id', # The ID field for reading
            'client_name', 
            'client_email',
            'client_phone',
            'handyman_name', 
            'handyman_email', 
            'handyman_phone',
            'service_type', 
            'description', 
            'scheduled_time', 
            'client_proposed_time',
            'client_counter_message',
            'handyman_proposed_time',
            'handyman_counter_message',
            'expires_at', 'updated_at', 'created_at',
            'handyman_response_phase',
            'status',
            'negotiation_status',
            'duration_minutes',
            'agreed_price',
            'estimated_price',
            'visit_fee_amount',
            'visit_fee_paid_at',
            'continue_job_requested',
            'continue_job_confirmed',
            'job_continued_at',
            'quote_status',
            'quote_locked_amount',
            'funds_locked_at',
            'payment_amount',
            'paid_at',
            'last_action_by',
            'knows_fix',
            'latest_quote',
            'latest_escrow_hold',
            
        ]
        read_only_fields = [
            'ticket_id',
            'status',
            'negotiation_status',
            'client_proposed_time',
            'handyman_proposed_time',
            'client_name',
            'client_email',
            'client_phone',
            'handyman_name',
            'handyman_email',
            'handyman_phone',
            'handyman_id',
            'agreed_price',
            'payment_amount',
            'paid_at',
        ]

    def get_client_name(self, obj):
        if obj.client:
            return f"{obj.client.first_name} {obj.client.last_name}".strip() or obj.client.email
        return "Unknown Client"

    def get_handyman_name(self, obj):
        if obj.handyman:
            return f"{obj.handyman.first_name} {obj.handyman.last_name}".strip() or "Professional"
        return None

    def get_handyman_email(self, obj):
        if obj.handyman:
            return obj.handyman.email
        return None

    def get_handyman_phone(self, obj):
        if obj.handyman:
            return obj.handyman.phone
        return None

    def get_handyman_id(self, obj):
        if obj.handyman:
            return obj.handyman.id
        return None
    def get_client_email(self, obj):
        if obj.client:
            return obj.client.email
        return None

    def get_client_phone(self, obj):
        if obj.client:
            return obj.client.phone
        return None

    def get_latest_quote(self, obj):
        quote = obj.quotes.order_by('-version', '-created_at').first()
        if not quote:
            return None
        return QuoteSerializer(quote).data

    def get_latest_escrow_hold(self, obj):
        hold = obj.escrow_holds.order_by('-created_at').first()
        if not hold:
            return None
        return EscrowHoldSerializer(hold).data


class QuoteLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteLineItem
        fields = [
            'id',
            'category',
            'description',
            'quantity',
            'unit_price',
            'line_total',
            'sort_order',
        ]
        read_only_fields = ['id', 'line_total']


class QuoteSerializer(serializers.ModelSerializer):
    line_items = QuoteLineItemSerializer(many=True)

    class Meta:
        model = Quote
        fields = [
            'id',
            'booking',
            'handyman',
            'version',
            'status',
            'subtotal_materials',
            'subtotal_labor',
            'subtotal_other',
            'total_amount',
            'proposed_visit_time',
            'notes',
            'submitted_at',
            'client_decision_at',
            'is_active',
            'created_at',
            'updated_at',
            'line_items',
        ]
        read_only_fields = [
            'id',
            'booking',
            'handyman',
            'version',
            'subtotal_materials',
            'subtotal_labor',
            'subtotal_other',
            'total_amount',
            'submitted_at',
            'client_decision_at',
            'created_at',
            'updated_at',
        ]


class EscrowHoldSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscrowHold
        fields = [
            'id',
            'booking',
            'quote',
            'client',
            'handyman',
            'purpose',
            'amount',
            'status',
            'reason',
            'locked_at',
            'released_at',
            'refunded_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

class ReviewSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'created_at', 'client_name']

    def get_client_name(self, obj):
        # Spajamo ime i prezime klijenta koji je ostavio recenziju
        if obj.client:
            return f"{obj.client.first_name} {obj.client.last_name}".strip() or obj.client.username
        return "Anonymous"