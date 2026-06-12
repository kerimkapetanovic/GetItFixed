from urllib import request
from decimal import Decimal, InvalidOperation

from rest_framework import generics, status, serializers, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# Ovdje uvozimo naš moćni UserSerializer
from .serializers import RegisterSerializer, ProfileSerializer, ChangePasswordSerializer, UserSerializer
from .authentication import CookieTokenAuthentication

User = get_user_model()

# Ostavljamo ove stare serializere ako si ih slučajno importovao negdje drugo, 
# ali ih više ne koristimo za glavnu listu.
class HandymanDirectorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    category = serializers.CharField(source="service_type", read_only=True)
    service_type = serializers.CharField(read_only=True)
    location = serializers.CharField(source="city", default="Sarajevo")
    jobs = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    hourly_rate = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "service_type",
            "hourly_rate",
            "name",
            "category",
            "rating",
            "jobs",
            "price",
            "location",
        ]

    def get_name(self, obj):
        last_initial = f"{obj.last_name[0]}." if obj.last_name else ""
        full = f"{obj.first_name} {last_initial}".strip()
        return full or obj.email

    def get_jobs(self, obj):
        profile = getattr(obj, "handyman_profile", None)
        return profile.jobs_completed if profile else 0

    def get_price(self, obj):
        profile = getattr(obj, "handyman_profile", None)
        rate = profile.hourly_rate if profile else obj.hourly_rate
        return f"{int(rate)} BAM/hr"

    def get_hourly_rate(self, obj):
        profile = getattr(obj, "handyman_profile", None)
        rate = profile.hourly_rate if profile else obj.hourly_rate
        return int(rate)

    def get_rating(self, obj):
        profile = getattr(obj, "handyman_profile", None)
        value = profile.rating if profile else obj.rating
        return f"{value}"

class EmailAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        selected_role = attrs.get('role')

        if not email or not password:
            raise serializers.ValidationError('Email and password are required.')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Incorrect email or password.')

        if not user.check_password(password):
            raise serializers.ValidationError('Incorrect email or password.')

        if not user.is_active:
            raise serializers.ValidationError(
                'User account is not verified or active.\nPlease wait until an admin approves your account.'
            )

        is_privileged = user.is_superuser or user.is_staff or user.role == 'admin'
        if not is_privileged and selected_role:
            if user.role != selected_role:
                raise serializers.ValidationError(f"This account is registered as {user.role}.")

        attrs['user'] = user
        return attrs


# --- VIEWS ---

class ListUsers(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

class HandymanListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny] 
    # OVDJE JE PROMJENA: Koristimo tvoj dinamički UserSerializer umjesto starog!
    serializer_class = UserSerializer 

    def _normalize(self, value: str) -> str:
        return " ".join((value or "").strip().lower().replace("-", " ").replace("_", " ").split())

    def get_queryset(self):
        # Return handyman users and optionally filter by service_type.
        queryset = User.objects.filter(role='handyman').order_by('id')
        service_type = self.request.query_params.get("service_type")
        if not service_type:
            return queryset

        wanted = self._normalize(service_type)
        matched_ids = [
            user.id
            for user in queryset
            if self._normalize(user.service_type or "") == wanted
        ]
        return queryset.filter(id__in=matched_ids)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # --- TASK 2: Handyman Verification Logic ---
            if user.role == 'handyman':
                user.is_active = False
                user.verification_status = "pending"
                user.save(update_fields=['is_active', 'verification_status'])
                return Response(
                    {"message": "Registration successful! Your account is pending admin approval."}, 
                    status=status.HTTP_201_CREATED
                )
            # -------------------------------------------
            
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(ObtainAuthToken):
    serializer_class = EmailAuthSerializer

    def _build_avatar_url(self, request, user):
        if user.avatar:
            return user.avatar
        
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}"
        
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        update_last_login(None, user) 
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = {
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'avatar_url': self._build_avatar_url(request, user),
            'wallet_balance': float(user.wallet_balance or 0),
            'locked_balance': float(user.wallet_locked_balance or 0),
            'wallet_available_balance': float(user.wallet_available_balance or 0),
        }
        
        response = Response(response_data, status=status.HTTP_200_OK)

        response.set_cookie(
            key='auth_token',
            value=token.key,
            httponly=True,   
            secure=False,    
            samesite='Lax',  
            path='/',
            max_age=60 * 60 * 24 * 7 
        )
        
        return response


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        token_key = request.COOKIES.get('auth_token')

        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ', 1)[1].strip() or token_key

        if token_key:
            Token.objects.filter(key=token_key).delete()

        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('auth_token', path='/')
        return response


@method_decorator(csrf_exempt, name='dispatch')
class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        
        if 'avatar' in request.data and request.data.get('avatar') is None:
            instance = request.user
            instance.avatar = None
            instance.save()
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class WalletAddBalanceView(APIView):
    """
    Demo top-up: increments wallet_balance (no real payment gateway).
    Replace later with Stripe/payment provider webhook that credits the wallet.
    """
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if getattr(request.user, "role", None) != "client":
            return Response(
                {"error": "Only client accounts can add balance here."},
                status=status.HTTP_403_FORBIDDEN,
            )

        raw = request.data.get("amount")
        try:
            amount = Decimal(str(raw))
        except (InvalidOperation, TypeError, ValueError):
            return Response({"error": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response(
                {"error": "Amount must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if amount > Decimal("50000"):
            return Response({"error": "Amount exceeds maximum allowed."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        current = user.wallet_balance or Decimal("0")
        user.wallet_balance = current + amount
        user.save(update_fields=["wallet_balance"])

        return Response(
            {
                "wallet_balance": float(user.wallet_balance),
                "locked_balance": float(user.wallet_locked_balance or 0),
                "wallet_available_balance": float(user.wallet_available_balance or 0),
                "message": "Balance updated successfully.",
            },
            status=status.HTTP_200_OK,
        )


@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer
    authentication_classes = [TokenAuthentication, CookieTokenAuthentication]

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )