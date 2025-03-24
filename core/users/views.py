from rest_framework import generics
from .models import CustomUser, Company
from .serializers import UserSerializer, CompanySerializer
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from rest_framework.response import Response


class UserCreateView(generics.CreateAPIView):
    """
    Permite que novos usuários sejam criados. Se quiser que somente admins possam cadastrar,
    mantenha `IsAdminUser`. Se quiser permitir qualquer pessoa, mude para `AllowAny`.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Alterar para [AllowAny] se quiser cadastro aberto.

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class UserListView(generics.ListAPIView):
    """
    Lista todos os usuários cadastrados. Apenas administradores podem visualizar essa lista.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class UserUpdateView(generics.UpdateAPIView):
    """
    Permite que um administrador atualize um usuário específico.
    Agora usa 'lookup_field' para identificar o usuário pelo ID passado na URL.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'  # Garante que o ID do usuário seja necessário para atualização


class UserDestroyView(generics.DestroyAPIView):
    """
    Permite que um administrador exclua um usuário específico.
    Agora usa 'lookup_field' para identificar o usuário pelo ID passado na URL.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'  # Garante que o ID do usuário seja necessário para exclusão


class CompanyListView(generics.ListAPIView):
    """
    Lista todas as empresas cadastradas.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminUser]


class CompanyCreateView(generics.CreateAPIView):
    """
    Permite que uma empresa seja criada.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminUser]


class CompanyUpdateView(generics.UpdateAPIView):
    """
    Permite que uma empresa seja atualizada.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'  # Garante que o ID da empresa seja necessário para atualização


class CompanyDestroyView(generics.DestroyAPIView):
    """
    Permite que um administrador exclua uma empresa específica.
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'  # Garante que o ID da empresa seja necessário para exclusão


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)