from django.db import models
from users.models import CustomUser

class Atendimento(models.Model):
    STATUS_CHOICES = [
        ('aguardando', 'Aguardando'),
        ('aceito', 'Aceito'),
        ('em_atendimento', 'Em Atendimento'),
        ('atendido', 'Atendido'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cliente_atendimentos')
    atendente = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='atendente_atendimentos')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aguardando')
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Atendimento #{self.id} - Cliente: {self.cliente.username}, Atendente: {self.atendente.username}"

    def aceitar(self):
        if self.status == 'aguardando':
            self.status = 'aceito'
            self.save()

    def iniciar(self):
        if self.status == 'aceito':
            self.status = 'em_atendimento'
            self.save()

    def finalizar(self):
        if self.status == 'em_atendimento':
            self.status = 'atendido'
            self.save()
