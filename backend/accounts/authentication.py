# accounts/authentication.py
from rest_framework.authentication import TokenAuthentication

class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        # Gledamo u kuki pod nazivom 'auth_token' koji smo podesili u views.py
        token = request.COOKIES.get('auth_token')
        
        if not token:
            return None

        return self.authenticate_credentials(token)