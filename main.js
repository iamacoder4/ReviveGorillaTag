'use strict';

/* PARTICLE CANVAS — only runs on pages that have the canvas element */
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      size:    Math.random() * 2 + 0.5,
      speedX:  (Math.random() - 0.5) * 0.4,
      speedY:  (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      color:   Math.random() > 0.6 ? '#00ff88' : '#00bfff',
    };
  }

  function initParticles() {
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    particles = Array.from({ length: count }, createParticle);
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawConnections();
    particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x < 0)             p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0)             p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
  resizeCanvas();
  initParticles();
  animateParticles();

  /* Gorilla parallax — only on home page */
  const gorillaEl = document.querySelector('.hero-gorilla');
  if (gorillaEl) {
    window.addEventListener('scroll', () => {
      gorillaEl.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    }, { passive: true });
  }
}

/* NAVBAR SCROLL */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* MOBILE NAV TOGGLE */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ACTIVE NAV LINK — based on current page URL */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a[href]').forEach((link) => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* SCROLL REVEAL */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay, 10) : 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* STAT COUNTERS */
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el  = entry.target.querySelector('.stat-number');
      const end = parseInt(el.dataset.target, 10);
      const dur = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / dur, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * end).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = end >= 1000 ? end.toLocaleString() + '+' : end.toString();
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-item').forEach((item) => statObserver.observe(item));

/* JOIN FORM */
const joinForm = document.getElementById('joinForm');
if (joinForm) {
  const joinSuccess = document.getElementById('joinSuccess');
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name     = document.getElementById('joinName').value.trim();
    const email    = document.getElementById('joinEmail').value.trim();
    const platform = document.getElementById('joinPlatform').value;
    if (!name || !email || !platform) {
      joinForm.style.animation = 'none';
      joinForm.offsetHeight;
      joinForm.style.animation = 'shake 0.4s ease';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const emailInput = document.getElementById('joinEmail');
      emailInput.style.borderColor = '#ff6b35';
      setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
      return;
    }
    const btn = joinForm.querySelector('button[type="submit"]');
    btn.disabled  = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Joining…';
    setTimeout(() => {
      joinForm.style.display    = 'none';
      joinSuccess.style.display = 'block';
    }, 1200);
  });
}

console.log('%c🦍 RGT — REVIVE GORILLA TAG 🦍', 'font-size:18px;font-weight:bold;color:#00ff88;background:#050b0e;padding:8px 16px;border-radius:6px;');
