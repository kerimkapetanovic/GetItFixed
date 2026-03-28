from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 
            'first_name', 'last_name', 'role', 'phone',
            'county', 'city', 'zip_code', 'service_type' 
        )

    def validate(self, attrs):
        # Provjera za majstore (handyman)
        if attrs.get('role') == 'handyman' and not attrs.get('service_type'):
            raise serializers.ValidationError(
                {"service_type": "Handyman must select a service type."}
            )
        return attrs

    def create(self, validated_data):
        # create_user se brine za hashiranje lozinke
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'client'),
            phone=validated_data.get('phone', ''),
            county=validated_data.get('county', ''),
            city=validated_data.get('city', ''),
            zip_code=validated_data.get('zip_code', ''),
            service_type=validated_data.get('service_type', None)
        )
        return user

class EmailAuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    role = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        selected_role = attrs.get('role')

        if not email or not password:
            raise serializers.ValidationError('You must provide an email and password.', code='authorization')

        try:
            # 1. Pronalaženje korisnika po emailu
            user_obj = User.objects.get(email=email)
            
            # 2. Provjera uloge (Admin ima "free pass")
            is_privileged = user_obj.is_superuser or user_obj.is_staff or user_obj.role == 'admin'
            
            if not is_privileged:
                if selected_role and user_obj.role != selected_role:
                    raise serializers.ValidationError(
                        f"This account is registered as {user_obj.role}.", 
                        code='authorization'
                    )

            # 3. Autentifikacija
            # Prvo pokušavamo sa sistemskim username-om (najsigurnije za admina)
            user = authenticate(
                request=self.context.get('request'),
                username=user_obj.username,
                password=password
            )
            
            # Ako ne uspije, pokušavamo sa emailom (ako je USERNAME_FIELD = 'email')
            if not user:
                user = authenticate(
                    request=self.context.get('request'),
                    username=email,
                    password=password
                )

        except User.DoesNotExist:
            # Ne otkrivamo da li email postoji radi sigurnosti, samo bacamo opšti error
            user = None

        if not user:
            raise serializers.ValidationError('Incorrect email or password.', code='authorization')

        attrs['user'] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    username = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(write_only=True, required=False, allow_null=True)
    avatar_url = serializers.SerializerMethodField()
    has_custom_avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "role",
            "username",
            "avatar",
            "avatar_url",
            "has_custom_avatar",
        )
        read_only_fields = ("email", "role", "username", "avatar_url", "has_custom_avatar")

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.avatar:
            url = obj.avatar.url
            return request.build_absolute_uri(url) if request else url
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.username}"

    def get_has_custom_avatar(self, obj):
        return bool(obj.avatar)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, min_length=8)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        user = self.context["request"].user
        current_password = attrs.get("current_password")
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        if not user.check_password(current_password):
            raise serializers.ValidationError(
                {"current_password": "Current password is incorrect."}
            )

        if new_password != confirm_password:
            raise serializers.ValidationError(
                {"confirm_password": "New password and confirmation do not match."}
            )

        if current_password == new_password:
            raise serializers.ValidationError(
                {"new_password": "New password must be different from current password."}
            )

        return attrs