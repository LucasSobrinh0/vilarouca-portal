from rest_framework import serializers
from .models import Ticket, MensagemTicket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['id', 'cliente', 'status', 'resposta', 'atendente', 'criado_em', 'atualizado_em']

# serializers.py
class MensagemTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensagemTicket
        fields = '__all__'
        read_only_fields = ['remetente', 'criado_em']


