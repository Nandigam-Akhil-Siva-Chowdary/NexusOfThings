from django.contrib import admin
from .models import Event, StudentCoordinator, Participant
from django.utils.html import format_html

class StudentCoordinatorInline(admin.TabularInline):
    model = StudentCoordinator
    extra = 3  # Shows 3 empty forms by default
    max_num = 3  # Maximum 3 student coordinators per event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'faculty_coordinator_name']
    inlines = [StudentCoordinatorInline]

@admin.register(StudentCoordinator)
class StudentCoordinatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'roll_number', 'phone', 'event']
    list_filter = ['event']
    search_fields = ['name', 'roll_number']

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = (
        'team_code',
        'team_name',
        'event',
        'team_lead_name',
        'college_name',
        'idea_file_link',
    )

    list_filter = ('event',)
    search_fields = ('team_code', 'team_name', 'team_lead_name', 'email')

    readonly_fields = ('idea_file_link',)

    def idea_file_link(self, obj):
        if obj.idea_file_url:
            return format_html(
                '<a href="{}" target="_blank">View File</a>',
                obj.idea_file_url
            )
        return "—"

    idea_file_link.short_description = "Idea File"