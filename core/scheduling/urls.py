# scheduling/urls.py
from django.urls import path
from .views import *

urlpatterns = [
    # Admin
    path('admin/list/', ScheduleListAdminView.as_view()),
    path('admin/create/', ScheduleCreateAdminView.as_view()),
    path('admin/update/<int:pk>/', ScheduleUpdateAdminView.as_view()),
    path('admin/delete/<int:pk>/', ScheduleDestroyAdminView.as_view()),
    path('admin/cancel/<int:pk>/', ScheduleCancelAdminView.as_view()),
    path('admin/confirm/<int:pk>/', ScheduleConfirmAdminView.as_view()),


    # Cliente
    path('client/list/', ScheduleListClientView.as_view()),
    path('client/create/', ScheduleCreateClientView.as_view()),
    path('client/detail/<int:pk>/', ScheduleDetailClientView.as_view()),
    path('client/update/<int:pk>/', ScheduleUpdateClientView.as_view()),

    # Atendente
    path('attendant/list/', ScheduleListAttendantView.as_view()),
    path('attendant/detail/<int:pk>/', ScheduleDetailAttendantView.as_view()),
    path('attendant/create/', ScheduleCreateAttendantView.as_view()),
    path('attendant/update/<int:pk>/', ScheduleUpdateAttendantView.as_view()),
    path('attendant/confirm/<int:pk>/', ScheduleConfirmAttendantView.as_view()),
    path('attendant/cancel/<int:pk>/', ScheduleCancelAttendantView.as_view()),
    path('attendant/history/', ScheduleHistoryAttendantView.as_view()),
    path('attendant/all/', ScheduleAllAttendantView.as_view()),
]
