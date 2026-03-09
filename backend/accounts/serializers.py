from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 
            'username', 
            'email', 
            'password', 
            'first_name', 
            'last_name', 
            'role', 
            'phone',        # DODATO
            'county',       # DODATO (pazi, na frontu ti je 'country', ovdje 'county')
            'city',         # DODATO
            'zip_code',     # DODATO
            'service_type' 
        )

    def validate(self, attrs):
        # Provjera za majstore
        if attrs.get('role') == 'pro' and not attrs.get('service_type'):
            raise serializers.ValidationError(
                {"service_type": "Majstori moraju odabrati vrstu usluge."}
            )
        return attrs

    def create(self, validated_data):
        # Kreiramo usera sa SVIM poljima
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'client'),
            phone=validated_data.get('phone', ''),           # DODATO
            county=validated_data.get('county', ''),         # DODATO
            city=validated_data.get('city', ''),             # DODATO
            zip_code=validated_data.get('zip_code', ''),     # DODATO
            service_type=validated_data.get('service_type', None)
        )
        return user
class EmailAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    role = serializers.CharField(required=True) # Obavezno proslijedi ulogu sa frontenda

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        selected_role = attrs.get('role') # 'client' ili 'handyman'

        if email and password:
            try:
                # 1. Pronađi korisnika po emailu
                user_obj = User.objects.get(email=email)
                
                # 2. KLJUČNA PROVJERA: Da li se uloga u bazi poklapa sa odabranom?
                if user_obj.role != selected_role:
                    raise serializers.ValidationError(
                        f"Ovaj nalog nije registrovan kao {selected_role}."
                    )

                # 3. Provjera lozinke
                user = authenticate(
                    request=self.context.get('request'),
                    username=user_obj.username,
                    password=password
                )
            except User.DoesNotExist:
                user = None

            if not user:
                raise serializers.ValidationError('Pogrešan email ili lozinka.', code='authorization')
        else:
            raise serializers.ValidationError('Morate unijeti i email i lozinku.', code='authorization')

        attrs['user'] = user
        return attrs