from django.urls import path
from .views import SendMessageView, MessageListView

urlpatterns = [
    path('send/', SendMessageView.as_view(), name='send_message'),
    path('history/', MessageListView.as_view(), name='message_history'),
]
