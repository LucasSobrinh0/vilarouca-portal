from django.shortcuts import render
from rest_framework import generics
from .models import Schedule
from .serializers import ScheduleListAdminSerializer, ScheduleUpdateAdminSerializer, ScheduleDestroyAdminSerializer, ScheduleCreateAdminSerializer, ScheduleListClientSerializer, ScheduleCreateClientSerializer, ScheduleDetailClientSerializer, ScheduleUpdateClientSerializer, ScheduleListAttendantSerializer, ScheduleDetailAttendantSerializer, ScheduleCreateAttendantSerializer, ScheduleUpdateAttendantSerializer, ScheduleConfirmAttendantSerializer, ScheduleCancelAttendantSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework import serializers
from tickets.views import IsAtendente

# Views para o modelo Schedule para administrador

class BaseScheduleAdminView(generics.GenericAPIView):
    queryset = Schedule.objects.all()
    permission_classes = [IsAdminUser]


class ScheduleListAdminView(BaseScheduleAdminView, generics.ListAPIView):
    serializer_class = ScheduleListAdminSerializer


class ScheduleUpdateAdminView(BaseScheduleAdminView, generics.UpdateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleUpdateAdminSerializer

    def perform_update(self, serializer):
        # Admin pode editar qualquer coisa, inclusive status
        serializer.save()

class ScheduleCreateAdminView(BaseScheduleAdminView, generics.CreateAPIView):
    serializer_class = ScheduleCreateAdminSerializer


class ScheduleDestroyAdminView(BaseScheduleAdminView, generics.DestroyAPIView):
    serializer_class = ScheduleDestroyAdminSerializer


class ScheduleCancelAdminView(BaseScheduleAdminView, generics.UpdateAPIView):
    serializer_class = ScheduleCancelAttendantSerializer  # Reaproveitando

    def get_queryset(self):
        return Schedule.objects.all()

    def perform_update(self, serializer):
        serializer.save()


class ScheduleConfirmAdminView(BaseScheduleAdminView, generics.UpdateAPIView):
    serializer_class = ScheduleConfirmAttendantSerializer  # Reaproveitando

    def get_queryset(self):
        return Schedule.objects.all()

    def perform_update(self, serializer):
        serializer.save()

# Views para o modelo Schedule para cliente

class BaseScheduleClientView(generics.GenericAPIView):
    queryset = Schedule.objects.all()
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'cliente':
            return Schedule.objects.filter(client=user)
        return Schedule.objects.none()


class ScheduleListClientView(BaseScheduleClientView, generics.ListAPIView):
    serializer_class = ScheduleListClientSerializer


class ScheduleCreateClientView(BaseScheduleClientView, generics.CreateAPIView):
    serializer_class = ScheduleCreateClientSerializer
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)


class ScheduleDetailClientView(BaseScheduleClientView, generics.RetrieveAPIView):
    serializer_class = ScheduleDetailClientSerializer


class ScheduleUpdateClientView(BaseScheduleClientView, generics.UpdateAPIView):
    serializer_class = ScheduleUpdateClientSerializer

    def perform_update(self, serializer):
        agendamento = self.get_object()

        if agendamento.status == 'cancelled':
            raise serializers.ValidationError("O agendamento está cancelado.")

        if agendamento.status != "pending":
            raise serializers.ValidationError("O agendamento não pode ser editado.")

        if 'status' in serializer.validated_data:
            raise serializers.ValidationError("Você não pode alterar o status do agendamento.")

        serializer.save()


# Views para o modelo Schedule para atendente

class BaseScheduleAttendantView(generics.GenericAPIView):
    queryset = Schedule.objects.all()
    permission_classes = [IsAtendente]
    def get_queryset(self):
        user = self.request.user
        if user.role == 'atendente':
            return Schedule.objects.all()
        return Schedule.objects.none()
    

class ScheduleHistoryAttendantView(BaseScheduleAttendantView, generics.ListAPIView):
    serializer_class = ScheduleListAttendantSerializer

    def get_queryset(self):
        user = self.request.user
        return Schedule.objects.filter(atendente=user, status__in=["confirmed", "cancelled"]).order_by("-date", "-time")

class ScheduleAllAttendantView(BaseScheduleAttendantView, generics.ListAPIView):
    serializer_class = ScheduleListAttendantSerializer

    def get_queryset(self):
        return Schedule.objects.all().order_by("-date", "-time")

class ScheduleListAttendantView(BaseScheduleAttendantView, generics.ListAPIView):
    serializer_class = ScheduleListAttendantSerializer


class ScheduleDetailAttendantView(BaseScheduleAttendantView, generics.RetrieveAPIView):
    serializer_class = ScheduleDetailAttendantSerializer


class ScheduleCreateAttendantView(BaseScheduleAttendantView, generics.CreateAPIView):
    serializer_class = ScheduleCreateAttendantSerializer


class ScheduleUpdateAttendantView(BaseScheduleAttendantView, generics.UpdateAPIView):
    serializer_class = ScheduleUpdateAttendantSerializer

    def perform_update(self, serializer):
        serializer.save(atendente=self.request.user)


class ScheduleConfirmAttendantView(BaseScheduleAttendantView, generics.UpdateAPIView):
    serializer_class = ScheduleConfirmAttendantSerializer

    def perform_update(self, serializer):
        serializer.save(atendente=self.request.user)


class ScheduleCancelAttendantView(BaseScheduleAttendantView, generics.UpdateAPIView):
    serializer_class = ScheduleCancelAttendantSerializer

