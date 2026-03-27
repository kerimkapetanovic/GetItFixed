from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from rest_framework.authtoken.models import Token

class CookieTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # IMPORTANT: Make sure 'auth_token' is the EXACT name used in your login view
        token_key = request.COOKIES.get('auth_token')
        
        if not token_key:
            return None

        try:
            token = Token.objects.select_related('user').get(key=token_key)
        except Token.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token')

        return (token.user, token)