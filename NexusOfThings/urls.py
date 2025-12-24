# NexusOfThings/urls.py
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from events import views

urlpatterns = [
    path('admin-2310/', admin.site.urls),
    path('', views.home, name='home'),
    path('get-event-details/<str:event_name>/', views.get_event_details, name='get_event_details'),
    path('register-participant/', views.register_participant, name='register_participant'),
    path('api/participants/', views.get_participants, name='get_participants'),
    path('api/events/', views.get_events, name='get_events'),
    path('', include('events.urls')),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)