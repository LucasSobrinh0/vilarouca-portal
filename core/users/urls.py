from django.urls import path
from .views import UserCreateView, UserListView, UserUpdateView, UserDestroyView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('list/', UserListView.as_view(), name='list'),
    path('update/<int:pk>/', UserUpdateView.as_view(), name='update'),  # Adicionando ID na URL
    path('delete/<int:pk>/', UserDestroyView.as_view(), name='delete'),  # Adicionando ID na URL
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Gera o token JWT ao fazer login
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Atualiza o token JWT
]
