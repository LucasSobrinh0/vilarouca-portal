from rest_framework import generics
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAdminUser


class UserCreateView(generics.CreateAPIView):
    """
    Permite que novos usuários sejam criados. Se quiser que somente admins possam cadastrar,
    mantenha `IsAdminUser`. Se quiser permitir qualquer pessoa, mude para `AllowAny`.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]  # Alterar para [AllowAny] se quiser cadastro aberto.


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
