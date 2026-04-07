/* ============================================================
   CLÍNICA DENTAL CASTELLÓN — script.js v2 Premium
   Features:
   - Lucide icons init
   - Navbar scroll + mobile menu
   - Animated number counters
   - Testimonials slider (auto, touch, keyboard)
   - Scroll reveal animations
   - 3D card tilt on hover
   - Cursor glow (desktop)
   - Scroll to top button
   - Contact form with validation + WhatsApp CTA
   - Active nav link tracking
   ============================================================ */

'use strict';

/* ── LUCIDE ICONS ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  initAll();
});

function initAll() {
  initNavbar();
  initSmoothScroll();
  initScrollAnimations();
  initCounters();
  initSlider();
  initCardTilt();
  initCursorGlow();
  initScrollTop();
  initForm();
  initActiveNav();
}

/* ── NAVBAR ────────────────────────────────────────────────── */
function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const toggle     = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!navbar) return;

  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle?.addEventListener('click', () => {
    const isOpen = !mobileMenu.hidden;
    mobileMenu.hidden = isOpen;
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.querySelector('[data-lucide]')?.setAttribute('data-lucide', isOpen ? 'menu' : 'x');
    lucide.createIcons();
  });

  mobileMenu?.querySelectorAll('.mobile-nav-link, .btn').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('[data-lucide]')?.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    });
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !mobileMenu?.hidden) {
      mobileMenu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !mobileMenu?.hidden) {
      mobileMenu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/* ── SMOOTH SCROLL ─────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/* ── ACTIVE NAV LINK ───────────────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const style     = document.createElement('style');
  style.textContent = `.nav-link.active { color: var(--primary); }
    .nav-link.active::after { left: .85rem; right: .85rem; }`;
  document.head.appendChild(style);

  const activate = () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 130) current = s.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', activate, { passive: true });
  activate();
}

/* ── SCROLL ANIMATIONS ─────────────────────────────────────── */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-animate]').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseFloat(entry.target.style.getPropertyValue('--delay')) || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // Stagger service cards
  document.querySelectorAll('.service-card').forEach((card, i) => {
    card.setAttribute('data-animate', 'fade-up');
    card.style.transitionDelay = `${i * 70}ms`;
    observer.observe(card);
  });

  // Stagger testimonial cards
  document.querySelectorAll('.testimonial-card').forEach((card, i) => {
    card.setAttribute('data-animate', 'fade-up');
    card.style.transitionDelay = `${i * 80}ms`;
    observer.observe(card);
  });
}

/* ── ANIMATED COUNTERS ─────────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const animateCounter = el => {
    const target   = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0');
    const duration = 1600;
    const start    = performance.now();

    const update = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current  = easeOutCubic(progress) * target;
      el.textContent = decimals ? current.toFixed(decimals) : Math.floor(current);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = decimals ? target.toFixed(decimals) : target;
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ── TESTIMONIALS SLIDER ───────────────────────────────────── */
function initSlider() {
  const track   = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsEl  = document.getElementById('sliderDots');
  if (!track) return;

  const cards    = [...track.querySelectorAll('.testimonial-card')];
  const total    = cards.length;
  let   current  = 0;
  let   autoTimer;
  const INTERVAL = 5500;

  const getVisible = () => window.innerWidth <= 768 ? 1 : window.innerWidth <= 1100 ? 2 : 3;

  const buildDots = () => {
    dotsEl.innerHTML = '';
    const pages = Math.ceil(total / getVisible());
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      dot.addEventListener('click', () => { resetAuto(); goTo(i * getVisible()); });
      dotsEl.appendChild(dot);
    }
  };

  const updateDots = () => {
    const dots = dotsEl.querySelectorAll('.slider-dot');
    const page = Math.floor(current / getVisible());
    dots.forEach((d, i) => d.classList.toggle('active', i === page));
  };

  const getOffset = () => {
    const card = cards[0];
    const gap  = parseFloat(getComputedStyle(track).gap) || 20;
    return (card.offsetWidth + gap) * current;
  };

  const goTo = idx => {
    const max = total - getVisible();
    current = Math.max(0, Math.min(idx, max));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.style.transition = reduced ? 'none' : 'transform 420ms cubic-bezier(.4,0,.2,1)';
    track.style.transform = `translateX(-${getOffset()}px)`;
    updateDots();
    if (prevBtn) { prevBtn.disabled = current === 0; prevBtn.style.opacity = current === 0 ? '.4' : '1'; }
    if (nextBtn) { const atEnd = current >= total - getVisible(); nextBtn.disabled = atEnd; nextBtn.style.opacity = atEnd ? '.4' : '1'; }
  };

  const next = () => { const max = total - getVisible(); goTo(current >= max ? 0 : current + 1); };
  const prev = () => goTo(current - 1);

  prevBtn?.addEventListener('click', () => { resetAuto(); prev(); });
  nextBtn?.addEventListener('click', () => { resetAuto(); next(); });

  // Keyboard
  track.setAttribute('tabindex', '0');
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { resetAuto(); prev(); }
    if (e.key === 'ArrowRight') { resetAuto(); next(); }
  });

  // Auto-play
  const startAuto = () => { autoTimer = setInterval(next, INTERVAL); };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('focusin',    () => clearInterval(autoTimer));
  track.addEventListener('focusout',   startAuto);

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { resetAuto(); diff > 0 ? next() : prev(); }
  }, { passive: true });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { current = 0; buildDots(); goTo(0); }, 200);
  });

  buildDots();
  goTo(0);
  startAuto();
}

/* ── 3D CARD TILT ──────────────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 1024) return;

  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left - rect.width  / 2;
      const y      = e.clientY - rect.top  - rect.height / 2;
      const maxDeg = 6;
      const rotateX = -(y / (rect.height / 2)) * maxDeg;
      const rotateY =  (x / (rect.width  / 2)) * maxDeg;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 400ms ease, box-shadow 400ms ease, border-color 400ms ease';
      card.style.transform  = 'translateY(0) perspective(800px) rotateX(0) rotateY(0)';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 100ms ease, box-shadow 400ms ease, border-color 400ms ease';
    });
  });
}

/* ── CURSOR GLOW ───────────────────────────────────────────── */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.innerWidth < 1024) return;

  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  const animate = () => {
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(animate);
  };
  animate();

  // Hide when mouse leaves
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
}

/* ── SCROLL TO TOP ─────────────────────────────────────────── */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
}

/* ── CONTACT FORM ──────────────────────────────────────────── */
function initForm() {
  const form        = document.getElementById('contactForm');
  const submitBtn   = document.getElementById('submitBtn');
  const submitText  = document.getElementById('submitText');
  const formSuccess = document.getElementById('formSuccess');
  if (!form) return;

  const rules = {
    name:  { required: true, minLength: 2, message: 'Introduce tu nombre (mínimo 2 caracteres).' },
    phone: { required: true, pattern: /^[0-9\s\+\-\(\)]{7,15}$/, message: 'Introduce un teléfono válido.' },
  };

  const showError = (id, msg) => {
    const input = document.getElementById(id);
    const error = document.getElementById(id + 'Error');
    if (!input || !error) return;
    input.classList.toggle('error', !!msg);
    error.textContent = msg || '';
    msg ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid');
  };

  const validate = (id, value) => {
    const rule = rules[id];
    if (!rule) return true;
    if (rule.required && !value.trim())              { showError(id, rule.message); return false; }
    if (rule.minLength && value.trim().length < rule.minLength) { showError(id, rule.message); return false; }
    if (rule.pattern && !rule.pattern.test(value.trim()))       { showError(id, rule.message); return false; }
    showError(id, '');
    return true;
  };

  ['name', 'phone'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur',  () => validate(id, input.value));
    input.addEventListener('input', () => { if (input.classList.contains('error')) validate(id, input.value); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameVal  = document.getElementById('name')?.value  || '';
    const phoneVal = document.getElementById('phone')?.value || '';
    if (!validate('name', nameVal) | !validate('phone', phoneVal)) {
      form.querySelector('.form-input.error')?.focus();
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';
    const icon = submitBtn.querySelector('[data-lucide]');
    if (icon) { icon.setAttribute('data-lucide', 'loader-2'); lucide.createIcons(); }
    // Spin loader
    const loader = submitBtn.querySelector('[data-lucide]');
    if (loader) {
      loader.style.animation = 'spin 1s linear infinite';
      const style = document.createElement('style');
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);
    }

    await new Promise(r => setTimeout(r, 1500));

    // Success
    submitBtn.style.display = 'none';
    if (formSuccess) formSuccess.hidden = false;
    form.querySelectorAll('.form-input').forEach(el => el.disabled = true);

    // WhatsApp prefill
    const service  = document.getElementById('service')?.value || '';
    const message  = document.getElementById('message')?.value || '';
    const waText   = encodeURIComponent(
      `Hola, soy ${nameVal} y me gustaría pedir cita` +
      (service ? ` para ${service}` : '') +
      (message ? `. ${message}` : '') +
      `. Mi número: ${phoneVal}.`
    );
    const waLink = `https://wa.me/34661672491?text=${waText}`;

    const waBtn   = document.createElement('a');
    waBtn.href    = waLink;
    waBtn.target  = '_blank';
    waBtn.rel     = 'noopener noreferrer';
    waBtn.className = 'btn btn--whatsapp btn--full';
    waBtn.style.marginTop = '12px';
    waBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Continuar por WhatsApp`;
    formSuccess?.insertAdjacentElement('afterend', waBtn);
  });
}
