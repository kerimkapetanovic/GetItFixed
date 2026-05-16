from rest_framework import serializers
from .models import Booking
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
            'payment_amount',
            'paid_at',
            'last_action_by',
            'knows_fix',
            
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
