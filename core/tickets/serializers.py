from rest_framework import serializers
from .models import Ticket, MensagemTicket
from users.models import CustomUser

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'role']
        
class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'

class MensagemTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensagemTicket
        fields = '__all__'

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['title', 'description']

class MensagemTicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensagemTicket
        fields = ['mensagem', 'ticket']


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['description', 'status']
        extra_kwargs = {
            'description': {'required': False},
            'status': {'required': False},
        }

class TicketAtendenteUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['status']

class MensagemTicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensagemTicket
        fields = ['mensagem']

class TicketListSerializer(serializers.ModelSerializer):
    cliente = UserBasicSerializer()
    atendente = UserBasicSerializer()

    class Meta:
        model = Ticket
        fields = ['id', 'title', 'status', 'cliente', 'atendente', 'created_at']




class MensagemTicketListSerializer(serializers.ModelSerializer):
    remetente = UserBasicSerializer()  # ADICIONE ESTA LINHA

    class Meta:
        model = MensagemTicket
        fields = ['id', 'mensagem', 'remetente', 'ticket', 'created_at']

class MensagemTicketDetailSerializer(serializers.ModelSerializer):
    remetente = UserBasicSerializer()  # OPCIONAL, mesmo princípio

    class Meta:
        model = MensagemTicket
        fields = ['id', 'mensagem', 'remetente', 'ticket', 'created_at', 'updated_at']

class TicketDetailSerializer(serializers.ModelSerializer):
    cliente = UserBasicSerializer()
    atendente = UserBasicSerializer()

    class Meta:
        model = Ticket
        fields = '__all__'