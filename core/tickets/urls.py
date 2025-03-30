from django.urls import path
from .views import TicketCreateView, TicketListView, TicketDetailView, TicketUpdateView, TicketDestroyView, TicketAtendenteView, TicketClienteView, TicketAtendenteUpdateView, TicketClienteUpdateView, MensagemTicketCreateView, MensagemTicketListView, MensagemTicketDetailView, MensagemTicketUpdateView, MensagemTicketDestroyView

urlpatterns = [
    path('create/', TicketCreateView.as_view(), name='ticket-create'),
    path('list/', TicketListView.as_view(), name='ticket-list'),
    path('detail/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('update/<int:pk>/', TicketUpdateView.as_view(), name='ticket-update'),
    path('delete/<int:pk>/', TicketDestroyView.as_view(), name='ticket-delete'),
    path('atendente/', TicketAtendenteView.as_view(), name='ticket-atendente'),
    path('cliente/', TicketClienteView.as_view(), name='ticket-cliente'),
    path('atendente/update/<int:pk>/', TicketAtendenteUpdateView.as_view(), name='ticket-atendente-update'),
    path('cliente/update/<int:pk>/', TicketClienteUpdateView.as_view(), name='ticket-cliente-update'),
]

urlpatterns += [
    path('mensagem/create/', MensagemTicketCreateView.as_view(), name='mensagem-ticket-create'),
    path('mensagem/list/', MensagemTicketListView.as_view(), name='mensagem-ticket-list'),  
    path('mensagem/detail/<int:pk>/', MensagemTicketDetailView.as_view(), name='mensagem-ticket-detail'),
    path('mensagem/update/<int:pk>/', MensagemTicketUpdateView.as_view(), name='mensagem-ticket-update'),
    path('mensagem/delete/<int:pk>/', MensagemTicketDestroyView.as_view(), name='mensagem-ticket-delete'),
]
