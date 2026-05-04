from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .handyman_ai import classify_problem_to_service
from .serializers import HandymanServiceListSerializer

User = get_user_model()


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
    serializer_class = HandymanServiceListSerializer

    def _normalize(self, value: str) -> str:
        return " ".join((value or "").strip().lower().replace("-", " ").replace("_", " ").split())

    def get_queryset(self):
        # Read slug from URL (e.g., /services/plumbing/)
        category_slug = self.kwargs["category_slug"]
        wanted = self._normalize(category_slug)

        # Return handyman users; match service_type robustly even if DB has spaces/case differences.
        handymen = User.objects.filter(role="handyman").order_by("id")
        matched_ids = [
            user.id
            for user in handymen
            if self._normalize(user.service_type or "") == wanted
        ]

        return User.objects.filter(id__in=matched_ids).order_by("id")