import datetime
import logging

import cloudinary.uploader
from django.conf import settings
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
        "team_requirements": "Solo or teams up to 2 members.",
        "prizes": "1st: ₹3,000 | 2nd: ₹2,000 | 3rd: ₹1,000",
    },
    "SensorShowDown": {
        "description": "Rapid IoT prototyping with provided sensors and microcontrollers.",
        "rounds_info": "Round 1: Basic sensor wiring. Round 2: Data acquisition & visualization. Round 3: End-to-end prototype pitch.",
        "rules": "Hardware will be provided on-site; no pre-built code; originality required; safety first with hardware handling.",
        "team_requirements": "Solo or teams up to 2 members.",
        "prizes": "1st: ₹3,000 | 2nd: ₹2,000 | 3rd: ₹1,000",
    },
    "IdeaArena": {
        "description": "Pitch an innovative tech idea with a crisp deck.",
        "rounds_info": "Single round: 7-minute pitch + 3-minute Q/A with the jury.",
        "rules": "Slides are mandatory; focus on problem, solution, feasibility, and impact; plagiarism disqualifies.",
        "team_requirements": "Solo or teams up to 4 members.",
        "prizes": "1st: ₹3,000 | 2nd: ₹2,000 | 3rd: ₹1,000",
    },
    "Error Erase": {
        "description": "Time-bound debugging challenge across multiple languages.",
        "rounds_info": "Round 1: MCQ on debugging concepts. Round 2: Fix-the-code. Round 3: Speed debugging finals.",
        "rules": "No internet search; IDEs allowed; solutions must be your own; partial credits for test-cases passed.",
        "team_requirements": "Solo or teams of 2 members.",
        "prizes": "1st: ₹3,000 | 2nd: ₹2,000 | 3rd: ₹1,000",
    },
}

# Helper function to get event icons
def get_event_icon(event_name):
    icon_map = {
        'InnovWEB': 'fas fa-laptop-code',
        'SensorShowDown': 'fas fa-microchip',
        'IdeaArena': 'fas fa-lightbulb',
        'Error Erase': 'fas fa-bug'
    }
    return icon_map.get(event_name, 'fas fa-code')

def home(request):
    events_qs = Event.objects.all()
    events = []
    
    # If DB has events, add registration count
    if events_qs.exists():
        for event in events_qs:
            # Count participants for this event
            registered_count = Participant.objects.filter(event=event.name).count()
            
            events.append({
                "name": event.name,
                "description": event.description,
                "prize": EVENT_FALLBACKS.get(event.name, {}).get('prizes', '1st: ₹3,000 | 2nd: ₹2,000 | 3rd: ₹1,000'),
                "registered": registered_count,
                "icon": get_event_icon(event.name)
            })
    else:
        # Fallback with zero registrations
        events = [
            {
                "name": key,
                "description": details["description"],
                "prize": details.get("prizes", "1st: ₹3,000 | 2nd: ₹2,000 | 3rd: ₹1,000"),
                "registered": 0,
                "icon": get_event_icon(key)
            }
            for key, details in EVENT_FALLBACKS.items()
        ]
    
    # Sample data for coordinators
    faculty_coordinators = [
        {
            'name': 'Dr N Nagamalleswara Rao',
            'designation': 'Professor & HOD, CSE-IoT',
            'phone': '+91 9490114628',
            'email': 'rvr.cseiot2024@gmail.com'
        },
        {
            'name': 'Dr Nageswara Rao Eluri',
            'designation': 'Associate Professor, CSE-IoT',
            'phone': '+91 8977782094',
            'email': 'rvr.cseiot2024@gmail.com'
        }
    ]
    
    student_coordinators = [
        {
            'name': 'P. Nahin Khan',
            'roll': 'L24CO069',
            'phone': '+91 6305260604',
        },
        {
            'name': 'K. Sai Venkata Radha Krishna',
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
    teammate3_name = request.POST.get('teammate3_name', '')
    teammate4_name = request.POST.get('teammate4_name', '')
    idea_description = request.POST.get('idea_description', '')
    idea_file = request.FILES.get('idea_file')

    logger.info("Registration attempt | event=%s | team=%s | lead=%s | email=%s",
                event, team_name, team_lead_name, email)

    # Basic validation
    required_fields = [event, team_name, team_lead_name, college_name, phone_number, email]
    if not all(required_fields):
        return JsonResponse({'success': False, 'message': 'Missing required fields'}, status=400)

    # Check if team name already exists for this event
    if Participant.objects.filter(event=event, team_name__iexact=team_name).exists():
        return JsonResponse({'success': False, 'message': 'Team name already exists for this event. Please choose a different name.'}, status=400)

    # Check if email already registered for this event
    if Participant.objects.filter(event=event, email__iexact=email).exists():
        return JsonResponse({'success': False, 'message': 'This email is already registered for this event.'}, status=400)

    # IdeaArena specific validation
    idea_file_url = None
    if event == 'IdeaArena':
        if not idea_description:
            return JsonResponse({'success': False, 'message': 'Idea description is required for IdeaArena'}, status=400)
        if not idea_file:
            return JsonResponse({'success': False, 'message': 'Pitch deck (PDF/PPT) is required for IdeaArena'}, status=400)

        # Validate file type and size (<=50 MB)
        allowed_extensions = {"pdf", "ppt", "pptx"}
        extension = idea_file.name.rsplit('.', 1)[-1].lower() if '.' in idea_file.name else ''
        if extension not in allowed_extensions:
            return JsonResponse({'success': False, 'message': 'Only PDF, PPT, or PPTX files are allowed.'}, status=400)

        max_size_bytes = 50 * 1024 * 1024
        if idea_file.size > max_size_bytes:
            return JsonResponse({'success': False, 'message': 'File too large. Please upload a file under 50 MB.'}, status=400)

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
            upload_result = cloudinary.uploader.upload(
                idea_file,
                folder="ideaarena",
                resource_type="auto",  # allow raw docs (pdf/ppt/pptx)
                use_filename=True,
                unique_filename=False,
                overwrite=False,
                allowed_formats=list(allowed_extensions),
            )
            idea_file_url = upload_result.get("secure_url")
            logger.info("IdeaArena file saved at %s", idea_file_url)
        except Exception as exc:
            logger.exception("IdeaArena file upload failed: %s", exc)
            return JsonResponse({'success': False, 'message': 'Cloud upload failed. Please try again.'}, status=500)

    # Generate a fresh team code (retry if collision occurs)
    team_code = generate_team_code()
    while Participant.objects.filter(team_code=team_code).exists():
        logger.warning("Team code collision detected for %s; regenerating", team_code)
        team_code = generate_team_code()

    # Get ALL teammate fields from form
    teammate1_name = request.POST.get('teammate1_name', '')
    teammate2_name = request.POST.get('teammate2_name', '')
    teammate3_name = request.POST.get('teammate3_name', '')
    teammate4_name = request.POST.get('teammate4_name', '')

    # Create participant record with ALL teammate fields
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
        teammate3_name=teammate3_name or None,
        teammate4_name=teammate4_name or None,
        idea_description=idea_description or None,
        idea_file_url=idea_file_url,
    )
    participant.save()

    # Log successful registration
    logger.info("Registration successful | event=%s | team=%s | code=%s | lead=%s | teammates=%s", 
                event, team_name, team_code, team_lead_name, 
                f"{teammate1_name or ''},{teammate2_name or ''},{teammate3_name or ''},{teammate4_name or ''}")

    return JsonResponse({
        'success': True,
        'team_code': team_code,
        'message': f'Registration successful! Your team code is: {team_code}. Please save this code for future reference.',
    })

def get_participants(request):
    """
    API endpoint to get all registered participants.
    Optional query parameter: ?event=<event_name> to filter by event.
    Returns JSON response with participant data.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Get optional event filter from query parameters
    event_filter = request.GET.get('event', None)
    
    # Query participants
    if event_filter:
        participants = Participant.objects.filter(event=event_filter).order_by('-registration_date')
    else:
        participants = Participant.objects.all().order_by('-registration_date')
    
    # Serialize participants to JSON
    participants_data = []
    for participant in participants:
        participant_dict = {
            'id': participant.id,
            'event': participant.event,
            'team_code': participant.team_code,
            'team_name': participant.team_name,
            'team_lead_name': participant.team_lead_name,
            'college_name': participant.college_name,
            'phone_number': participant.phone_number,
            'email': participant.email,
            'teammate1_name': participant.teammate1_name,
            'teammate2_name': participant.teammate2_name,
            'teammate3_name': participant.teammate3_name,
            'teammate4_name': participant.teammate4_name,
            'registration_date': participant.registration_date.isoformat() if participant.registration_date else None,
            'idea_description': participant.idea_description,
            'idea_file_url': participant.idea_file_url,
        }
        participants_data.append(participant_dict)
    
    return JsonResponse({
        'success': True,
        'count': len(participants_data),
        'participants': participants_data
    }, json_dumps_params={'ensure_ascii': False})