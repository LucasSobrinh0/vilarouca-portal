from django.shortcuts import render
from rest_framework import permissions
# Create your views here.
from rest_framework import generics
from .models import Ticket, MensagemTicket
from .serializers import TicketSerializer, MensagemTicketSerializer
from rest_framework import serializers

from rest_framework.permissions import BasePermission

class IsAdminOrAtendente(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == 'atendente' or request.user.is_staff)


class TicketListCreateView(generics.ListCreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(cliente=self.request.user)
    
    def get_queryset(self):
        user = self.request.user

        if user.role == "cliente":
            return Ticket.objects.filter(cliente=user)
        
        elif user.role == "atendente":
            # Se quiser exibir apenas tickets abertos ou em andamento:
            return Ticket.objects.filter(status__in=["aberto", "em_andamento"])
        
        elif user.role == "administrador":
            return Ticket.objects.all()

        return Ticket.objects.none()


class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)
    
    # def perform_create(self, serializer):
    #     cliente = self.request.user
    #     if Ticket.objects.filter(cliente=cliente, status='aberto').exists():
    #         raise serializers.ValidationError("Você já possui um ticket aberto.")
    #     serializer.save(cliente=cliente)



class TicketUpdateView(generics.UpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Ticket.objects.filter(cliente=self.request.user)

class TicketDeleteView(generics.DestroyAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Ticket.objects.all()

class TicketResponderView(generics.UpdateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsAdminOrAtendente]

    def get_queryset(self):
        return Ticket.objects.all()

# views.py
class MensagemTicketCreateView(generics.CreateAPIView):
    serializer_class = MensagemTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(remetente=self.request.user)

class MensagemTicketListView(generics.ListAPIView):
    serializer_class = MensagemTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket_id = self.kwargs['ticket_id']
        return MensagemTicket.objects.filter(ticket_id=ticket_id).order_by('criado_em')

