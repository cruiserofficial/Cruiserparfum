/* ============================================================
   CRUISER — main.js
   Custom Cursor · Gold Particles · Scroll Reveal · Parallax
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     1. CUSTOM CURSOR
     ============================================================ */
  const cursor    = $('#cursor');
  const cursorDot = $('#cursorDot');

  if (cursor && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    let mx = -100, my = -100;
    let cx = -100, cy = -100;
    let raf;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    function animateCursor() {
      cx += (mx - cx) * 0.1;
      cy += (my - cy) * 0.1;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(animateCursor);
    }
    raf = requestAnimationFrame(animateCursor);

    /* Expand on interactive elements */
    $$('a, button, .product-card, .shop-card, .detail-img-wrap').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    /* Hide when leaving window */
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity    = '0';
      cursorDot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity    = '1';
      cursorDot.style.opacity = '1';
    });
  }

  /* ============================================================
     2. GOLD PARTICLES
     ============================================================ */
  const particlesContainer = $('#particles');

  if (particlesContainer) {
    const COUNT = window.innerWidth < 768 ? 28 : 55;

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const size    = 1.2 + Math.random() * 2.4;
      const x       = Math.random() * 100;
      const dur     = 9 + Math.random() * 14;
      const delay   = Math.random() * 10;
      const opacity = 0.15 + Math.random() * 0.55;
      const drift   = (Math.random() - 0.5) * 120;

      p.style.cssText = `
        left: ${x}%;
        width: ${size}px;
        height: ${size}px;
        --dur: ${dur}s;
        --delay: ${delay}s;
        --op: ${opacity};
        --drift: ${drift}px;
      `;
      particlesContainer.appendChild(p);
    }
  }

  /* ============================================================
     3. NAVBAR — scroll hide/show + scrolled style
     ============================================================ */
  const navbar = $('#navbar');

  if (navbar) {
    let lastY    = 0;
    let ticking  = false;

    function onScroll() {
      const y = window.pageYOffset;

      navbar.classList.toggle('scrolled', y > 60);

      if (y > lastY && y > 220) {
        navbar.classList.add('hidden');
      } else {
        navbar.classList.remove('hidden');
      }
      lastY   = y;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     4. HAMBURGER MENU (mobile)
     ============================================================ */
  const hamburger = $('#hamburger');
  const navMobile = $('#navMobile');

  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      const open = navMobile.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    /* Close on mobile link click */
    $$('.nav-mobile-link', navMobile).forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        hamburger.classList.remove('active');
      });
    });
  }

  /* ============================================================
     5. SCROLL REVEAL (Intersection Observer)
     ============================================================ */
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right, .reveal-fade');

  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -64px 0px',
    });

    revealEls.forEach(el => observer.observe(el));
  } else {
    /* Fallback for older browsers */
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ============================================================
     6. PARALLAX — hero image + product detail bg
     ============================================================ */
  const heroImg = $('.hero-img');

  function onScrollParallax() {
    const y = window.pageYOffset;

    /* Hero image subtle parallax */
    if (heroImg) {
      const speed = 0.25;
      heroImg.style.transform = `translateY(${y * speed}px) scale(1.08)`;
    }
  }

  if (heroImg) {
    window.addEventListener('scroll', onScrollParallax, { passive: true });
  }

  /* ============================================================
     7. SMOOTH ANCHOR SCROLL (offset for fixed navbar)
     ============================================================ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();

      const navH   = (navbar ? navbar.offsetHeight : 0) + 8;
      const top    = target.getBoundingClientRect().top + window.pageYOffset - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ============================================================
     8. IMAGE LAZY LOAD — fade-in when loaded
     ============================================================ */
  $$('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.7s ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });

  /* ============================================================
     9. SUBTLE TILT on product cards (desktop only)
     ============================================================ */
  if (window.matchMedia('(pointer: fine)').matches && window.innerWidth > 900) {
    $$('.product-card').forEach(card => {
      const wrap = card.querySelector('.card-img-wrap');
      if (!wrap) return;

      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const xRel   = (e.clientX - rect.left) / rect.width  - 0.5;
        const yRel   = (e.clientY - rect.top)  / rect.height - 0.5;
        const rotX   = -(yRel * 6).toFixed(2);
        const rotY   =  (xRel * 6).toFixed(2);
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.6s var(--ease-luxury)';
        setTimeout(() => card.style.transition = '', 600);
      });
    });
  }

  /* ============================================================
     10. GOLD LINE ACCENT — active nav highlight on scroll
     ============================================================ */
  const sections  = $$('section[id]');
  const navAnchors = $$('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.style.color = a.getAttribute('href') === `#${id}`
              ? 'var(--gold)'
              : '';
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ============================================================
     11. FLOATING SHOPEE BUTTON — show after scrolling past hero
     ============================================================ */
  const floatBtn = $('#floatBtn');

  if (floatBtn) {
    let floatTicking = false;

    window.addEventListener('scroll', () => {
      if (!floatTicking) {
        requestAnimationFrame(() => {
          const heroHeight = ($('.hero') || {}).offsetHeight || window.innerHeight;
          floatBtn.classList.toggle('visible', window.pageYOffset > heroHeight * 0.6);
          floatTicking = false;
        });
        floatTicking = true;
      }
    }, { passive: true });
  }

  /* ============================================================
     12. SCENT FINDER QUIZ
     ============================================================ */
  const SCENTS = {
    eternity: {
      name:   'ETERNITY',
      dna:    'Fresh · Sweet · Addictive',
      quote:  '"Freshness That Lingers."',
      img:    'img/eternity-splash.png',
      anchor: '#eternity',
    },
    noctis: {
      name:   'NOCTIS',
      dna:    'Warm · Sensual · Deep',
      quote:  '"Embrace the Night."',
      img:    'img/noctis-splash.png',
      anchor: '#noctis',
    },
    liberea: {
      name:   'LIBEREA',
      dna:    'Creamy · Fresh · Comforting',
      quote:  '"Softness in Every Note."',
      img:    'img/liberea-splash.png',
      anchor: '#liberea',
    },
  };

  /* Matrix: [q1_val][q2_val] → scent key */
  const QUIZ_MATRIX = {
    fresh: { day: 'eternity', night: 'noctis',  all: 'eternity' },
    warm:  { day: 'noctis',  night: 'noctis',  all: 'noctis'   },
    soft:  { day: 'liberea', night: 'liberea', all: 'liberea'  },
  };

  let q1Answer = null;
  let q2Answer = null;

  const step1   = $('#sf-step1');
  const step2   = $('#sf-step2');
  const result  = $('#sf-result');
  const progress = $('#sf-progress');
  const retryBtn = $('#sf-retry');

  function showStep(stepEl) {
    $$('.sf-step').forEach(s => s.classList.remove('active'));
    stepEl.classList.add('active');
  }

  function showResult(key) {
    const scent = SCENTS[key];
    if (!scent) return;

    $('#sf-result-img').src        = scent.img;
    $('#sf-result-img').alt        = scent.name + ' by CRUISER';
    $('#sf-result-name').textContent = scent.name;
    $('#sf-result-dna').textContent  = scent.dna;
    $('#sf-result-quote').textContent = scent.quote;
    $('#sf-result-detail').href      = scent.anchor;

    if (progress) progress.style.display = 'none';
    showStep(result);
  }

  /* Q1 clicks */
  $$('.sf-option[data-step="1"]').forEach(btn => {
    btn.addEventListener('click', () => {
      q1Answer = btn.dataset.val;
      $$('.sf-option[data-step="1"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      setTimeout(() => {
        /* Advance dot */
        const dots = $$('.sf-dot', progress);
        dots.forEach((d, i) => d.classList.toggle('active', i === 1));
        showStep(step2);
      }, 260);
    });
  });

  /* Q2 clicks → show result */
  $$('.sf-option[data-step="2"]').forEach(btn => {
    btn.addEventListener('click', () => {
      q2Answer = btn.dataset.val;
      $$('.sf-option[data-step="2"]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      setTimeout(() => {
        const key = (QUIZ_MATRIX[q1Answer] || {})[q2Answer] || 'eternity';
        showResult(key);
      }, 260);
    });
  });

  /* Retry */
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      q1Answer = null;
      q2Answer = null;
      $$('.sf-option').forEach(b => b.classList.remove('selected'));
      if (progress) {
        progress.style.display = '';
        $$('.sf-dot', progress).forEach((d, i) => d.classList.toggle('active', i === 0));
      }
      showStep(step1);
    });
  }

})();
