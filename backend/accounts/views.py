from rest_framework import generics, status, serializers, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .serializers import RegisterSerializer

User = get_user_model()

# --- SERIALIZERS ---

class UserSerializer(serializers.ModelSerializer):
    location = serializers.CharField(source='city', default="Sarajevo")
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 
            'role', 'service_type', 'location', 'rating', 'hourly_rate'
        ]

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

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError('Incorrect email or password.')

        is_privileged = user.is_superuser or user.is_staff or user.role == 'admin'
        if not is_privileged and selected_role:
            if user.role != selected_role:
                raise serializers.ValidationError(f"This account is registered as {user.role}.")

        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')

        attrs['user'] = user
        return attrs


# --- VIEWS ---

class HandymanListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny] 
    serializer_class = UserSerializer

    def get_queryset(self):
        # Return handyman users directly so all DB service types are represented.
        return User.objects.filter(role='handyman').order_by('id')

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(ObtainAuthToken):
    serializer_class = EmailAuthSerializer

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
            'is_staff': user.is_staff
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
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie('auth_token', path='/')
        return response