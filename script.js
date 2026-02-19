/* ===========================
   SHIV KARIWALA — Site JS
   =========================== */

/* ---------- NAVBAR SCROLL ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ---------- CANVAS PARTICLE HERO ---------- */
(function initCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = 90;
  const ACCENT = [77, 166, 255];
  const PURPLE  = [124, 58, 237];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeParticle() {
    const col = Math.random() > 0.6 ? PURPLE : ACCENT;
    return {
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.3, 0.3),
      r: rand(1, 2.5),
      a: rand(0.05, 0.5),
      col,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.col[0]},${p.col[1]},${p.col[2]},${p.a})`;
    ctx.fill();
  }

  function connectParticles() {
    const MAX_DIST = 140;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const alpha = (1 - d / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(77,166,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // subtle vignette gradient
    const grad = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.9);
    grad.addColorStop(0, 'rgba(8,11,16,0)');
    grad.addColorStop(1, 'rgba(8,11,16,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      // drift
      p.x += p.vx;
      p.y += p.vy;

      // mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        p.x += (dx / d) * 1.5;
        p.y += (dy / d) * 1.5;
      }

      // wrap edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      drawParticle(p);
    });

    connectParticles();
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  resize();
  initParticles();
  tick();
})();


/* ---------- SCROLL ANIMATIONS ---------- */
(function initObserver() {
  const els = document.querySelectorAll('[data-animate], .timeline-item, .value-card, .edu-card');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger siblings
          const siblings = entry.target.parentElement.querySelectorAll('[data-animate], .timeline-item, .value-card, .edu-card');
          let delay = 0;
          siblings.forEach((s, idx) => {
            if (s === entry.target) delay = idx * 100;
          });
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach(el => observer.observe(el));
})();


/* ---------- SMOOTH ACTIVE NAV LINKS ---------- */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 160) {
        current = sec.getAttribute('id');
      }
    });
    links.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? '#4da6ff' : '';
    });
  }, { passive: true });
})();


/* ---------- TITLE TYPING EFFECT ---------- */
(function initTyping() {
  const tag = document.querySelector('.hero-tag');
  if (!tag) return;
  const fullText = tag.textContent.trim();
  tag.textContent = '';
  tag.style.opacity = '1';
  let i = 0;
  const speed = 38;
  const interval = setInterval(() => {
    tag.textContent += fullText[i];
    i++;
    if (i >= fullText.length) clearInterval(interval);
  }, speed);
})();
