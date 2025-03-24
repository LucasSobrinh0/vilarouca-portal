from django.contrib.auth.models import AbstractUser
from django.db import models


class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    cnpj = models.CharField(max_length=18, unique=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('cliente', 'Cliente'),
        ('atendente', 'Atendente'),
        ('administrator', 'Administrator')
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cliente')
    companies = models.ManyToManyField(Company, related_name='users', blank=True)

    def __str__(self):
        return f"{self.username} - {self.role}"
