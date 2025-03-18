from django.urls import path
from .views import CreateAtendimentoView, ListAtendimentosView, UpdateStatusAtendimentoView

urlpatterns = [
    path('create/', CreateAtendimentoView.as_view(), name='create_atendimento'),
    path('list/', ListAtendimentosView.as_view(), name='list_atendimentos'),
    path('update/<int:pk>/', UpdateStatusAtendimentoView.as_view(), name='update_atendimento_status'),
]
