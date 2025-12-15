// Nexus of Things front-end interactions
// Handles: loading overlays, event detail modal, registration form submission.

document.addEventListener('DOMContentLoaded', () => {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const eventsContainer = document.getElementById('eventsContainer');
  const eventsSkeleton = document.getElementById('eventsSkeleton');
  const coordinatorsContainer = document.getElementById('coordinatorsContainer');
  const coordinatorsSkeleton = document.getElementById('coordinatorsSkeleton');
  const eventModal = document.getElementById('eventModal');
  const registrationModal = document.getElementById('registrationModal');
  const modalBody = document.getElementById('modal-body');
  const registrationTitle = document.getElementById('registration-title');
  const eventNameField = document.getElementById('event-name');
  const teammateFields = document.getElementById('teammate-fields');
  const registrationForm = document.getElementById('registration-form');

  // Utility: read CSRF token from cookie
  function getCsrfToken() {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${name}=`)) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return '';
  }

  function closeModal(modal) {
    if (modal) modal.style.display = 'none';
  }

  // Initial loading overlay + skeleton swap
  if (loadingOverlay) {
    loadingOverlay.classList.add('active');
    setTimeout(() => {
      loadingOverlay.classList.remove('active');
      if (eventsSkeleton && eventsContainer) {
        eventsSkeleton.style.display = 'none';
        eventsContainer.style.display = 'grid';
      }
      if (coordinatorsSkeleton && coordinatorsContainer) {
        coordinatorsSkeleton.style.display = 'none';
        coordinatorsContainer.style.display = 'block';
      }
    }, 1000);
  }

  // Attach close handlers for modals (X button and outside click)
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => closeModal(closeBtn.closest('.modal')));
  });

  window.addEventListener('click', e => {
    if (e.target === eventModal) closeModal(eventModal);
    if (e.target === registrationModal) closeModal(registrationModal);
  });

  // Build HTML for event detail modal
  function renderEventDetails(data) {
    const studentCards = (data.student_coordinators || [])
      .map(
        (c, idx) => `
        <div class="coordinator-card">
          <h4>Student Coordinator ${idx + 1}</h4>
          <p><strong>Name:</strong> ${c.name || 'TBD'}</p>
          <p><strong>Roll No:</strong> ${c.roll_number || 'N/A'}</p>
          <p><strong>Phone:</strong> ${c.phone || 'N/A'}</p>
        </div>
      `
      )
      .join('');

    const facultyCard = `
      <div class="coordinator-card">
        <h4>Faculty Coordinator</h4>
        <p><strong>Name:</strong> ${data.faculty_coordinator_name || 'Faculty Coordinator'}</p>
        <p><strong>Designation:</strong> ${data.faculty_coordinator_designation || 'TBD'}</p>
        <p><strong>Phone:</strong> ${data.faculty_coordinator_phone || 'N/A'}</p>
      </div>
    `;

    modalBody.innerHTML = `
      <div class="event-details">
        <h2>${data.title}</h2>
        <div class="event-info-section">
          <h3>Description</h3>
          <p>${data.description || 'Details will be updated soon.'}</p>
        </div>
        <div class="event-info-section">
          <h3>Event Structure</h3>
          <p>${data.rounds_info || 'Structure will be shared soon.'}</p>
        </div>
        <div class="event-info-section">
          <h3>Rules & Guidelines</h3>
          <p>${data.rules || 'Rules will be announced shortly.'}</p>
        </div>
        <div class="event-info-section">
          <h3>Team Requirements</h3>
          <p>${data.team_requirements || 'Refer to rules for team size.'}</p>
        </div>
        <div class="event-info-section">
          <h3>Prizes</h3>
          <p>${data.prizes || 'Prize details will be announced during the event.'}</p>
        </div>
        <div class="event-info-section">
          <h3>Coordinators</h3>
          <div class="coordinator-details">
            ${facultyCard}
            ${studentCards || '<div class="coordinator-card"><p>Student coordinators will be updated shortly.</p></div>'}
          </div>
        </div>
        <div class="event-info-section" style="text-align:right;">
          <button class="btn btn-primary" id="modal-register-btn">Register Now</button>
        </div>
      </div>
    `;

    // Wire the register button inside the modal
    const registerBtn = document.getElementById('modal-register-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', () => openRegistration(data.title));
    }
  }

  // Fetch event details from backend and show modal
  function loadEventDetails(eventName) {
    modalBody.innerHTML = `
      <div class="content-loading">
        <div class="small-spinner"></div>
        <p>Loading event details...</p>
      </div>
    `;
    eventModal.style.display = 'block';

    fetch(`/get-event-details/${encodeURIComponent(eventName)}/`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch details (${res.status})`);
        return res.json();
      })
      .then(data => {
        console.debug('Event details loaded', data);
        renderEventDetails(data);
      })
      .catch(err => {
        console.error('Error fetching event details', err);
        modalBody.innerHTML = `<p>Could not load details. Please try again later.</p>`;
      });
  }

  // Configure registration form for a given event
  function openRegistration(eventName) {
    registrationTitle.textContent = `Register for ${eventName}`;
    eventNameField.value = eventName;
    teammateFields.innerHTML = '';

    // Team-size hints and dynamic fields
    const teamConfig = {
      InnovWEB: { min: 2, max: 3 },
      SensorShowDown: { min: 2, max: 4 },
      IdeaArena: { min: 1, max: 3, needsIdea: true },
      "Error Erase": { min: 1, max: 2 },
    };

    const config = teamConfig[eventName] || { min: 1, max: 3 };
    teammateFields.innerHTML = `
      <p style="margin-bottom:8px;color:#555;">Team size: ${config.min}-${config.max} members.</p>
      <div class="form-group">
        <label for="teammate1_name">Teammate 1</label>
        <input type="text" name="teammate1_name" id="teammate1_name" />
      </div>
      <div class="form-group">
        <label for="teammate2_name">Teammate 2</label>
        <input type="text" name="teammate2_name" id="teammate2_name" />
      </div>
    `;

    if (config.needsIdea) {
      teammateFields.insertAdjacentHTML(
        'beforeend',
        `
        <div class="form-group">
          <label for="idea_description">Idea Description *</label>
          <textarea name="idea_description" id="idea_description" rows="5" required placeholder="Describe your idea clearly"></textarea>
        </div>
        <div class="form-group">
          <label for="idea_file">Upload PPT / PDF *</label>
          <input type="file" name="idea_file" id="idea_file" accept=".pdf,.ppt,.pptx" required />
        </div>
      `
      );
    }

    registrationModal.style.display = 'block';
    closeModal(eventModal);
  }

  // Attach handlers to event buttons
  document.querySelectorAll('.view-more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const eventName = btn.getAttribute('data-event');
      loadEventDetails(eventName);
    });
  });

  // Handle registration submission with fetch
  if (registrationForm) {
    registrationForm.addEventListener('submit', e => {
      e.preventDefault();

      const submitBtn = registrationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;

      const formData = new FormData(registrationForm);

      fetch('/register-participant/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          console.debug('Registration response', data);
          if (data.success) {
            alert(data.message || 'Registration successful!');
            registrationForm.reset();
            closeModal(registrationModal);
          } else {
            alert(data.message || 'Registration failed. Please try again.');
          }
        })
        .catch(err => {
          console.error('Registration error', err);
          alert('Something went wrong while submitting. Please try again.');
        })
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });
  }
});