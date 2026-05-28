from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
import boto3
import uuid
import os

User = get_user_model()

def upload_avatar_to_supabase(file_obj):
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        endpoint_url=os.getenv('AWS_S3_ENDPOINT_URL'),
        region_name=os.getenv('AWS_S3_REGION_NAME'),
    )
    
    ext = os.path.splitext(file_obj.name)[1].lower()  # .jpg, .png...
    filename = f"profile_{uuid.uuid4().hex[:8]}{ext}"
    
    s3.upload_fileobj(
        file_obj,
        os.getenv('AWS_STORAGE_BUCKET_NAME'),  # 'avatars'
        filename,
        ExtraArgs={'ContentType': file_obj.content_type}
    )
    
    base_url = os.getenv('NEXT_PUBLIC_SUPABASE_STORAGE_URL')
    return f"{base_url}/avatars/{filename}"

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    accepted_terms = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 
            'first_name', 'last_name', 'role', 'phone',
            'county', 'city', 'zip_code', 'service_type', 'wallet_balance',
            'accepted_terms'
        )

    def validate(self, attrs):
        if attrs.get('role') == 'handyman' and not attrs.get('service_type'):
            raise serializers.ValidationError(
                {"service_type": "Handyman must select a service type."}
            )
        if not attrs.get('accepted_terms'):
            raise serializers.ValidationError(
                {"accepted_terms": "You must accept the Terms of Service before creating an account."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('accepted_terms', None)
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
            service_type=validated_data.get('service_type', None),
            wallet_balance=validated_data.get('wallet_balance', 0.00),
            terms_accepted=True,
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
            user_obj = User.objects.get(email=email)
            is_privileged = user_obj.is_superuser or user_obj.is_staff or user_obj.role == 'admin'
            
            if not is_privileged:
                if selected_role and user_obj.role != selected_role:
                    raise serializers.ValidationError(
                        f"This account is registered as {user_obj.role}.", 
                        code='authorization'
                    )

            user = authenticate(
                request=self.context.get('request'),
                username=user_obj.username,
                password=password
            )
            
            if not user:
                user = authenticate(
                    request=self.context.get('request'),
                    username=email,
                    password=password
                )

        except User.DoesNotExist:
            user = None

        if not user:
            raise serializers.ValidationError('Incorrect email or password.', code='authorization')

        attrs['user'] = user
        return attrs


# ✅ SAMO JEDAN ProfileSerializer
class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    username = serializers.CharField(read_only=True)
    avatar = serializers.ImageField(write_only=True, required=False, allow_null=True)    
    avatar_url = serializers.SerializerMethodField()
    has_custom_avatar = serializers.SerializerMethodField()
    locked_balance = serializers.DecimalField(
        source="wallet_locked_balance",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )
    wallet_available_balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "first_name", "last_name", "email", "role", "username",
            "avatar", "avatar_url", "has_custom_avatar",
            "phone", "county", "city", "zip_code",
            "wallet_balance", "locked_balance", "wallet_available_balance"
        )
        read_only_fields = (
            "email",
            "role",
            "username",
            "avatar_url",
            "has_custom_avatar",
            "wallet_balance",
            "locked_balance",
            "wallet_available_balance",
        )

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar  # već je puni URL string
        return f"https://api.dicebear.com/7.x/avataaars/svg?seed={obj.username}"



    def get_has_custom_avatar(self, obj):
        return bool(obj.avatar)

    def get_wallet_available_balance(self, obj):
        return obj.wallet_available_balance

    def update(self, instance, validated_data):
        avatar_file = validated_data.pop('avatar', None)

        if avatar_file is not None:
            if avatar_file:
                try:
                    instance.avatar = upload_avatar_to_supabase(avatar_file)  # ✅ ispravno
                except Exception as e:
                    raise serializers.ValidationError({"avatar": f"Upload failed: {str(e)}"})
            else:
                instance.avatar = None

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class UserSerializer(serializers.ModelSerializer):
    location = serializers.CharField(source='city', default="Sarajevo")
    phone_number = serializers.CharField(source='phone', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'role',
            'location',
            'service_type',
            'hourly_rate',
            'rating',
            'wallet_balance',
            'date_joined',
            'is_active',
            'county',
            'city',
            'zip_code',
        ]
        read_only_fields = ['id', 'date_joined']

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