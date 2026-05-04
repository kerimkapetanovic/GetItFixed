from rest_framework import serializers
from .models import HandymanProfile
from django.contrib.auth import get_user_model

User = get_user_model()

class HandymanProfileSerializer(serializers.ModelSerializer):
    # Mapping fields from the User model to the JSON output
    name = serializers.SerializerMethodField()
    category = serializers.CharField(source='user.service_type', read_only=True)
    location = serializers.CharField(source='user.city', read_only=True)
    
    price = serializers.SerializerMethodField()
    jobs = serializers.IntegerField(source='jobs_completed', read_only=True)

    class Meta:
        model = HandymanProfile
        fields = ['id', 'name', 'category', 'rating', 'jobs', 'price', 'location']

    def get_name(self, obj):
        # Result: "Amar D."
        last_initial = f"{obj.user.last_name[0]}." if obj.user.last_name else ""
        return f"{obj.user.first_name} {last_initial}".strip()
        
    def get_price(self, obj):
        # Result: "50 BAM/hr"
        return f"{int(obj.hourly_rate)} BAM/hr"


class HandymanServiceListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    category = serializers.CharField(source="service_type", read_only=True)
    rating = serializers.SerializerMethodField()
    jobs = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    location = serializers.CharField(source="city", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "category", "rating", "jobs", "price", "location"]

    def get_name(self, obj):
        last_initial = f"{obj.last_name[0]}." if obj.last_name else ""
        full = f"{obj.first_name} {last_initial}".strip()
        return full or obj.email

    def get_rating(self, obj):
        # Keep frontend contract: rating is rendered as string.
        profile = getattr(obj, "handyman_profile", None)
        value = profile.rating if profile else obj.rating
        return f"{value}"

    def get_jobs(self, obj):
        profile = getattr(obj, "handyman_profile", None)
        return profile.jobs_completed if profile else 0

    def get_price(self, obj):
        profile = getattr(obj, "handyman_profile", None)
        rate = profile.hourly_rate if profile else obj.hourly_rate
        return f"{int(rate)} BAM/hr"