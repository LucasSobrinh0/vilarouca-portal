from django.db import models
from users.models import CustomUser

# Create your models here.
class Schedule(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('confirmed', 'Confirmado'),
        ('cancelled', 'Cancelado'),
    ]
    status = models.CharField(max_length=255, choices=STATUS_CHOICES, default='pending')
    date = models.DateField()
    time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    observation = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='agendamentos_solicitados')
    atendente = models.ForeignKey(
    CustomUser,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='agendamentos_confirmados'
)
    def __str__(self):
        return f"{self.client} - {self.atendente} - {self.date} - {self.time}"
