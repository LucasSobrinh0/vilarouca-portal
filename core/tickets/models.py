from django.db import models
from users.models import CustomUser
# Create your models here.

class Ticket(models.Model):
    STATUS_CHOICES = [
        ("aberto", "Aberto"),
        ("em_andamento", "Em Andamento"),
        ("fechado", "Fechado"),
        ('sem_solucao', 'Sem Solução')
    ]
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=255, choices=STATUS_CHOICES, default='aberto')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cliente = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tickets')
    atendente = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='atendimentos')


    class Meta:
        verbose_name = 'Ticket'
        verbose_name_plural = 'Tickets'

    def __str__(self):
        return self.title

class MensagemTicket(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='mensagens')
    remetente = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='mensagens_enviadas')
    mensagem = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Mensagem Ticket'
        verbose_name_plural = 'Mensagens Tickets'

    def __str__(self):
        return f"{self.remetente} - {self.mensagem[:50]}"
