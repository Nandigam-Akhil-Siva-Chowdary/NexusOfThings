from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('events/', views.events_page, name='events'),
    path('contact/', views.contact, name='contact'),
    path('get-event-details/<str:event_name>/', views.get_event_details, name='get_event_details'),
    path('register-participant/', views.register_participant, name='register_participant'),
]