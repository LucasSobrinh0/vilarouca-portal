from django.urls import path
from .views import TicketListCreateView, TicketCreateView, TicketUpdateView, TicketDeleteView, TicketResponderView, MensagemTicketListView, MensagemTicketCreateView

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='ticket-create'),
    path('list/', TicketListCreateView.as_view(), name='ticket-list'),
    path('<int:pk>/update/', TicketUpdateView.as_view(), name='ticket-update'),
    path('<int:pk>/delete/', TicketDeleteView.as_view(), name='ticket-delete'),
    path('responder/<int:pk>/', TicketResponderView.as_view(), name='ticket-responder'),
    path('<int:ticket_id>/mensagens/', MensagemTicketListView.as_view(), name='listar-mensagens-ticket'),
    path('mensagens/enviar/', MensagemTicketCreateView.as_view(), name='enviar-mensagem-ticket'),
]
