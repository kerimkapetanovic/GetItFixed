from django.urls import path
from .views import HandymanListByCategoryView

urlpatterns = [
    # This creates the endpoint: /api/services/plumbing/
    path('<str:category_slug>/', HandymanListByCategoryView.as_view(), name='handyman-list-by-category'),
]