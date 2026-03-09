from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer
from django.contrib.auth.models import update_last_login

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Korisnik uspješno registrovan!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# POPRAVLJEN SERIALIZER UNUTAR VIEWS.PY
class EmailAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    role = serializers.CharField(required=True) # DODATO

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        selected_role = attrs.get('role') # Uloga sa frontenda

        if email and password:
            from .models import User
            try:
                user_obj = User.objects.get(email=email)
                
                # KLJUČNA PROVJERA: Da li se uloga u bazi poklapa sa odabranom ulogom na login formi
                if user_obj.role != selected_role:
                    raise serializers.ValidationError(
                        f"Invalid role. This account is registered as {user_obj.role}."
                    )

                user = authenticate(
                    request=self.context.get('request'),
                    username=user_obj.username, 
                    password=password
                )
            except User.DoesNotExist:
                user = None

            if not user:
                raise serializers.ValidationError('Pogrešan email ili lozinka.')
        else:
            raise serializers.ValidationError('Morate unijeti email i lozinku.')

        attrs['user'] = user
        return attrs

class CustomLoginView(ObtainAuthToken):
    serializer_class = EmailAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        # Ako uloga nije ispravna, ovdje će baciti 400 Bad Request
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        update_last_login(None, user) 
        
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'role': user.role,
            'first_name': user.first_name
        })