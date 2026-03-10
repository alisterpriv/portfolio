/**
 * script.js — Alister Dsilva Portfolio
 * ======================================
 * SAFETY PRINCIPLE: No content is ever hidden by this script.
 * Animations are applied AFTER content is confirmed visible.
 *
 * TABLE OF CONTENTS
 * 1.  Entry point (DOMContentLoaded)
 * 2.  Navbar — scroll + mobile toggle
 * 3.  Scroll animations (safe IntersectionObserver)
 * 4.  Active nav-link highlighting
 * 5.  Contact form validation & submission
 * 6.  Smooth scroll for anchor links
 * 7.  init() — calls everything
 */

document.addEventListener('DOMContentLoaded', init);

/* ============================================================
   2. NAVBAR
   Adds .scrolled after 50px for blurred background.
   Hamburger toggles the mobile full-screen menu.
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  /* ---- Scroll: add .scrolled class for the blurred bg ---- */
  window.addEventListener(
    'scroll',
    () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    },
    { passive: true }
  );

  /* ---- Hamburger toggle ---- */
  navToggle.addEventListener('click', () => {
    const opening = navToggle.classList.toggle('open');
    navLinks.classList.toggle('open', opening);
    // Lock body scroll while overlay is open
    document.body.style.overflow = opening ? 'hidden' : '';
  });

  // Clicking any nav link closes the mobile menu
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ============================================================
   3. SCROLL ANIMATIONS (safe approach)
   
   The CSS keeps all .fade-in elements fully visible.
   This function OPTIONALLY enhances them with a slide-up
   entrance by:
     1. Adding .animate-hidden (hides via CSS)
     2. Using IntersectionObserver to add .animate-visible
        the moment the element enters the viewport
   
   If IntersectionObserver isn't supported, or if anything
   goes wrong, we skip the animation — content stays visible.
   ============================================================ */
function initScrollAnimations() {
  // Only run if IntersectionObserver is available
  if (!('IntersectionObserver' in window)) return;

  // Select all elements that should animate in
  const targets = document.querySelectorAll('.fade-in');

  // Safety: if there are none, do nothing
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Trigger animation by swapping classes
          el.classList.add('animate-visible');
          // Stop watching — animation only plays once
          observer.unobserve(el);
        }
      });
    },
    {
      // Fire as soon as even 1px of the element is in view
      threshold: 0,
      // Slight negative bottom margin so it fires just before fully in view
      rootMargin: '0px 0px -20px 0px',
    }
  );

  targets.forEach((el) => {
    // Step 1: hide element via CSS class
    el.classList.add('animate-hidden');
    // Step 2: start observing it
    observer.observe(el);
  });

  /* Hard fallback: after 1 second, reveal anything still hidden.
     This catches elements in the initial viewport that the observer
     fires for before the CSS transition is ready, or any edge case. */
  setTimeout(() => {
    document
      .querySelectorAll('.animate-hidden:not(.animate-visible)')
      .forEach((el) => el.classList.add('animate-visible'));
  }, 1000);
}

/* ============================================================
   4. ACTIVE NAV-LINK HIGHLIGHTING
   Watches scroll position and marks the matching nav link
   with .active as each section comes into view.
   ============================================================ */
function initActiveNavLinks() {
  const sections = [...document.querySelectorAll('section[id]')];
  const links = [...document.querySelectorAll('.nav-link')];

  function update() {
    // Add navbar height offset so we're measuring from below the nav
    const scrollY = window.scrollY + 100;

    let currentId = null;
    sections.forEach((section) => {
      if (section.offsetTop <= scrollY) {
        currentId = section.id;
      }
    });

    links.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // set correct state on initial load
}

/* ============================================================
   5. CONTACT FORM
   Front-end validation then simulated send.
   Replace the setTimeout with a real fetch() to your backend
   or a service like Formspree / EmailJS.
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop browser from reloading the page

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    // ---- Validate ----
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name) return setStatus('Please enter your name.', 'error');
    if (!emailOk) return setStatus('Please enter a valid email.', 'error');
    if (!message) return setStatus('Please write a message.', 'error');

    // ---- Loading state ----
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    /*
     * ---- Replace below with real API call, e.g. Formspree ----
     * fetch('https://formspree.io/f/YOUR_FORM_ID', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ name, email, message })
     * }).then(r => r.ok ? onSuccess() : onError())
     *   .catch(onError);
     */
    setTimeout(() => {
      setStatus("Message sent! I'll be in touch soon 🚀", 'success');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message →';
    }, 1500);
  });

  /* Helper: show status message, auto-clear after 6s */
  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `form-status ${type}`;
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => {
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }, 6000);
  }
}

/* ============================================================
   6. SMOOTH SCROLL
   Intercepts anchor clicks for a smooth scroll experience.
   CSS scroll-behavior:smooth handles the actual animation.
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ============================================================
   7. INIT — master function, called on DOMContentLoaded
   ============================================================ */
function init() {
  initNavbar(); // 2. Navbar scroll + hamburger
  initScrollAnimations(); // 3. Safe scroll animations
  initActiveNavLinks(); // 4. Active nav highlight
  initContactForm(); // 5. Form validation
  initSmoothScroll(); // 6. Smooth anchor scroll
}
