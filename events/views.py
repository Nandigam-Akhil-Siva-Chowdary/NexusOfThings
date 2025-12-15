import datetime
import logging
from django.conf import settings
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.shortcuts import render
from .models import Event, Participant, StudentCoordinator

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Fallback event details so the page still works if the DB is empty
# ---------------------------------------------------------------------------
EVENT_FALLBACKS = {
    "InnovWEB": {
        "description": "Build a responsive single-page web app that solves a real-world student problem.",
        "rounds_info": "Round 1: UI/UX assessment (wireframes). Round 2: Functional prototype. Round 3: Final demo & Q/A.",
        "rules": "Original work only; bring your own laptops; internet allowed; frameworks permitted; judges evaluate UI/UX, accessibility, and performance.",
        "team_requirements": "Teams of 2-3 members.",
        "prizes": "1st: ₹8,000 | 2nd: ₹4,000 | 3rd: ₹2,000",
    },
    "SensorShowDown": {
        "description": "Rapid IoT prototyping with provided sensors and microcontrollers.",
        "rounds_info": "Round 1: Basic sensor wiring. Round 2: Data acquisition & visualization. Round 3: End-to-end prototype pitch.",
        "rules": "Hardware will be provided on-site; no pre-built code; originality required; safety first with hardware handling.",
        "team_requirements": "Teams of 2-4 members.",
        "prizes": "1st: ₹8,000 | 2nd: ₹4,000 | 3rd: ₹2,000",
    },
    "IdeaArena": {
        "description": "Pitch an innovative tech idea with a crisp deck.",
        "rounds_info": "Single round: 7-minute pitch + 3-minute Q/A with the jury.",
        "rules": "Slides are mandatory; focus on problem, solution, feasibility, and impact; plagiarism disqualifies.",
        "team_requirements": "Solo or teams up to 3 members.",
        "prizes": "1st: ₹5,000 | 2nd: ₹3,000 | 3rd: ₹2,000",
    },
    "Error Erase": {
        "description": "Time-bound debugging challenge across multiple languages.",
        "rounds_info": "Round 1: MCQ on debugging concepts. Round 2: Fix-the-code. Round 3: Speed debugging finals.",
        "rules": "No internet search; IDEs allowed; solutions must be your own; partial credits for test-cases passed.",
        "team_requirements": "Solo or teams of 2 members.",
        "prizes": "1st: ₹6,000 | 2nd: ₹3,000 | 3rd: ₹1,500",
    },
}

def home(request):
    events_qs = Event.objects.all()
    events = list(events_qs) if events_qs.exists() else []

    # If DB is empty, fall back to static seed data so the page is not blank
    if not events:
        events = [
            {
                "name": key,
                "description": details["description"],
            }
            for key, details in EVENT_FALLBACKS.items()
        ]

    # Sample data for coordinators
    faculty_coordinators = [
        {
            'name': 'Dr N Nagamalleswara Rao',
            'designation': 'Professor & HOD, CSE-IoT',
            'phone': '+91 9490114628',
        },
        {
            'name': 'Dr Nageswara Rao Eluri',
            'designation': 'Associate Professor, CSE-IoT',
            'phone': '+91 8977782094',
        }
    ]
    
    student_coordinators = [
        {
            'name': 'SK. Hussen',
            'roll': 'Y23CO057',
            'phone': '+91 9014962753',
        },
        {
            'name': 'K. sai vrk',
            'roll': 'Y23CO019',
            'phone': '+91 7075044638',
        },
        {
            'name': 'N. Akhil Siva Chowdary',
            'roll': 'Y24CO033',
            'phone': '+91 7670855283',
        }     
    ]
    
    context = {
        'events': events,
        'faculty_coordinators': faculty_coordinators,
        'student_coordinators': student_coordinators,
    }
    return render(request, 'home.html', context)

def get_event_details(request, event_name):
    # Prefer DB data, but gracefully fall back to static definitions
    try:
        event = Event.objects.get(name=event_name)
        student_coordinators = event.student_coordinators.all()

        student_coords_data = [
            {
                'name': coordinator.name,
                'roll_number': coordinator.roll_number,
                'phone': coordinator.phone,
            }
            for coordinator in student_coordinators
        ]

        data = {
            'title': event.name,
            'description': event.description,
            'rounds_info': event.rounds_info,
            'rules': event.rules,
            'team_requirements': EVENT_FALLBACKS.get(event_name, {}).get('team_requirements', 'See rules for team size.'),
            'prizes': EVENT_FALLBACKS.get(event_name, {}).get('prizes', 'Prizes will be announced during the event.'),
            'faculty_coordinator_name': event.faculty_coordinator_name,
            'faculty_coordinator_designation': event.faculty_coordinator_designation,
            'faculty_coordinator_phone': event.faculty_coordinator_phone,
            'student_coordinators': student_coords_data,
        }
        return JsonResponse(data)
    except Event.DoesNotExist:
        fallback = EVENT_FALLBACKS.get(event_name)
        if fallback:
            logger.info("Serving fallback details for event '%s'", event_name)
            data = {
                'title': event_name,
                'description': fallback.get('description', ''),
                'rounds_info': fallback.get('rounds_info', ''),
                'rules': fallback.get('rules', ''),
                'team_requirements': fallback.get('team_requirements', ''),
                'prizes': fallback.get('prizes', ''),
                'faculty_coordinator_name': "Faculty Coordinator",
                'faculty_coordinator_designation': "TBD",
                'faculty_coordinator_phone': "TBD",
                'student_coordinators': [],
            }
            return JsonResponse(data)

        return JsonResponse({'error': 'Event not found'}, status=404)

def generate_team_code():
    """Generate a unique team code using MongoDB-friendly approach"""
    # Get current date components
    now = datetime.datetime.now()
    year_short = str(now.year)[2:]  # Last 2 digits of year
    month = str(now.month).zfill(2)  # 2-digit month
    day = str(now.day).zfill(2)  # 2-digit day
    
    # Get count of participants registered today
    today_start = datetime.datetime.combine(now.date(), datetime.time.min)
    today_end = datetime.datetime.combine(now.date(), datetime.time.max)
    
    today_count = Participant.objects.filter(
        registration_date__gte=today_start,
        registration_date__lte=today_end
    ).count()
    
    sequence = today_count + 1
    sequence_str = str(sequence).zfill(3)  # 3-digit sequence
    
    return f"NoT{year_short}{month}{day}{sequence_str}"

def register_participant(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)

    event = request.POST.get('event')
    team_name = request.POST.get('team_name')
    team_lead_name = request.POST.get('team_lead_name')
    college_name = request.POST.get('college_name')
    phone_number = request.POST.get('phone_number')
    email = request.POST.get('email')
    teammate1_name = request.POST.get('teammate1_name', '')
    teammate2_name = request.POST.get('teammate2_name', '')
    idea_description = request.POST.get('idea_description', '')
    idea_file = request.FILES.get('idea_file')

    logger.info("Registration attempt | event=%s | team=%s | lead=%s | email=%s",
                event, team_name, team_lead_name, email)

    # Basic validation
    required_fields = [event, team_name, team_lead_name, college_name, phone_number, email]
    if not all(required_fields):
        return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

    # IdeaArena specific validation
    idea_file_url = None
    if event == 'IdeaArena':
        if not idea_description:
            return JsonResponse({'success': False, 'message': 'Idea description is required for IdeaArena'}, status=400)
        if not idea_file:
            return JsonResponse({'success': False, 'message': 'Pitch deck (PDF/PPT) is required for IdeaArena'}, status=400)

        # Require valid Cloudinary credentials and store the file there.
        missing_creds = any(
            str(value).startswith("your-development") or not value
            for value in [
                getattr(settings, "CLOUD_NAME", ""),
                getattr(settings, "API_KEY", ""),
                getattr(settings, "API_SECRET", ""),
            ]
        )
        if missing_creds:
            return JsonResponse({
                'success': False,
                'message': 'Cloudinary credentials are not configured. Set CLOUD_NAME, API_KEY, API_SECRET to upload.'
            }, status=500)

        try:
            saved_path = default_storage.save(f'ideaarena/{idea_file.name}', idea_file)
            idea_file_url = default_storage.url(saved_path)
            logger.info("IdeaArena file saved at %s", idea_file_url)
        except Exception as exc:
            logger.exception("IdeaArena file upload failed: %s", exc)
            return JsonResponse({'success': False, 'message': 'Cloud upload failed. Please try again.'}, status=500)

    # Generate a fresh team code (retry if collision occurs)
    team_code = generate_team_code()
    while Participant.objects.filter(team_code=team_code).exists():
        logger.warning("Team code collision detected for %s; regenerating", team_code)
        team_code = generate_team_code()

    participant = Participant(
        event=event,
        team_code=team_code,
        team_name=team_name,
        team_lead_name=team_lead_name,
        college_name=college_name,
        phone_number=phone_number,
        email=email,
        teammate1_name=teammate1_name or None,
        teammate2_name=teammate2_name or None,
        idea_description=idea_description or None,
        idea_file_url=idea_file_url,
    )
    participant.save()

    return JsonResponse({
        'success': True,
        'team_code': team_code,
        'message': f'Registration successful! Your team code is: {team_code}',
    })