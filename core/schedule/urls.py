from django.urls import path
from .views import (
    CreateAgendamentoView,
    ConfirmAgendamentoView,
    ListAgendamentosView
)

urlpatterns = [
    path('create/', CreateAgendamentoView.as_view(), name='create_agendamento'),
    path('confirm/<int:pk>/', ConfirmAgendamentoView.as_view(), name='confirm_agendamento'),
    path('list/', ListAgendamentosView.as_view(), name='list_agendamentos'),
]
