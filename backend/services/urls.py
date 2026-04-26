from django.urls import path
from .views import AIHelperView, HandymanListByCategoryView

urlpatterns = [
    path("ai-helper/", AIHelperView.as_view(), name="ai-helper"),
    # This creates the endpoint: /api/services/plumbing/
    path('<str:category_slug>/', HandymanListByCategoryView.as_view(), name='handyman-list-by-category'),
]