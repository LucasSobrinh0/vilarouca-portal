from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Agendamento
from .serializers import AgendamentoSerializer
from users.models import CustomUser

class CreateAgendamentoView(generics.CreateAPIView):
    """
    O cliente solicita um agendamento para um determinado dia/horário com o atendente.
    """
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'cliente':
            raise PermissionError("Apenas clientes podem criar agendamentos.")

        # Recebe o ID do atendente do front-end
        atendente_id = self.request.data.get('atendente')
        if not atendente_id:
            raise ValueError("É necessário informar um atendente.")

        try:
            atendente = CustomUser.objects.get(id=atendente_id, role='atendente')
        except CustomUser.DoesNotExist:
            raise ValueError("Atendente inválido.")

        # Recebe data e hora desejada
        data_horario = self.request.data.get('data_horario')  # string no formato ISO 8601
        serializer.save(cliente=user, atendente=atendente, data_horario=data_horario, status='pendente')


class ConfirmAgendamentoView(generics.UpdateAPIView):
    """
    O atendente confirma (ou cancela) um agendamento.
    """
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        agendamento = self.get_object()
        user = request.user

        if user.role != 'atendente':
            return Response({'error': 'Apenas atendentes podem confirmar ou cancelar.'},
                            status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')  # 'confirmado' ou 'cancelado'
        if new_status not in ['confirmado', 'cancelado']:
            return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        agendamento.status = new_status
        agendamento.save()

        serializer = self.get_serializer(agendamento)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListAgendamentosView(generics.ListAPIView):
    """
    Exibe todos os agendamentos se for admin, 
    ou filtra os agendamentos do cliente ou do atendente logado.
    """
    serializer_class = AgendamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'cliente':
            return Agendamento.objects.filter(cliente=user)
        elif user.role == 'atendente':
            return Agendamento.objects.filter(atendente=user)
        else:  # Administrador
            return Agendamento.objects.all()
