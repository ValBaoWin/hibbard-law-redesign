/* ============================================================
   HIBBARD LAW GROUP — Main JS
   GSAP + ScrollTrigger, Lenis smooth scroll, all interactions
   ============================================================ */

(function () {
  'use strict';

  /* ── Reduced-motion check ── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Lenis smooth scroll ── */
  let lenis;
  if (!prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    /* Connect Lenis to GSAP ScrollTrigger */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  } else {
    /* Even with reduced motion, still register ScrollTrigger for non-animated functionality */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
  }

  /* ── Custom Cursor ── */
  function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    if (window.matchMedia('(hover: none)').matches) {
      cursor.style.display = 'none';
      return;
    }

    const dot = cursor.querySelector('.cursor__dot');
    if (!dot) return;

    document.addEventListener('mousemove', (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    const hoverEls = document.querySelectorAll(
      'a, button, .practice-card, .attorney-card, .blog-card, .accordion-trigger, [data-cursor-hover]'
    );
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
    });
  }

  /* ── Sticky Header ── */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const threshold = 60;

    function onScroll() {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > threshold);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile Nav ── */
  function initMobileNav() {
    const hamburger   = document.querySelector('.hamburger');
    const mobileNav   = document.querySelector('.mobile-nav');
    const backdrop    = document.querySelector('.mobile-nav__backdrop');
    if (!hamburger || !mobileNav) return;

    let isOpen = false;

    function openNav() {
      isOpen = true;
      hamburger.classList.add('open');
      mobileNav.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    }

    function closeNav() {
      isOpen = false;
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }

    hamburger.addEventListener('click', () => {
      isOpen ? closeNav() : openNav();
    });

    if (backdrop) backdrop.addEventListener('click', closeNav);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeNav();
    });

    /* Close on nav link click */
    const navLinks = mobileNav.querySelectorAll('a');
    navLinks.forEach((link) => link.addEventListener('click', closeNav));
  }

  /* ── Hero Animations ── */
  function initHeroAnimations() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined') return;

    const heroItems = gsap.utils.toArray('.hero-reveal');
    if (!heroItems.length) return;

    gsap.set(heroItems, { opacity: 0, y: 30 });

    gsap.to(heroItems, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.15,
      delay: 0.3,
    });
  }

  /* ── Scroll Reveal Animations ── */
  function initScrollAnimations() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* Generic fade-up reveals */
    const fadeUps = gsap.utils.toArray('.gsap-reveal');
    fadeUps.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* Stagger children within containers */
    const staggerContainers = gsap.utils.toArray('.gsap-stagger');
    staggerContainers.forEach((container) => {
      const children = container.querySelectorAll('.gsap-stagger-child');
      if (!children.length) return;

      gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* Headline mask/clip reveals */
    const maskHeads = gsap.utils.toArray('.gsap-mask-reveal');
    maskHeads.forEach((el) => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* Line-by-line text reveals on split text */
    const splitTexts = gsap.utils.toArray('.gsap-split');
    splitTexts.forEach((el) => {
      const lines = el.querySelectorAll('.split-line');
      if (!lines.length) return;

      gsap.fromTo(lines,
        { opacity: 0, y: '100%' },
        {
          opacity: 1,
          y: '0%',
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* Gold hairline width reveal */
    const hairlines = gsap.utils.toArray('.gsap-hairline');
    hairlines.forEach((el) => {
      gsap.fromTo(el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: 'power4.out',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* Parallax on hero background */
    const heroBg = document.querySelector('.hero__bg-img');
    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    /* Pinned section label */
    const pinnedLabel = document.querySelector('.pinned-section-label');
    if (pinnedLabel) {
      ScrollTrigger.create({
        trigger: pinnedLabel.closest('section') || pinnedLabel,
        start: 'top 80px',
        end: 'bottom bottom',
        pin: pinnedLabel,
        pinSpacing: false,
      });
    }

    /* Practice cards hover depth */
    const practiceCards = gsap.utils.toArray('.practice-card');
    practiceCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        if (prefersReducedMotion) return;
        gsap.to(card, { y: -4, duration: 0.3, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => {
        if (prefersReducedMotion) return;
        gsap.to(card, { y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  /* ── Stat Counters ── */
  function initStatCounters() {
    const statEls = document.querySelectorAll('[data-count]');
    if (!statEls.length) return;

    statEls.forEach((el) => {
      const target   = parseFloat(el.getAttribute('data-count'));
      const prefix   = el.getAttribute('data-prefix') || '';
      const suffix   = el.getAttribute('data-suffix') || '';
      const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals')) : 0;
      let started    = false;

      function runCount() {
        if (started) return;
        started = true;

        if (prefersReducedMotion) {
          el.textContent = prefix + target.toFixed(decimals) + suffix;
          return;
        }

        const duration = 2000;
        const start    = performance.now();

        function step(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease     = 1 - Math.pow(1 - progress, 3);
          const current  = target * ease;
          el.textContent = prefix + current.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCount();
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
    });
  }

  /* ── Accordions ── */
  function initAccordions() {
    const triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false');

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        const content = trigger.nextElementSibling;
        if (!content) return;

        /* Close all others in same group */
        const parent = trigger.closest('.accordion-group');
        if (parent) {
          parent.querySelectorAll('.accordion-trigger').forEach((t) => {
            if (t !== trigger) {
              t.setAttribute('aria-expanded', 'false');
              const c = t.nextElementSibling;
              if (c) c.classList.remove('open');
            }
          });
        }

        if (isOpen) {
          trigger.setAttribute('aria-expanded', 'false');
          content.classList.remove('open');
        } else {
          trigger.setAttribute('aria-expanded', 'true');
          content.classList.add('open');
        }
      });
    });
  }

  /* ── Floating CTA (mobile) ── */
  function initFloatingCTA() {
    const cta = document.querySelector('.floating-cta');
    if (!cta) return;

    let ticking = false;
    const heroHeight = document.querySelector('.hero')
      ? document.querySelector('.hero').offsetHeight
      : 400;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          cta.classList.toggle('visible', y > heroHeight * 0.5);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Active nav link ── */
  function initActiveNav() {
    const path = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav__link');

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      if (href === '/' || href === '/index.html') {
        if (path === '/' || path === '/index.html') {
          link.classList.add('active');
        }
      } else if (path.startsWith(href.replace('index.html', ''))) {
        link.classList.add('active');
      }
    });
  }

  /* ── Smooth scroll for anchor links ── */
  function initAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        e.preventDefault();

        if (lenis) {
          lenis.scrollTo(target, { offset: -80 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Contact Form ── */
  function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      /* Netlify handles the actual submission; this handles success display */
      const successMsg = document.querySelector('.form-success');
      if (!successMsg) return;

      /* Let Netlify process — show success after short delay for non-JS fallback */
      if (form.getAttribute('data-netlify') === 'true') {
        /* Netlify redirect will handle it — this is the JS-enhanced path */
        setTimeout(() => {
          successMsg.classList.add('visible');
          form.style.display = 'none';
        }, 100);
      }
    });

    /* File input label */
    const fileInput = form.querySelector('input[type="file"]');
    const fileLabel = form.querySelector('.form-file-text');
    if (fileInput && fileLabel) {
      fileInput.addEventListener('change', () => {
        const name = fileInput.files[0]?.name || 'No file chosen';
        fileLabel.textContent = name;
      });
    }
  }

  /* ── Obfuscated email ── */
  function initEmail() {
    const emailLinks = document.querySelectorAll('[data-email]');
    emailLinks.forEach((link) => {
      const user   = link.getAttribute('data-user');
      const domain = link.getAttribute('data-domain');
      if (!user || !domain) return;
      const email = user + '@' + domain;
      link.setAttribute('href', 'mailto:' + email);
      if (!link.textContent.trim() || link.textContent === '…') {
        link.textContent = email;
      }
    });
  }

  /* ── Blog post count-up decoration on stats in articles ── */
  function initPageSpecific() {
    /* Nothing page-specific needed beyond what's above; extend here */
  }

  /* ── GSAP Section transitions (about page dividers) ── */
  function initSectionTransitions() {
    if (prefersReducedMotion) return;
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    /* About section image parallax */
    const aboutImg = document.querySelector('.about__img-frame img');
    if (aboutImg) {
      gsap.to(aboutImg, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    /* Stats number entrance */
    const statsSection = document.querySelector('.stats-band');
    if (statsSection) {
      gsap.fromTo(statsSection,
        { backgroundPositionX: '0%' },
        {
          backgroundPositionX: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: statsSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
        }
      );
    }
  }

  /* ── Init all ── */
  function init() {
    initCursor();
    initHeader();
    initMobileNav();
    initHeroAnimations();
    initScrollAnimations();
    initStatCounters();
    initAccordions();
    initFloatingCTA();
    initActiveNav();
    initAnchorLinks();
    initContactForm();
    initEmail();
    initPageSpecific();
    initSectionTransitions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
