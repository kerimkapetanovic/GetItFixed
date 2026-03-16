from django.urls import path
from .views import LogoutView, RegisterView, CustomLoginView # uvezi ga

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'), # Dodaj ovo
]