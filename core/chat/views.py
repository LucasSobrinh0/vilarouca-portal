from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Message
from .serializers import MessageSerializer
from users.models import CustomUser
from rest_framework.response import Response
from rest_framework import status

class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]  # Apenas usuários autenticados podem enviar mensagens

    def perform_create(self, serializer):
        """
        Ao enviar uma mensagem, o usuário logado será automaticamente definido como o remetente.
        """
        sender = self.request.user
        receiver_id = self.request.data.get('receiver')

        try:
            receiver = CustomUser.objects.get(id=receiver_id)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Usuário destinatário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Impedir que administradores enviem mensagens (se necessário)
        if sender.role == "administrador":
            return Response({'error': 'Administradores não podem enviar mensagens.'}, status=status.HTTP_403_FORBIDDEN)

        # Permitir apenas cliente -> atendente ou atendente -> cliente
        if sender.role == receiver.role:
            return Response({'error': 'Mensagens devem ser entre clientes e atendentes.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(sender=sender, receiver=receiver)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Retorna apenas as mensagens do usuário logado, filtrando entre cliente e atendente.
        """
        user = self.request.user
        contact_id = self.request.query_params.get('contact')  # ID do outro usuário na conversa

        if not contact_id:
            return Message.objects.none()  # Se não enviar um contato, retorna lista vazia

        try:
            contact = CustomUser.objects.get(id=contact_id)
        except CustomUser.DoesNotExist:
            return Message.objects.none()  # Retorna lista vazia se o contato não existir

        # O cliente só pode ver mensagens com um atendente e vice-versa
        if user.role == contact.role:
            return Message.objects.none()  # Bloqueia cliente-cliente ou atendente-atendente

        # Filtrar mensagens entre os dois usuários
        return Message.objects.filter(
            (models.Q(sender=user) & models.Q(receiver=contact)) |
            (models.Q(sender=contact) & models.Q(receiver=user))
        ).order_by('timestamp')