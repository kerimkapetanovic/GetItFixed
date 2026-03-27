from django.urls import path
from .views import RegisterView, CustomLoginView, LogoutView, HandymanListView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    # This matches the api.get('/api/accounts/handymen/') call
    path('handymen/', HandymanListView.as_view(), name='handyman-list'), 
]