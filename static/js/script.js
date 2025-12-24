// Nexus of Things front-end interactions - Dark Theme Enhanced
// Handles: loading overlays, event detail modal, registration form submission, dark theme effects

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const loadingOverlay = document.getElementById("loadingOverlay");
  const eventsContainer = document.getElementById("eventsContainer");
  const eventsSkeleton = document.getElementById("eventsSkeleton");
  const coordinatorsContainer = document.getElementById(
    "coordinatorsContainer"
  );
  const coordinatorsSkeleton = document.getElementById("coordinatorsSkeleton");
  const eventModal = document.getElementById("eventModal");
  const registrationModal = document.getElementById("registrationModal");
  const modalBody = document.getElementById("modal-body");
  const registrationTitle = document.getElementById("registration-title");
  const eventNameField = document.getElementById("event-name");
  const teammateFields = document.getElementById("teammate-fields");
  const registrationForm = document.getElementById("registration-form");
  const header = document.querySelector("header");
  const counters = document.querySelectorAll(".counter-number");
  const navLinks = document.querySelectorAll("nav a");
  const closeButtons = document.querySelectorAll(".close");
  const registerHeroBtn = document.getElementById("registerHeroBtn");
  const registerNavBtn = document.getElementById("registerNavBtn");

  // Utility Functions
  function getCsrfToken() {
    const name = "csrftoken";
    const cookies = document.cookie.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith(`${name}=`)) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return "";
  }

  function closeModal(modal) {
    if (modal) modal.style.display = "none";
  }

  // Enhanced Loading & Initialization
  function initLoading() {
    if (loadingOverlay) {
      loadingOverlay.classList.add("active");

      // Create particles during loading
      createParticles();

      setTimeout(() => {
        loadingOverlay.classList.remove("active");
        loadingOverlay.classList.add("hidden");

        // Show content and hide skeletons (if they exist)
        if (eventsSkeleton) {
          eventsSkeleton.style.display = "none";
        }
        if (eventsContainer) {
          eventsContainer.style.display = "grid";
        }
        if (coordinatorsSkeleton) {
          coordinatorsSkeleton.style.display = "none";
        }
        if (coordinatorsContainer) {
          coordinatorsContainer.style.display = "grid";
        }

        // Animate counters
        animateCounters();
      }, 1500);
    }
  }

  // Header Scroll Effect
  function initHeaderScroll() {
    if (header) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      });
    }
  }

  // Animate Counters
  function animateCounters() {
    const speed = 200;
    counters.forEach((counter) => {
      const updateCount = () => {
        const target = parseInt(
          counter.getAttribute("data-count") || counter.textContent
        );
        const count = parseInt(counter.innerText);
        const increment = Math.trunc(target / speed);

        if (count < target) {
          counter.innerText = count + increment;
          setTimeout(updateCount, 1);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  }

  // Navigation Active State
  function initNavigation() {
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        // Handle smooth scrolling for anchor links
        if (this.getAttribute("href").startsWith("#")) {
          const targetId = this.getAttribute("href");
          if (targetId !== "#") {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: "smooth",
              });
            }
          }
        }

        // Update active state
        navLinks.forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      });
    });
  }

  // Smooth Scrolling for all anchor links
  function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // Event Modal Handling
  function initEventModals() {
    const eventButtons = document.querySelectorAll(
      ".event-detail-btn, .btn-neon[data-event], .event-card-footer .btn"
    );

    eventButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const eventName =
          this.getAttribute("data-event") ||
          this.closest(".event-card")?.querySelector("h3")?.textContent;
        if (eventName) {
          loadEventDetails(eventName);
        }
      });
    });
  }

  // Build HTML for event detail modal (Enhanced for dark theme)
  function renderEventDetails(data) {
    const studentCards = (data.student_coordinators || [])
      .map(
        (c, idx) => `
        <div class="coordinator-card glass" style="margin-bottom: 15px;">
          <h4 style="color: var(--accent-color); font-family: 'Orbitron', sans-serif; margin-bottom: 10px;">Student Coordinator ${
            idx + 1
          }</h4>
          <p><strong style="color: var(--text-primary);">Name:</strong> <span style="color: var(--text-secondary);">${
            c.name || "TBD"
          }</span></p>
          <p><strong style="color: var(--text-primary);">Roll No:</strong> <span style="color: var(--text-secondary);">${
            c.roll_number || "N/A"
          }</span></p>
          <p><strong style="color: var(--text-primary);">Phone:</strong> <span style="color: var(--text-secondary);">${
            c.phone || "N/A"
          }</span></p>
        </div>
      `
      )
      .join("");

    const facultyCard = `
      <div class="coordinator-card glass" style="margin-bottom: 15px;">
        <h4 style="color: var(--accent-color); font-family: 'Orbitron', sans-serif; margin-bottom: 10px;">Faculty Coordinator</h4>
        <p><strong style="color: var(--text-primary);">Name:</strong> <span style="color: var(--text-secondary);">${
          data.faculty_coordinator_name || "Faculty Coordinator"
        }</span></p>
        <p><strong style="color: var(--text-primary);">Designation:</strong> <span style="color: var(--text-secondary);">${
          data.faculty_coordinator_designation || "TBD"
        }</span></p>
        <p><strong style="color: var(--text-primary);">Phone:</strong> <span style="color: var(--text-secondary);">${
          data.faculty_coordinator_phone || "N/A"
        }</span></p>
      </div>
    `;

    modalBody.innerHTML = `
      <div class="event-details">
        <h2 style="color: var(--accent-color); font-family: 'Orbitron', sans-serif; margin-bottom: 20px; text-align: center;">${
          data.title
        }</h2>
        
        <div class="event-info-section glass" style="padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-color); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Description</h3>
          <p style="color: var(--text-secondary); line-height: 1.8;">${
            data.description || "Details will be updated soon."
          }</p>
        </div>
        
        <div class="event-info-section glass" style="padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-color); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Event Structure</h3>
          <p style="color: var(--text-secondary); line-height: 1.8;">${
            data.rounds_info || "Structure will be shared soon."
          }</p>
        </div>
        
        <div class="event-info-section glass" style="padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-color); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Rules & Guidelines</h3>
          <p style="color: var(--text-secondary); line-height: 1.8;">${
            data.rules || "Rules will be announced shortly."
          }</p>
        </div>
        
        <div class="event-info-section glass" style="padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-color); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Team Requirements</h3>
          <p style="color: var(--text-secondary); line-height: 1.8;">${
            data.team_requirements || "Refer to rules for team size."
          }</p>
        </div>
        
        <div class="event-info-section glass" style="padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-color); margin-bottom: 15px; font-family: 'Orbitron', sans-serif;">Prizes</h3>
          <p style="color: var(--text-secondary); line-height: 1.8;">${
            data.prizes || "Prize details will be announced during the event."
          }</p>
        </div>
        
        <div class="event-info-section glass" style="padding: 20px; border-radius: 15px; margin-bottom: 20px;">
          <h3 style="color: var(--accent-color); margin-bottom: 15px; font-family: 'Orbitron', sans-serif; text-align: center;">Coordinators</h3>
          <div class="coordinator-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            ${facultyCard}
            ${
              studentCards ||
              '<div class="coordinator-card glass"><p style="color: var(--text-secondary); text-align: center;">Student coordinators will be updated shortly.</p></div>'
            }
          </div>
        </div>
        
        <div class="event-info-section" style="text-align: center; margin-top: 30px;">
          <button class="btn btn-primary" id="modal-register-btn" style="background: var(--tech-gradient); border: none; padding: 15px 40px; font-family: 'Orbitron', sans-serif; letter-spacing: 1px;">
            REGISTER NOW
          </button>
        </div>
      </div>
    `;

    // Wire the register button inside the modal
    const registerBtn = document.getElementById("modal-register-btn");
    if (registerBtn) {
      registerBtn.addEventListener("click", () => openRegistration(data.title));
    }
  }

  // Fetch event details from backend and show modal
  function loadEventDetails(eventName) {
    modalBody.innerHTML = `
      <div class="content-loading" style="text-align: center; padding: 40px;">
        <div class="small-spinner" style="width: 50px; height: 50px; border: 4px solid rgba(0, 212, 255, 0.1); border-top-color: var(--accent-color); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
        <p style="color: var(--text-secondary); font-family: 'Orbitron', sans-serif;">LOADING EVENT DETAILS...</p>
      </div>
    `;
    eventModal.style.display = "flex";

    // Fetch event details from Django backend
    fetch(`/get-event-details/${encodeURIComponent(eventName)}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch details (${res.status})`);
        return res.json();
      })
      .then((data) => {
        console.debug("Event details loaded from database", data);

        // Transform backend data to match frontend structure
        const eventData = {
          title: data.title || eventName,
          description: data.description || "Details will be updated soon.",
          rounds_info: data.rounds_info || "Structure will be shared soon.",
          rules: data.rules || "Rules will be announced shortly.",
          team_requirements:
            data.team_requirements || "Refer to rules for team size.",
          prizes:
            data.prizes || "Prize details will be announced during the event.",
          faculty_coordinator_name:
            data.faculty_coordinator_name || "Faculty Coordinator",
          faculty_coordinator_designation:
            data.faculty_coordinator_designation || "Professor",
          faculty_coordinator_phone: data.faculty_coordinator_phone || "N/A",
          student_coordinators: data.student_coordinators || [],
        };

        renderEventDetails(eventData);
      })
      .catch((err) => {
        console.error("Error fetching event details", err);
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger-color); margin-bottom: 20px;"></i>
            <p>Could not load details. Please try again later.</p>
          </div>
        `;
      });
  }

  // Configure registration form for a given event
  function openRegistration(eventName) {
    if (!registrationTitle || !eventNameField || !teammateFields) return;

    registrationTitle.textContent = `Register for ${eventName}`;
    eventNameField.value = eventName;
    teammateFields.innerHTML = "";

    // Fetch event requirements from backend or use defaults
    fetch(`/get-event-details/${encodeURIComponent(eventName)}/`)
      .then((res) => res.json())
      .then((data) => {
        // Extract team size from backend or use defaults
        const teamConfig = {
          InnovWEB: { min: 1, max: 2 },
          SensorShowDown: { min: 1, max: 2 },
          IdeaArena: { min: 1, max: 4, needsIdea: true },
          "Error Erase": { min: 1, max: 2 },
        };

        const config = teamConfig[eventName] || { min: 1, max: 4 };

        teammateFields.innerHTML = `
          <p style="margin-bottom: 20px; color: var(--text-secondary); padding: 10px; background: rgba(0, 212, 255, 0.1); border-radius: 8px;">
            <i class="fas fa-users" style="margin-right: 8px;"></i>
            Team size: ${config.min}-${config.max} members
          </p>
          <div class="form-group">
            <label class="form-label">Teammate 1(Lead) - Name</label>
            <input type="text" class="form-input" name="teammate1_name" id="teammate1_name" />
          </div>
          <div class="form-group">
            <label class="form-label">Teammate 1 - College Registration No</label>
            <input type="text" class="form-input" name="teammate1_reg_no" id="teammate1_reg_no" />
          </div>
          <div class="form-group">
            <label class="form-label">Teammate 2 - Name</label>
            <input type="text" class="form-input" name="teammate2_name" id="teammate2_name" />
          </div>
          <div class="form-group">
            <label class="form-label">Teammate 2 - College Registration No</label>
            <input type="text" class="form-input" name="teammate2_reg_no" id="teammate2_reg_no" />
          </div>
        `;

        if (config.max > 2) {
          teammateFields.insertAdjacentHTML(
            "beforeend",
            `
            <div class="form-group">
              <label class="form-label">Teammate 3 - Name</label>
              <input type="text" class="form-input" name="teammate3_name" id="teammate3_name" />
            </div>
            <div class="form-group">
              <label class="form-label">Teammate 3 - College Registration No</label>
              <input type="text" class="form-input" name="teammate3_reg_no" id="teammate3_reg_no" />
            </div>
            ${
              config.max > 3
                ? `
            <div class="form-group">
              <label class="form-label">Teammate 4 - Name</label>
              <input type="text" class="form-input" name="teammate4_name" id="teammate4_name" />
            </div>
            <div class="form-group">
              <label class="form-label">Teammate 4 - College Registration No</label>
              <input type="text" class="form-input" name="teammate4_reg_no" id="teammate4_reg_no" />
            </div>
            `
                : ""
            }
          `
          );
        }

        if (config.needsIdea) {
          teammateFields.insertAdjacentHTML(
            "beforeend",
            `
            <div class="form-group">
              <label class="form-label">Idea Description *</label>
              <textarea class="form-input" name="idea_description" id="idea_description" rows="5" required placeholder="Describe your idea clearly" style="background: rgba(255, 255, 255, 0.05); color: var(--text-primary);"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Upload PPT / PDF *</label>
              <input type="file" class="form-input" name="idea_file" id="idea_file" accept=".pdf,.ppt,.pptx" required style="padding: 10px; background: rgba(255, 255, 255, 0.05); color: var(--text-primary);" />
            </div>
          `
          );
        }

        registrationModal.style.display = "flex";
        closeModal(eventModal);
      })
      .catch((err) => {
        console.error("Error fetching event requirements:", err);
        // Fallback to basic form if fetch fails
        teammateFields.innerHTML = `
          <p style="margin-bottom: 20px; color: var(--text-secondary); padding: 10px; background: rgba(0, 212, 255, 0.1); border-radius: 8px;">
            <i class="fas fa-users" style="margin-right: 8px;"></i>
            Team size: 1-3 members
          </p>
          <div class="form-group">
            <label class="form-label">Teammate 1 - Name</label>
            <input type="text" class="form-input" name="teammate1_name" id="teammate1_name" />
          </div>
          <div class="form-group">
            <label class="form-label">Teammate 1 - College Registration No</label>
            <input type="text" class="form-input" name="teammate1_reg_no" id="teammate1_reg_no" />
          </div>
          <div class="form-group">
            <label class="form-label">Teammate 2 - Name</label>
            <input type="text" class="form-input" name="teammate2_name" id="teammate2_name" />
          </div>
          <div class="form-group">
            <label class="form-label">Teammate 2 - College Registration No</label>
            <input type="text" class="form-input" name="teammate2_reg_no" id="teammate2_reg_no" />
          </div>
        `;
        registrationModal.style.display = "flex";
        closeModal(eventModal);
      });
  }

  // Handle registration submission with fetch
  function initRegistrationForm() {
    if (!registrationForm) return;

    registrationForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const submitBtn = registrationForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> PROCESSING...';
      submitBtn.disabled = true;

      const formData = new FormData(registrationForm);

      fetch("/register-participant/", {
        method: "POST",
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.debug("Registration response", data);
          if (data.success) {
            // Optional: show a short success toast
            showNotification(
              "Registration successful! Redirecting...",
              "success"
            );
            // Small delay so user sees the message
            setTimeout(() => {
              if (data.redirect_url) {
                window.location.href = data.redirect_url;
              }
            }, 800);
          } else {
            showNotification(
              data.message || "Registration failed. Please try again.",
              "error"
            );
          }
        })
        .catch((err) => {
          console.error("Registration error", err);
          showNotification(
            "Something went wrong while submitting. Please try again.",
            "error"
          );
        })
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });
  }

  // Modal Close Handlers
  function initModalHandlers() {
    // Close buttons
    closeButtons.forEach((closeBtn) => {
      closeBtn.addEventListener("click", () =>
        closeModal(closeBtn.closest(".modal"))
      );
    });

    // Click outside to close
    window.addEventListener("click", (e) => {
      if (e.target === eventModal) closeModal(eventModal);
      if (e.target === registrationModal) closeModal(registrationModal);
    });
  }

  // Particle Background Effect
  function createParticles() {
    const particlesContainer =
      document.querySelector(".particles") || document.createElement("div");
    if (!document.querySelector(".particles")) {
      particlesContainer.className = "particles";
      document.body.appendChild(particlesContainer);
    }

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.width = `${Math.random() * 3 + 1}px`;
      particle.style.height = particle.style.width;
      particle.style.opacity = Math.random() * 0.5 + 0.2;
      particlesContainer.appendChild(particle);
    }
  }

  // Notification System
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content glass" style="
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 20px;
        border-radius: 10px;
        min-width: 300px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        border-left: 4px solid ${
          type === "success"
            ? "var(--success-color)"
            : type === "error"
            ? "var(--danger-color)"
            : "var(--accent-color)"
        };
      ">
        <div style="display: flex; align-items: center; gap: 15px;">
          <i class="fas ${
            type === "success"
              ? "fa-check-circle"
              : type === "error"
              ? "fa-exclamation-circle"
              : "fa-info-circle"
          }" 
             style="color: ${
               type === "success"
                 ? "var(--success-color)"
                 : type === "error"
                 ? "var(--danger-color)"
                 : "var(--accent-color)"
             }; font-size: 1.5rem;"></i>
          <span style="color: var(--text-primary);">${message}</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // Register Now button handlers
  function initRegisterButtons() {
    if (registerHeroBtn) {
      registerHeroBtn.addEventListener("click", () => {
        // Show registration modal with event selection
        registrationTitle.textContent = "Select Event to Register";
        eventNameField.value = "";
        teammateFields.innerHTML = `
          <div class="form-group">
            <label class="form-label">Select Event *</label>
            <select class="form-input" id="event-select" required>
              <option value="">Choose an event...</option>
              <option value="InnovWEB">InnovWEB</option>
              <option value="SensorShowDown">SensorShowDown</option>
              <option value="IdeaArena">IdeaArena</option>
              <option value="Error Erase">Error Erase</option>
            </select>
          </div>
        `;

        // Add event listener for event selection
        setTimeout(() => {
          const eventSelect = document.getElementById("event-select");
          if (eventSelect) {
            eventSelect.addEventListener("change", (e) => {
              if (e.target.value) {
                openRegistration(e.target.value);
              }
            });
          }
        }, 100);

        registrationModal.style.display = "flex";
      });
    }

    if (registerNavBtn) {
      registerNavBtn.addEventListener("click", (e) => {
        e.preventDefault();
        registerHeroBtn.click();
      });
    }
  }

  // Add CSS for animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .particle {
      position: fixed;
      width: 2px;
      height: 2px;
      background: var(--accent-color);
      border-radius: 50%;
      animation: float 20s infinite linear;
      z-index: -1;
      pointer-events: none;
    }
    @keyframes float {
      0% { transform: translateY(100vh) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100px) translateX(100px); opacity: 0; }
    }
    select.form-input {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 15px;
      width: 100%;
      font-family: 'Exo 2', sans-serif;
      transition: var(--transition);
    }
    select.form-input:focus {
      outline: none;
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
    }
  `;
  document.head.appendChild(style);

  // Initialize everything
  initLoading();
  initHeaderScroll();
  initNavigation();
  initSmoothScrolling();
  initEventModals();
  initRegistrationForm();
  initModalHandlers();
  initRegisterButtons();

  // Attach event buttons from original events
  document.querySelectorAll(".event-detail-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const eventName = btn.getAttribute("data-event");
      loadEventDetails(eventName);
    });
  });

  // Footer event links
  document.querySelectorAll(".event-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const eventName = link.getAttribute("data-event");
      if (eventName) {
        loadEventDetails(eventName);
      }
    });
  });

  // Make functions globally available
  window.openRegistration = openRegistration;
  window.createParticles = createParticles;
});

// Add this function to initialize hamburger menu
function initHamburgerMenu() {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const mobileMenu = document.querySelector(".mobile-menu");
  const menuOverlay = document.querySelector(".menu-overlay");
  const mobileNavItems = document.querySelectorAll(".mobile-nav-item");
  const mobileRegisterBtn = document.getElementById("mobile-register-btn");
  const desktopNav = document.querySelector("nav ul");

  if (!hamburgerBtn || !mobileMenu) return;

  // Toggle menu
  hamburgerBtn.addEventListener("click", () => {
    hamburgerBtn.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    menuOverlay.classList.toggle("active");
    document.body.style.overflow = mobileMenu.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu on overlay click
  menuOverlay.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    mobileMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  // Handle mobile navigation clicks
  mobileNavItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      if (
        this.getAttribute("href") &&
        this.getAttribute("href").startsWith("#")
      ) {
        const targetId = this.getAttribute("href");

        // Close menu
        hamburgerBtn.classList.remove("active");
        mobileMenu.classList.remove("active");
        menuOverlay.classList.remove("active");
        document.body.style.overflow = "";

        // Update active state
        mobileNavItems.forEach((navItem) => navItem.classList.remove("active"));
        this.classList.add("active");

        // If it's not the register button, scroll to section
        if (targetId !== "#" && this.id !== "mobile-register-btn") {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            setTimeout(() => {
              window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: "smooth",
              });
            }, 300);
          }
        }
      }
    });
  });

  // Handle mobile register button
  if (mobileRegisterBtn) {
    mobileRegisterBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Close menu
      hamburgerBtn.classList.remove("active");
      mobileMenu.classList.remove("active");
      menuOverlay.classList.remove("active");
      document.body.style.overflow = "";

      // Trigger registration modal
      if (registerHeroBtn) {
        setTimeout(() => {
          registerHeroBtn.click();
        }, 300);
      }
    });
  }

  // Update active nav item on scroll
  function updateActiveNavItem() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute("id");

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        // Update mobile nav
        mobileNavItems.forEach((item) => {
          item.classList.remove("active");
          if (item.getAttribute("href") === `#${sectionId}`) {
            item.classList.add("active");
          }
        });

        // Update desktop nav
        if (desktopNav) {
          const desktopLinks = desktopNav.querySelectorAll("a");
          desktopLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
            }
          });
        }
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavItem);
}

// Add this to your initialization section at the end of script.js:
// Inside your main initialization block, add:
initHamburgerMenu();

// Also add this to handle responsive behavior:
function handleResize() {
  const mobileMenu = document.querySelector(".mobile-menu");
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const menuOverlay = document.querySelector(".menu-overlay");

  // If window is resized to desktop size, close mobile menu
  if (window.innerWidth > 768) {
    if (mobileMenu && mobileMenu.classList.contains("active")) {
      mobileMenu.classList.remove("active");
      if (hamburgerBtn) hamburgerBtn.classList.remove("active");
      if (menuOverlay) menuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }
}

window.addEventListener("resize", handleResize);
