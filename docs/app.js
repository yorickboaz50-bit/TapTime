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
