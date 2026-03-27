from rest_framework import serializers
from .models import HandymanProfile

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