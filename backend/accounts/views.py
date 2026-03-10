from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import update_last_login
from .serializers import RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            # 1. Pronađi korisnika preko emaila da dobijemo njegov sistemski username
            user_obj = User.objects.get(email=email)
            
            # 2. Provjera uloge (Admin/Staff/Superuser preskaču "role" provjeru)
            is_privileged = user_obj.is_superuser or user_obj.is_staff or user_obj.role == 'admin'
            
            if not is_privileged:
                if selected_role and user_obj.role != selected_role:
                    raise serializers.ValidationError(
                        f"This account is registered as {user_obj.role}."
                    )
            
            # 3. KLJUČNA ISPRAVKA: Autentifikacija preko USERNAME-a
            # Budući da admin ima username 'admin', a ne email string, 
            # moramo proslijediti user_obj.username.
            user = authenticate(
                request=self.context.get('request'),
                username=user_obj.username, 
                password=password
            )

            # Fallback: Ako ipak koristiš Email za login (USERNAME_FIELD = 'email')
            if not user:
                user = authenticate(
                    request=self.context.get('request'),
                    username=email,
                    password=password
                )

        except User.DoesNotExist:
            user = None

        if not user:
            raise serializers.ValidationError('Incorrect email or password.')

        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')

        attrs['user'] = user
        return attrs


class CustomLoginView(ObtainAuthToken):
    serializer_class = EmailAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        
        # Ako podaci nisu ispravni (netačan pass ili pogrešna uloga), ovdje vraća 400
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Ažuriraj vrijeme zadnjeg logina
        update_last_login(None, user) 
        
        # Kreiraj ili preuzmi postojeći Token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'role': user.role,
            'first_name': user.first_name,
            'is_staff': user.is_staff
        })