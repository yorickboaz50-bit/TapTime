const header = document.querySelector('[data-header]');
const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('#primary-navigation');
const demoButton = document.querySelector('[data-demo-button]');
const accordion = document.querySelector('[data-accordion]');
const yearEl = document.querySelector('[data-year]');

const closeNavigation = () => {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
};

const openNavigation = () => {
  nav.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
};

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (header) {
  const updateHeaderState = () => {
    const scrolled = window.scrollY > 10;
    header.dataset.scrolled = scrolled ? 'true' : 'false';
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeNavigation();
    } else {
      openNavigation();
    }
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNavigation();
    }
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initializeIcons = () => {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
};

const setupMotionAnimations = () => {
  if (prefersReducedMotion || !window.motion?.animate) {
    return;
  }

  const { animate } = window.motion;
  const animationPresets = {
    'fade-up': {
      initial: { opacity: '0', transform: 'translateY(32px)' },
      keyframes: { opacity: [0, 1], transform: ['translateY(32px)', 'translateY(0)'] }
    },
    'fade-left': {
      initial: { opacity: '0', transform: 'translateX(32px)' },
      keyframes: { opacity: [0, 1], transform: ['translateX(32px)', 'translateX(0)'] }
    },
    'fade-in': {
      initial: { opacity: '0', transform: 'scale(0.96)' },
      keyframes: { opacity: [0, 1], transform: ['scale(0.96)', 'scale(1)'] }
    }
  };

  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) {
    return;
  }

  const getPreset = (element) => animationPresets[element.dataset.animate ?? 'fade-up'] ?? animationPresets['fade-up'];

  const calculateDelay = (element) => {
    const baseDelay = Number.parseFloat(element.dataset.animateDelay ?? '0') || 0;
    const order = Number.parseInt(element.dataset.animateOrder ?? '0', 10);
    const orderDelay = Number.isNaN(order) ? 0 : Math.max(0, order) * 0.08;
    return baseDelay + orderDelay;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = entry.target;
        const preset = getPreset(target);
        observer.unobserve(target);

        animate(target, preset.keyframes, {
          duration: 0.8,
          easing: 'ease-out',
          delay: calculateDelay(target)
        })
          .finished.then(() => {
            target.style.opacity = '';
            target.style.transform = '';
            target.style.willChange = '';
          })
          .catch(() => {
            target.style.opacity = '';
            target.style.transform = '';
            target.style.willChange = '';
          });
      });
    },
    { threshold: 0.2 }
  );

  elements.forEach((element) => {
    if (element.dataset.animateBound === 'true') {
      return;
    }

    const preset = getPreset(element);
    element.dataset.animateBound = 'true';
    element.style.opacity = preset.initial.opacity;
    element.style.transform = preset.initial.transform;
    element.style.willChange = 'opacity, transform';
    observer.observe(element);
  });
};

const smoothScrollTo = (target) => {
  const headerOffset = header ? header.offsetHeight + 16 : 0;
  const elementPosition = target.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerOffset;

  if (prefersReducedMotion) {
    window.scrollTo(0, offsetPosition);
    return;
  }

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

nav?.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash.length <= 1) {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    event.preventDefault();
    smoothScrollTo(target);
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  if (link.closest('nav')) {
    return;
  }

  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash.length <= 1) {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    event.preventDefault();
    smoothScrollTo(target);
  });
});

if (accordion) {
  accordion.addEventListener('click', (event) => {
    const trigger = event.target.closest('.accordion__trigger');
    if (!trigger) {
      return;
    }

    const item = trigger.parentElement;
    const panel = item?.querySelector('.accordion__panel');
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    trigger.setAttribute('aria-expanded', String(!isExpanded));
    if (panel) {
      panel.hidden = isExpanded;
    }
  });
}

if (demoButton) {
  demoButton.addEventListener('click', () => {
    console.log('Demo-aanvraag CTA aangeklikt. Hier komt later de leadflow.');
  });
}

const initEnhancements = () => {
  initializeIcons();
  setupMotionAnimations();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}
