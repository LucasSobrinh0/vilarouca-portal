from rest_framework import serializers
from .models import Agendamento

class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = ['id', 'cliente', 'atendente', 'data_horario', 'status', 'criado_em']
        read_only_fields = ['id', 'status', 'criado_em']
