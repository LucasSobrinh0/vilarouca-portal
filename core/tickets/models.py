from django.db import models
from users.models import CustomUser

# Create your models here.
class Ticket(models.Model):
    STATUS_CHOICES = [
        ('aberto', 'Aberto'),
        ('em_andamento', 'Em Andamento'),
        ('respondido', 'Respondido'),
        ('fechado', 'Fechado'),
    ]

    cliente = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tickets')
    atendente = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='respostas')
    titulo = models.CharField(max_length=255)
    descricao = models.TextField()
    resposta = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aberto')
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.cliente.username} - {self.titulo}"


# models.py
class MensagemTicket(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='mensagens')
    remetente = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    conteudo = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.remetente.username}: {self.conteudo[:30]}"
