from rest_framework import serializers
from .models import Booking
from django.contrib.auth import get_user_model

User = get_user_model()

class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    handyman_name = serializers.SerializerMethodField()
    handyman_email = serializers.SerializerMethodField()
    
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
            'handyman', # The ID field for writing
            'client_name', 
            'handyman_name', 
            'handyman_email', 
            'service_type', 
            'description', 
            'scheduled_time', 
            'client_proposed_time',
            'client_counter_message',
            'handyman_proposed_time',
            'handyman_counter_message',
            'status',
            'negotiation_status',
        ]
        read_only_fields = [
            'ticket_id',
            'status',
            'negotiation_status',
            'client_proposed_time',
            'handyman_proposed_time',
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