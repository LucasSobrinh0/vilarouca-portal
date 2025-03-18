from django.db import models
from django.utils import timezone
from users.models import CustomUser

class Agendamento(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('confirmado', 'Confirmado'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='agendamentos_cliente')
    atendente = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='agendamentos_atendente')
    data_horario = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agendamento #{self.id} em {self.data_horario} - Cliente: {self.cliente.username}"
