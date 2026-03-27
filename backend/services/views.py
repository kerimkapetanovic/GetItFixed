from rest_framework import generics
from .models import HandymanProfile
from .serializers import HandymanProfileSerializer

class HandymanListByCategoryView(generics.ListAPIView):
    serializer_class = HandymanProfileSerializer

    def get_queryset(self):
        # Grabs the category from the URL (e.g., /services/plumbing/)
        category_slug = self.kwargs['category_slug']
        
        # Returns handymen matching that category
        return HandymanProfile.objects.filter(
            user__service_type=category_slug, 
            user__role='handyman'
        )