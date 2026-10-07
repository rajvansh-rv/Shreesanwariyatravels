/* ═══════════════════════════════════════════════════════
   SHREE SANWARIYA TRAVELS — script.js
   All interactive functionality & animations
═══════════════════════════════════════════════════════ */

'use strict';

/* ── 1. PAGE LOADER ──────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  // Keep loader visible for minimum 2s then fade out
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 2200);
});

// Prevent scroll during load
document.body.style.overflow = 'hidden';

/* ── 2. CUSTOM CURSOR ────────────────────────────────── */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

// Only enable on non-touch devices
if (window.matchMedia('(pointer: fine)').matches) {
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    dotX = e.clientX;
    dotY = e.clientY;
  });

  // Smooth ring follow
  function animateCursor() {
    ringX += (dotX - ringX) * 0.12;
    ringY += (dotY - ringY) * 0.12;

    cursorDot.style.left  = dotX + 'px';
    cursorDot.style.top   = dotY + 'px';
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  const hoverTargets = 'a, button, input, select, textarea, .dest-card, .car-card, .feature-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverTargets)) {
      document.body.classList.remove('cursor-hover');
    }
  });
}

/* ── 3. STICKY NAVBAR ────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── 4. HAMBURGER MENU ───────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close on nav link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Close on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ── 5. SCROLL REVEAL ANIMATIONS ────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal-up, .reveal-card').forEach(el => {
  revealObserver.observe(el);
});

/* ── 6. BACK TO TOP BUTTON ───────────────────────────── */
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 500) {
    backTop.classList.add('visible');
  } else {
    backTop.classList.remove('visible');
  }
}, { passive: true });

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 7. REVIEWS CAROUSEL ─────────────────────────────── */
const slider    = document.getElementById('reviewSlider');
const dotsWrap  = document.getElementById('sliderDots');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const cards     = slider ? slider.querySelectorAll('.review-card') : [];
let current     = 0;
let autoTimer;

// Build dots
cards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Review ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsWrap.appendChild(dot);
});

function goTo(index) {
  cards[current].classList.remove('active');
  cards[current].classList.add('exit');

  // Remove exit class after transition
  const exitCard = cards[current];
  setTimeout(() => exitCard.classList.remove('exit'), 500);

  // Update dots
  dotsWrap.querySelectorAll('.dot')[current].classList.remove('active');

  current = (index + cards.length) % cards.length;
  cards[current].classList.add('active');
  dotsWrap.querySelectorAll('.dot')[current].classList.add('active');
}

function nextSlide() { goTo(current + 1); }
function prevSlide() { goTo(current - 1); }

nextBtn.addEventListener('click', () => { nextSlide(); resetAuto(); });
prevBtn.addEventListener('click', () => { prevSlide(); resetAuto(); });

function startAuto() {
  autoTimer = setInterval(nextSlide, 5000);
}
function resetAuto() {
  clearInterval(autoTimer);
  startAuto();
}
startAuto();

// Touch/swipe support for slider
let touchStartX = 0;
slider.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
slider.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? nextSlide() : prevSlide();
    resetAuto();
  }
}, { passive: true });

/* ── 8. BOOKING FORM VALIDATION ─────────────────────── */
const bookingForm = document.getElementById('bookingForm');

const validators = {
  name: {
    field: 'name',
    err: 'nameErr',
    validate: v => v.trim().length >= 3,
    message: 'Please enter your full name (min 3 characters).'
  },
  phone: {
    field: 'phone',
    err: 'phoneErr',
    validate: v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '')),
    message: 'Enter a valid 10-digit Indian mobile number.'
  },
  pickup: {
    field: 'pickup',
    err: 'pickupErr',
    validate: v => v.trim().length >= 2,
    message: 'Please enter your pickup location.'
  },
  destination: {
    field: 'destination',
    err: 'destErr',
    validate: v => v.trim().length >= 2,
    message: 'Please enter your destination.'
  },
  tdate: {
    field: 'tdate',
    err: 'tdateErr',
    validate: v => {
      if (!v) return false;
      const selected = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    message: 'Please select a valid today or future date.'
  }
};

// Restrict past dates in the calendar dynamically
const tdateInput = document.getElementById('tdate');
if (tdateInput) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  tdateInput.min = `${yyyy}-${mm}-${dd}`;
}

function setFieldState(fieldId, errId, isValid, message) {
  const input  = document.getElementById(fieldId);
  const errEl  = document.getElementById(errId);
  const wrap   = input.closest('.input-wrap');

  if (!isValid) {
    wrap.classList.add('error');
    errEl.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  } else {
    wrap.classList.remove('error');
    errEl.textContent = '';
    input.removeAttribute('aria-invalid');
  }
  return isValid;
}

// Live validation on blur
Object.values(validators).forEach(({ field, err, validate, message }) => {
  const input = document.getElementById(field);
  input.addEventListener('blur', () => {
    setFieldState(field, err, validate(input.value), message);
  });
  input.addEventListener('input', () => {
    if (input.closest('.input-wrap').classList.contains('error')) {
      setFieldState(field, err, validate(input.value), message);
    }
  });
});

bookingForm.addEventListener('submit', async e => {
  e.preventDefault();

  // Run all validations
  let allValid = true;
  Object.values(validators).forEach(({ field, err, validate, message }) => {
    const input = document.getElementById(field);
    const valid = setFieldState(field, err, validate(input.value), message);
    if (!valid) allValid = false;
  });

  if (!allValid) {
    // Shake the form on error
    bookingForm.style.animation = 'none';
    void bookingForm.offsetHeight; // reflow
    bookingForm.style.animation = 'formShake 0.5s ease';
    return;
  }

  // Simulate API call — show loader on button
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');
  const btnIcon   = submitBtn.querySelector('.btn-icon');

  submitBtn.disabled  = true;
  btnText.textContent = 'Sending...';
  btnLoader.style.display = 'inline-block';
  btnIcon.style.display   = 'none';

const formData = {
  name: document.getElementById("name").value,
  phone: document.getElementById("phone").value,
  pickup: document.getElementById("pickup").value,
  destination: document.getElementById("destination").value,
  tdate: document.getElementById("tdate").value,
  cartype: document.getElementById("cartype").value,
  message: document.getElementById("message").value
};

  try {
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!result.success) {
      alert("❌ Failed to send booking");
    } else {
      const waRequest = formData.message.trim() ? formData.message : "None";
      const waMessage = `New Booking:\nName: ${formData.name}\nPhone: ${formData.phone}\nPickup: ${formData.pickup}\nDestination: ${formData.destination}\nDate: ${formData.tdate}\nCar: ${formData.cartype}\nRequest: ${waRequest}`;

      const waUrl = `https://wa.me/919893330713?text=${encodeURIComponent(waMessage)}`;
      const newWin = window.open(waUrl, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
        // If popup blocker blocked it, redirect in current tab
        window.location.href = waUrl;
      }
    }
  } catch (err) {
    console.error("Booking Error:", err);
    alert("❌ An error occurred while sending the booking.");
  } finally {
    // Reset button
    submitBtn.disabled  = false;
    btnText.textContent = 'Confirm My Booking';
    btnLoader.style.display = 'none';
    btnIcon.style.display   = 'inline-block';

    // Show success popup
    document.getElementById('popupOverlay').classList.add('show');

    // Reset form
    bookingForm.reset();
  }
});

// Popup close
document.getElementById('popupClose').addEventListener('click', () => {
  document.getElementById('popupOverlay').classList.remove('show');
});
document.getElementById('popupOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('show');
  }
});

// Escape key closes popup
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('popupOverlay').classList.remove('show');
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

/* ── 9. CARD TILT EFFECT ─────────────────────────────── */
function addTilt(selector, intensity = 8) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateY(${dx * intensity}deg) rotateX(${-dy * intensity}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
addTilt('.dest-card', 5);
addTilt('.car-card',  5);
addTilt('.feature-card', 4);

/* ── 10. RIPPLE EFFECT ON BUTTONS ────────────────────── */
document.querySelectorAll('.btn-primary, .btn-submit, .car-btn, .dest-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect   = this.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 1.5;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${e.clientX - rect.left - size/2}px;
      top:  ${e.clientY - rect.top  - size/2}px;
      background: rgba(255,255,255,0.25);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleAnim 0.6s linear;
      pointer-events: none;
    `;

    // Ensure button has position:relative
    const prev = this.style.position;
    if (!prev || prev === 'static') this.style.position = 'relative';
    this.style.overflow = 'hidden';

    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Inject ripple animation via style tag
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(1); opacity: 0; }
  }
  @keyframes formShake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-8px); }
    40%       { transform: translateX(8px); }
    60%       { transform: translateX(-6px); }
    80%       { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);

/* ── 11. PARALLAX HERO ORBS ──────────────────────────── */
window.addEventListener('mousemove', e => {
  const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
  const my = (e.clientY / window.innerHeight - 0.5) * 2;

  document.querySelectorAll('.orb').forEach((orb, i) => {
    const depth = (i + 1) * 12;
    orb.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
  });
}, { passive: true });

/* ── 12. SMOOTH ACTIVE NAV LINK HIGHLIGHTING ─────────── */
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${id}`) {
          link.style.color = 'var(--gold-light)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ── 13. NUMBER COUNTER ANIMATION FOR STATS ──────────── */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target >= 1000 ? (target / 1000).toFixed(0) + 'K+' : target + '+';
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + (target >= 1000 ? 'K+' : '+');
    }
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat strong').forEach(strong => {
        const raw = strong.textContent.trim();
        if (raw.includes('12K')) animateCounter(strong, 12000);
        else if (raw.includes('8'))  animateCounter(strong, 8, 1200);
        else if (raw.includes('50')) animateCounter(strong, 50, 1500);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

/* ── 14. IMAGE ERROR FALLBACK ─────────────────────────── */
// If car/destination images fail to load (due to third-party), add placeholder styling
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function() {
    this.style.objectFit = 'contain';
    this.style.padding   = '1rem';
    this.style.opacity   = '0.3';
    this.style.filter    = 'grayscale(1)';
    this.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' fill='%23555' font-family='sans-serif' font-size='18' text-anchor='middle' dy='.3em'%3EImage Unavailable%3C/text%3E%3C/svg%3E";
  });
});

/* ── 15. LAZY LOAD IMAGES with fade-in ───────────────── */
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.style.transition = 'opacity 0.5s ease';
      img.style.opacity    = '1';
      imageObserver.unobserve(img);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.style.opacity = '0';
  imageObserver.observe(img);
});

console.log('%c🕉 Shree Sanwariya Travels', 'color: #c9a84c; font-size: 18px; font-weight: bold; font-family: serif;');
console.log('%cWebsite loaded successfully. Jai Shri Shyam 🙏', 'color: #888; font-size: 12px;');
