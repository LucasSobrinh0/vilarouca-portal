from django.shortcuts import render

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Atendimento
from .serializers import AtendimentoSerializer
from users.models import CustomUser

class CreateAtendimentoView(generics.CreateAPIView):
    """
    O cliente cria uma solicitação de atendimento.
    """
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Se for necessário, garantir que o user logado seja o cliente
        user = self.request.user
        if user.role != 'cliente':
            raise PermissionError("Apenas clientes podem criar atendimentos.")

        # Precisamos associar um atendente. Você pode:
        # 1) Receber do front-end qual atendente deve atender, OU
        # 2) Definir automaticamente.
        atendente_id = self.request.data.get('atendente')
        if not atendente_id:
            raise ValueError("É necessário informar um atendente.")

        atendente = CustomUser.objects.get(id=atendente_id, role='atendente')
        serializer.save(cliente=user, atendente=atendente, status='aguardando')


class ListAtendimentosView(generics.ListAPIView):
    """
    Lista atendimentos do usuário logado: se for cliente, vê os dele; se for atendente, vê os dele.
    Se for administrador, pode ver todos.
    """
    serializer_class = AtendimentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'cliente':
            return Atendimento.objects.filter(cliente=user)
        elif user.role == 'atendente':
            return Atendimento.objects.filter(atendente=user)
        else:  # Administrador
            return Atendimento.objects.all()


class UpdateStatusAtendimentoView(generics.UpdateAPIView):
    """
    Atualiza o status do atendimento seguindo o fluxo:
    - aguardar -> aceito
    - aceito -> em_atendimento
    - em_atendimento -> atendido
    """
    serializer_class = AtendimentoSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Atendimento.objects.all()
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        atendimento = self.get_object()
        user = request.user

        # Se o user for atendente, pode aceitar, iniciar ou finalizar
        # Se o user for cliente, talvez não possa mexer no status. Depende da sua regra.
        if user.role != 'atendente':
            return Response({'error': 'Apenas atendentes podem alterar o status.'}, 
                            status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status == 'aceito':
            atendimento.aceitar()
        elif new_status == 'em_atendimento':
            atendimento.iniciar()
        elif new_status == 'atendido':
            atendimento.finalizar()
        else:
            return Response({'error': 'Status inválido ou fluxo incorreto.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(atendimento)
        return Response(serializer.data, status=status.HTTP_200_OK)
