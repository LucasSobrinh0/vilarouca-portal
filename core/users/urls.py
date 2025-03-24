from django.urls import path
from .views import UserCreateView, UserListView, UserUpdateView, UserDestroyView, CompanyListView, CompanyCreateView, CompanyUpdateView, CompanyDestroyView, CustomTokenObtainPairView, CurrentUserView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('list/', UserListView.as_view(), name='list'),
    path('update/<int:pk>/', UserUpdateView.as_view(), name='update'),  # Adicionando ID na URL
    path('delete/<int:pk>/', UserDestroyView.as_view(), name='delete'),  # Adicionando ID na URL
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # Gera o token JWT ao fazer login
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Atualiza o token JWT
    path('current-user/', CurrentUserView.as_view(), name='current-user'),
]

urlpatterns += [
    path('companies/', CompanyListView.as_view(), name='company-list'),
    path('companies/create/', CompanyCreateView.as_view(), name='company-create'),
    path('companies/<int:pk>/update/', CompanyUpdateView.as_view(), name='company-update'),
    path('companies/<int:pk>/delete/', CompanyDestroyView.as_view(), name='company-delete'),
]
