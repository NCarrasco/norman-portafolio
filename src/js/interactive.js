/**
 * interactive.js — Portfolio interactivity
 * Single file, no dependencies, operates directly on existing HTML.
 * Features: dark mode, scroll animations, project filters, search, form validation
 */

(function () {
  'use strict';

  // ─── DARK MODE ────────────────────────────────────────────────────────────

  const THEME_KEY = 'portfolio-theme';

  function initTheme() {
    // Use saved preference; fall back to light (never auto-apply dark from OS)
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved === 'dark' ? 'dark' : 'light');

    const btn = document.querySelector('[data-action="toggle-theme"]');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = document.documentElement.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
      });
    }
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.toggle('dark-theme', theme === 'dark');
    const sun  = document.querySelector('.theme-sun');
    const moon = document.querySelector('.theme-moon');
    if (sun)  sun.style.display  = theme === 'dark'  ? 'none'  : 'block';
    if (moon) moon.style.display = theme === 'dark'  ? 'block' : 'none';
  }

  // ─── SCROLL ANIMATIONS ────────────────────────────────────────────────────

  function initAnimations() {
    const targets = document.querySelectorAll(
      '.project-card, .testimonial-card, .cert-card, .section-title, .skill-bar, .stack-group, .exp-item, .edu-item'
    );

    targets.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.5s ease ${(i % 6) * 0.07}s, transform 0.5s ease ${(i % 6) * 0.07}s`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => observer.observe(el));

    // Animated counters in hero stats
    document.querySelectorAll('.stat-number').forEach(el => {
      const text  = el.textContent.trim();
      const match = text.match(/^(\d+)/);
      if (!match) return;
      const end    = parseInt(match[1]);
      const suffix = text.replace(match[1], '');
      let start    = 0;
      const step   = Math.ceil(end / 40);
      const timer  = setInterval(() => {
        start = Math.min(start + step, end);
        el.textContent = start + suffix;
        if (start >= end) clearInterval(timer);
      }, 35);
    });
  }

  // ─── PROJECT FILTERS ──────────────────────────────────────────────────────

  function initFilters() {
    const section = document.getElementById('proyectos');
    if (!section) return;

    const cards = section.querySelectorAll('.project-card');

    // Map of card → categories derived from .project-tag text
    const categoryMap = {
      'fraud-workflow': ['Todo', 'Fraude', '.NET'],
      'matricula':      ['Todo', 'ML', 'Clasificación'],
      'house-prices':   ['Todo', 'ML', 'Regresión'],
      'labor-attrition':['Todo', 'Análisis', 'RR.HH.'],
      'oulad':          ['Todo', 'ML', 'Análisis'],
      'stellapay':      ['Todo', 'Análisis']
    };

    const allCats = ['Todo', 'ML', 'Análisis', 'Fraude', '.NET'];
    let active = 'Todo';

    // Build filter bar
    const bar = document.createElement('div');
    bar.className = 'filter-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filtrar proyectos');

    allCats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat === 'Todo' ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        active = cat;
        bar.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.textContent === cat));
        applyFilter();
      });
      bar.appendChild(btn);
    });

    // Counter
    const counter = document.createElement('p');
    counter.className = 'filter-count';

    const grid = section.querySelector('.projects-grid');
    section.querySelector('.section-header').after(bar);
    bar.after(counter);

    function applyFilter() {
      let visible = 0;
      cards.forEach(card => {
        const id   = card.dataset.project || '';
        const cats = categoryMap[id] || ['Todo'];
        const show = active === 'Todo' || cats.includes(active);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      counter.textContent = active === 'Todo'
        ? `${visible} proyectos`
        : `${visible} de ${cards.length} proyectos`;
    }

    applyFilter();
  }

  // ─── SEARCH ───────────────────────────────────────────────────────────────

  function initSearch() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    // Replace search button with an inline input
    const oldBtn = navActions.querySelector('[data-action="open-search"]');
    if (oldBtn) oldBtn.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'search-wrapper';
    wrapper.innerHTML = `
      <span class="search-icon">🔍</span>
      <input class="search-input" type="search" placeholder="Buscar proyectos, skills…" aria-label="Buscar">
      <div class="search-results" role="listbox"></div>
    `;
    navActions.appendChild(wrapper);

    const input   = wrapper.querySelector('.search-input');
    const results = wrapper.querySelector('.search-results');

    // Build searchable index from DOM
    function buildIndex() {
      const items = [];
      document.querySelectorAll('.project-card').forEach(card => {
        const name = card.querySelector('.project-name')?.textContent || '';
        const desc = card.querySelector('.project-desc')?.textContent || '';
        items.push({ type: 'Proyecto', title: name, text: desc, el: card });
      });
      document.querySelectorAll('.stack-pill').forEach(pill => {
        items.push({ type: 'Stack', title: pill.textContent, text: '', el: pill });
      });
      document.querySelectorAll('.exp-role').forEach(role => {
        const company = role.closest('.exp-item')?.querySelector('.exp-company')?.textContent || '';
        items.push({ type: 'Experiencia', title: role.textContent, text: company, el: role });
      });
      document.querySelectorAll('.cert-name').forEach(cert => {
        items.push({ type: 'Certificación', title: cert.textContent, text: '', el: cert });
      });
      return items;
    }

    let index = null;
    let debounceTimer;

    input.addEventListener('focus', () => { if (!index) index = buildIndex(); });

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(input.value.trim()), 300);
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.value = ''; results.innerHTML = ''; results.classList.remove('visible'); }
    });

    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) results.classList.remove('visible');
    });

    function highlight(text, query) {
      if (!query) return text;
      const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(re, '<mark>$1</mark>');
    }

    function runSearch(query) {
      results.innerHTML = '';
      if (!query || query.length < 2) { results.classList.remove('visible'); return; }

      const q   = query.toLowerCase();
      const hits = index.filter(item =>
        item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q)
      ).slice(0, 7);

      if (hits.length === 0) {
        results.innerHTML = '<div class="search-no-results">Sin resultados para «' + query + '»</div>';
      } else {
        hits.forEach(item => {
          const div = document.createElement('div');
          div.className = 'search-result-item';
          div.setAttribute('role', 'option');
          div.innerHTML = `<div class="search-result-category">${item.type}</div>
            <div class="search-result-title">${highlight(item.title, query)}</div>`;
          div.addEventListener('click', () => {
            item.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            item.el.style.outline = '2px solid var(--accent-warm)';
            setTimeout(() => item.el.style.outline = '', 2000);
            results.classList.remove('visible');
            input.value = '';
          });
          results.appendChild(div);
        });
      }

      results.classList.add('visible');
    }
  }

  // ─── FORM VALIDATION ──────────────────────────────────────────────────────

  function initForm() {
    const form = document.querySelector('.contact-form, form[action*="formspree"]');
    if (!form) return;

    const rules = {
      name:    { min: 3,  max: 50,   msg: 'El nombre debe tener entre 3 y 50 caracteres.' },
      email:   { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Introduce un email válido.' },
      subject: { min: 5,  max: 100,  msg: 'El asunto debe tener entre 5 y 100 caracteres.' },
      message: { min: 10, max: 5000, msg: 'El mensaje debe tener entre 10 y 5000 caracteres.' }
    };

    // Wrap each input in a form-group if not already
    form.querySelectorAll('input, textarea').forEach(el => {
      const id = el.name || el.id;
      if (!rules[id]) return;

      let group = el.closest('.form-group');
      if (!group) {
        group = document.createElement('div');
        group.className = 'form-group';
        el.parentNode.insertBefore(group, el);
        group.appendChild(el);
      }

      // Error message element
      if (!group.querySelector('.form-error')) {
        const err = document.createElement('span');
        err.className = 'form-error';
        err.setAttribute('role', 'alert');
        group.appendChild(err);
      }

      el.addEventListener('blur',  () => validateField(el));
      el.addEventListener('input', () => { if (group.classList.contains('invalid')) validateField(el); });
    });

    function validateField(el) {
      const id    = el.name || el.id;
      const rule  = rules[id];
      const group = el.closest('.form-group');
      const err   = group?.querySelector('.form-error');
      if (!rule || !group) return true;

      let valid = true;
      const val = el.value.trim();

      if (rule.pattern && !rule.pattern.test(val))        { valid = false; }
      else if (rule.min && val.length < rule.min)          { valid = false; }
      else if (rule.max && val.length > rule.max)          { valid = false; }

      group.classList.toggle('valid',   valid && val.length > 0);
      group.classList.toggle('invalid', !valid && val.length > 0);
      if (err) err.textContent = valid ? '' : rule.msg;
      return valid;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    let successMsg  = form.querySelector('.form-success-msg');
    if (!successMsg) {
      successMsg = document.createElement('div');
      successMsg.className = 'form-success-msg';
      successMsg.textContent = '✅ ¡Mensaje enviado! Te responderé pronto.';
      form.appendChild(successMsg);
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      let allValid = true;
      form.querySelectorAll('input, textarea').forEach(el => {
        if (rules[el.name || el.id]) {
          if (!validateField(el)) allValid = false;
        }
      });
      if (!allValid) return;

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

      try {
        const data = new FormData(form);
        const res  = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (res.ok) {
          successMsg.classList.add('visible');
          form.reset();
          form.querySelectorAll('.form-group').forEach(g => g.classList.remove('valid', 'invalid'));
          setTimeout(() => successMsg.classList.remove('visible'), 5000);
        } else { throw new Error('Server error'); }
      } catch {
        alert('Hubo un error al enviar. Por favor intenta de nuevo.');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Enviar mensaje'; }
      }
    });
  }

  // ─── MOBILE MENU ──────────────────────────────────────────────────────────

  function initMobileMenu() {
    const hamburger = document.querySelector('.nav-hamburger, [data-toggle="mobile-menu"]');
    const navLinks  = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('mobile-open');
      hamburger.setAttribute('aria-expanded', open);
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
    });
  }

  // ─── ACTIVE NAV LINK ──────────────────────────────────────────────────────

  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ─── LIGHTBOX ─────────────────────────────────────────────────────────────

  function initLightbox() {
    const images = document.querySelectorAll('.award-img');
    if (!images.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<img class="lightbox-img" alt=""><button class="lightbox-close" aria-label="Cerrar">✕</button>';
    document.body.appendChild(overlay);

    const lightboxImg = overlay.querySelector('.lightbox-img');
    const closeBtn    = overlay.querySelector('.lightbox-close');

    images.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initAnimations();
    initFilters();
    initSearch();
    initForm();
    initMobileMenu();
    initActiveNav();
    initLightbox();
    console.info('[Portfolio] Interactive features loaded ✓');
  });

})();
