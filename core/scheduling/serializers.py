from rest_framework import serializers
from users.models import CustomUser
from tickets.serializers import UserBasicSerializer
from .models import Schedule

# Serializers para o modelo Schedule

class ScheduleSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer()
    atendente = UserBasicSerializer()
    class Meta:
        model = Schedule
        fields = '__all__'

# Serializers para clientes

class ScheduleCreateClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['date', 'time', 'observation']


class ScheduleListClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'client', 'atendente', 'date', 'observation', 'time', 'status']


class ScheduleDetailClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'client', 'atendente', 'date', 'time', 'status', 'observation']


class ScheduleUpdateClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'date', 'time', 'observation']


# Serializers para atendentes

class ScheduleListAttendantSerializer(serializers.ModelSerializer):
    client = UserBasicSerializer()
    atendente = UserBasicSerializer()

    class Meta:
        model = Schedule
        fields = ['id', 'client', 'atendente', 'date', 'time', 'status', 'observation']



class ScheduleDetailAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'client', 'atendente', 'date', 'time', 'status', 'observation']


class ScheduleCreateAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['client', 'date', 'time', 'observation']


class ScheduleUpdateAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'date', 'time', 'status', 'atendente']
        read_only_fields = ['atendente']


class ScheduleConfirmAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'status']  # Não precisa incluir 'atendente' se já vai definir na view




class ScheduleCancelAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'status']


# Serializers para Administrador

class ScheduleListAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'


class ScheduleUpdateAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'status', 'observation', 'date', 'time']


class ScheduleDestroyAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id']


class ScheduleCreateAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['client', 'atendente', 'date', 'time', 'observation']



