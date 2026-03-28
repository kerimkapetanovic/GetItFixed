from django.urls import path
from .views import (
    RegisterView,
    CustomLoginView,
    LogoutView,
    HandymanListView,
    CurrentUserProfileView,
    ChangePasswordView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    # This matches the api.get('/api/accounts/handymen/') call
    path('handymen/', HandymanListView.as_view(), name='handyman-list'), 
]