from django.urls import path
from . import views

urlpatterns = [
    # Home page
    path('', views.home, name='home'),

    # Event data (AJAX)
    path('get-event-details/<str:event_name>/', views.get_event_details, name='get_event_details'),

    # Registration
    path('register-participant/', views.register_participant, name='register_participant'),

    # APIs
    path('api/participants/', views.get_participants, name='get_participants'),
    path('api/events/', views.get_events, name='get_events'),

    # Registration confirmation page
    path('registration/<str:team_code>/', views.registration_details, name='registration_details'),
]
