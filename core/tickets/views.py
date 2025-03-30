from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Ticket, MensagemTicket
from .serializers import (
    TicketSerializer,
    MensagemTicketSerializer,
    TicketCreateSerializer,
    MensagemTicketCreateSerializer,
    TicketUpdateSerializer,
    MensagemTicketUpdateSerializer,
    TicketListSerializer,
    MensagemTicketListSerializer,
    TicketDetailSerializer,
    MensagemTicketDetailSerializer,
)

# Permissões personalizadas
class IsAtendente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('atendente', 'administrator')

class IsCliente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'cliente'

# View Base que aplica filtros de acordo com o tipo de usuário
class BaseTicketView(generics.GenericAPIView):
    def get_queryset(self):
        user = self.request.user
        if user.role in ('atendente', 'administrator'):
            return Ticket.objects.all()
        elif user.role == 'cliente':
            return Ticket.objects.filter(cliente=user)
        return Ticket.objects.none()

# ========== TICKET VIEWS ==========

class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if Ticket.objects.filter(cliente=user, title=serializer.validated_data['title'], status="aberto").exists():
            raise serializers.ValidationError("Você já possui um ticket com esse título em aberto.")
        serializer.save(cliente=user)

class TicketListView(BaseTicketView, generics.ListAPIView):
    serializer_class = TicketListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'status']

class TicketDetailView(BaseTicketView, generics.RetrieveAPIView):
    serializer_class = TicketDetailSerializer
    permission_classes = [IsAuthenticated]

class TicketUpdateView(BaseTicketView, generics.UpdateAPIView):
    serializer_class = TicketUpdateSerializer
    permission_classes = [IsAuthenticated]

class TicketDestroyView(BaseTicketView, generics.DestroyAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAdminUser]

# VIEWS específicas para cliente ou atendente
class TicketAtendenteView(BaseTicketView, generics.ListAPIView):
    serializer_class = TicketListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(atendente=self.request.user)

class TicketClienteView(BaseTicketView, generics.ListAPIView):
    serializer_class = TicketListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(cliente=self.request.user)

class TicketAtendenteUpdateView(BaseTicketView, generics.UpdateAPIView):
    serializer_class = TicketUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.all()  # Permite buscar todos

    def perform_update(self, serializer):
        instance = self.get_object()
        if not instance.atendente:
            serializer.save(atendente=self.request.user)
        else:
            serializer.save()

class TicketClienteUpdateView(BaseTicketView, generics.UpdateAPIView):
    serializer_class = TicketUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(cliente=self.request.user)

# ========== MENSAGEM TICKET VIEWS ==========

class MensagemTicketCreateView(generics.CreateAPIView):
    queryset = MensagemTicket.objects.all()
    serializer_class = MensagemTicketCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        ticket = serializer.validated_data['ticket']
        # Se ticket estiver fechado, não pode criar mensagem
        if ticket.status in ('fechado', 'sem_solucao'):
            raise serializers.ValidationError("O ticket está fechado. Não é possível enviar mensagens.")
        serializer.save(remetente=user)

class MensagemTicketListView(BaseTicketView, generics.ListAPIView):
    serializer_class = MensagemTicketListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('atendente', 'administrator'):
            return MensagemTicket.objects.all()
        elif user.role == 'cliente':
            return MensagemTicket.objects.filter(ticket__cliente=user)
        return MensagemTicket.objects.none()

class MensagemTicketDetailView(BaseTicketView, generics.RetrieveAPIView):
    serializer_class = MensagemTicketDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('atendente', 'administrator'):
            return MensagemTicket.objects.all()
        elif user.role == 'cliente':
            return MensagemTicket.objects.filter(ticket__cliente=user)
        return MensagemTicket.objects.none()

class MensagemTicketUpdateView(BaseTicketView, generics.UpdateAPIView):
    serializer_class = MensagemTicketUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('atendente', 'administrator'):
            return MensagemTicket.objects.all()
        elif user.role == 'cliente':
            return MensagemTicket.objects.filter(remetente=user)
        return MensagemTicket.objects.none()

class MensagemTicketDestroyView(BaseTicketView, generics.DestroyAPIView):
    serializer_class = MensagemTicketSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('atendente', 'administrator'):
            return MensagemTicket.objects.all()
        return MensagemTicket.objects.none()
