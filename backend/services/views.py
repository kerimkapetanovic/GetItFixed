from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .handyman_ai import classify_problem_to_service
from .models import HandymanProfile
from .serializers import HandymanProfileSerializer


@method_decorator(csrf_exempt, name="dispatch")
class AIHelperView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        message = str(request.data.get("message", "")).strip()
        if not message:
            return Response(
                {"status": "error", "message": "The `message` field is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ai_response = classify_problem_to_service(message)
        return Response(ai_response, status=status.HTTP_200_OK)


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