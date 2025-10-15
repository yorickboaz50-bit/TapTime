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

const setupFramerStaggerTimelines = () => {
  if (prefersReducedMotion || !window.motion?.timeline) {
    return;
  }

  const groups = document.querySelectorAll('[data-stagger-group]');
  if (!groups.length) {
    return;
  }

  const { timeline } = window.motion;

  const cleanup = (items) => {
    items.forEach((item) => {
      item.style.opacity = '';
      item.style.transform = '';
      item.style.filter = '';
      item.style.willChange = '';
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const group = entry.target;
        const items = group.querySelectorAll('[data-stagger-item]');
        if (!items.length) {
          observer.unobserve(group);
          return;
        }

        observer.unobserve(group);

        const sequences = Array.from(items).map((item, index) => {
          const groupDelay = Number.parseFloat(group.dataset.staggerDelay ?? '0') || 0;
          const itemDelay = Number.parseFloat(item.dataset.staggerDelay ?? '0') || 0;
          const at = groupDelay + itemDelay + index * 0.08;

          return [
            item,
            {
              opacity: [0, 1],
              transform: ['translateY(24px)', 'translateY(0)'],
              filter: ['blur(8px)', 'blur(0px)']
            },
            {
              at,
              duration: 0.6,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
            }
          ];
        });

        const animation = timeline(sequences);

        animation.finished
          .then(() => {
            cleanup(items);
          })
          .catch(() => {
            cleanup(items);
          });
      });
    },
    { threshold: 0.2 }
  );

  groups.forEach((group) => {
    const items = group.querySelectorAll('[data-stagger-item]');
    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.filter = 'blur(8px)';
      item.style.willChange = 'opacity, transform, filter';
    });

    observer.observe(group);
  });
};

const setupFramerMicroAnimations = () => {
  if (prefersReducedMotion || !window.motion?.animate) {
    return;
  }

  const { animate } = window.motion;

  const heroVisual = document.querySelector('[data-hero-visual]');
  if (heroVisual) {
    heroVisual.style.willChange = 'transform';
    animate(
      heroVisual,
      { transform: ['translateY(0px)', 'translateY(-12px)', 'translateY(0px)'] },
      { duration: 12, easing: 'ease-in-out', repeat: Infinity }
    );
  }

  const heroGlow = document.querySelector('[data-hero-glow]');
  if (heroGlow) {
    heroGlow.style.willChange = 'opacity, transform';
    animate(
      heroGlow,
      { opacity: [0.22, 0.42, 0.22], transform: ['scale(0.95)', 'scale(1.05)', 'scale(0.95)'] },
      { duration: 10, easing: 'ease-in-out', repeat: Infinity }
    );
  }

  document.querySelectorAll('[data-float]').forEach((element, index) => {
    element.style.willChange = 'transform';
    animate(
      element,
      {
        transform: ['translateY(0px)', 'translateY(-12px)', 'translateY(0px)'],
        rotate: ['0deg', '2deg', '0deg']
      },
      {
        duration: 6 + index * 0.4,
        easing: 'ease-in-out',
        repeat: Infinity,
        delay: index * 0.2
      }
    );
  });

  const pulseElement = document.querySelector('[data-pulse]');
  if (pulseElement) {
    pulseElement.style.willChange = 'transform, opacity';
    animate(
      pulseElement,
      { transform: ['scale(0.85)', 'scale(1.15)', 'scale(0.85)'], opacity: [0.45, 0, 0.45] },
      { duration: 2.4, easing: 'ease-out', repeat: Infinity }
    );
  }
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

const demoSteps = Array.from(document.querySelectorAll('[data-demo-step]'));
const demoNavLinks = Array.from(document.querySelectorAll('[data-demo-nav-link]'));

if (demoSteps.length > 0 && demoNavLinks.length > 0) {
  const linkMap = new Map(
    demoNavLinks
      .map((link) => {
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) {
          return null;
        }

        return [hash.slice(1), link];
      })
      .filter((entry) => entry !== null)
  );

  const setActiveLink = (id) => {
    linkMap.forEach((link, key) => {
      if (key === id) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  };

  const updateActiveLink = () => {
    const offset = (header?.offsetHeight ?? 0) + 32;
    let currentId = demoSteps[0]?.id;

    for (const step of demoSteps) {
      const top = step.getBoundingClientRect().top;
      if (top - offset <= 0) {
        currentId = step.id;
      } else {
        break;
      }
    }

    if (currentId) {
      setActiveLink(currentId);
    }
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();

  demoNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        setActiveLink(hash.slice(1));
      }
    });
  });
}

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
    console.log('Live demo CTA aangeklikt. Hier komt later de leadflow.');
  });
}

const demoRoot = document.querySelector('[data-demo-root]');

if (demoRoot) {
  const barsListEl = demoRoot.querySelector('[data-demo-bars]');
  const menuContainer = demoRoot.querySelector('[data-demo-menu]');
  const emptyStateEl = demoRoot.querySelector('[data-demo-empty]');
  const barNameEl = demoRoot.querySelector('[data-demo-bar-name]');
  const barMetaEl = demoRoot.querySelector('[data-demo-bar-meta]');
  const cartContainer = demoRoot.querySelector('[data-demo-cart]');
  const orderMetaEl = demoRoot.querySelector('[data-demo-order-meta]');
  const statusWrapper = demoRoot.querySelector('[data-demo-status]');
  const statusListEl = demoRoot.querySelector('[data-demo-status-list]');
  const statusCodeEl = demoRoot.querySelector('[data-demo-order-code]');
  const statusSubtitleEl = demoRoot.querySelector('[data-demo-status-subtitle]');
  const statusMessageEl = demoRoot.querySelector('[data-demo-status-message]');
  const queueWrapper = demoRoot.querySelector('[data-demo-queue]');
  const queueBarEl = demoRoot.querySelector('[data-demo-queue-bar]');
  const queueListEl = demoRoot.querySelector('[data-demo-queue-list]');

  const currency = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

  const demoBars = [
    {
      id: 'main-stage',
      codePrefix: 'M',
      name: 'Main Stage Bar',
      waitTime: 4,
      crew: 6,
      crowdLevel: 'calm',
      crowdLabel: 'Rustig',
      highlight: 'Snelste service bij het hoofdpodium.',
      menu: [
        {
          id: 'tapbier',
          name: 'Tapbier 0,3L',
          description: 'Vers getapt pilsener, ijskoud geserveerd.',
          price: 3.75,
          category: 'Drankjes'
        },
        {
          id: 'radler',
          name: 'Radler 0,0%',
          description: 'Frisse citrusdrank zonder alcohol.',
          price: 3.5,
          category: 'Drankjes'
        },
        {
          id: 'nachos',
          name: "Loaded nacho's",
          description: 'Met cheddar, jalapeño en salsa. Ideaal om te delen.',
          price: 7.5,
          category: 'Snacks'
        },
        {
          id: 'water',
          name: 'Plat water 0,5L',
          description: 'Hervulbare fles met gekoeld bronwater.',
          price: 2.5,
          category: 'Drankjes'
        }
      ],
      queue: [
        { code: 'M-214', items: ['2x Tapbier', '1x Radler'], statusKey: 'preparing', status: 'Crew rondt af', readyIn: 3 },
        { code: 'M-209', items: ['4x Tapbier'], statusKey: 'queued', status: 'Wordt bereid', readyIn: 5 },
        { code: 'M-198', items: ["2x Nacho's"], statusKey: 'ready', status: 'Klaar om af te halen', readyIn: 0 }
      ]
    },
    {
      id: 'craft-corner',
      codePrefix: 'C',
      name: 'Craft Beer Corner',
      waitTime: 7,
      crew: 4,
      crowdLevel: 'busy',
      crowdLabel: 'Druk',
      highlight: 'Specialty bieren en premium mixers.',
      menu: [
        {
          id: 'ipa',
          name: 'Hazy IPA 0,4L',
          description: 'Tropisch bier van een lokale brouwer.',
          price: 5.5,
          category: 'Drankjes'
        },
        {
          id: 'stout',
          name: 'Nitro Stout 0,3L',
          description: 'Romig donker bier met cacao-tonen.',
          price: 5.75,
          category: 'Drankjes'
        },
        {
          id: 'gt',
          name: 'Gin-tonic',
          description: 'Bombay Sapphire met huisgemaakte tonic siroop.',
          price: 8.5,
          category: 'Cocktails'
        },
        {
          id: 'cheese',
          name: 'Artisan kaasplank',
          description: 'Selectie van drie kazen met dip en crackers.',
          price: 9,
          category: 'Snacks'
        }
      ],
      queue: [
        { code: 'C-118', items: ['2x Hazy IPA'], statusKey: 'queued', status: 'Wordt bereid', readyIn: 6 },
        { code: 'C-112', items: ['1x Gin-tonic', '1x Kaasplank'], statusKey: 'preparing', status: 'Crew rondt af', readyIn: 4 },
        { code: 'C-105', items: ['2x Nitro Stout'], statusKey: 'ready', status: 'Klaar om af te halen', readyIn: 0 }
      ]
    },
    {
      id: 'street-food',
      codePrefix: 'S',
      name: 'Street Food Plaza',
      waitTime: 6,
      crew: 5,
      crowdLevel: 'normal',
      crowdLabel: 'Doorstroom goed',
      highlight: 'Vers bereide bites en vega-opties.',
      menu: [
        {
          id: 'vegan-bao',
          name: 'Vegan bao bun',
          description: 'Gevuld met pulled jackfruit en kimchi.',
          price: 6.5,
          category: 'Gerechten'
        },
        {
          id: 'loaded-fries',
          name: 'Loaded fries',
          description: 'Friet met truffelmayo en Parmezaan.',
          price: 6.75,
          category: 'Gerechten'
        },
        {
          id: 'satay',
          name: 'Kippensaté',
          description: 'Met pindasaus en frisse atjar.',
          price: 7.25,
          category: 'Gerechten'
        },
        {
          id: 'iced-tea',
          name: 'Huisgemaakte iced tea',
          description: 'Perzik, munt en citroen.',
          price: 3.95,
          category: 'Drankjes'
        }
      ],
      queue: [
        { code: 'S-342', items: ['2x Vegan bao'], statusKey: 'preparing', status: 'Crew rondt af', readyIn: 2 },
        { code: 'S-338', items: ['1x Loaded fries', '1x Iced tea'], statusKey: 'queued', status: 'Wordt bereid', readyIn: 4 },
        { code: 'S-331', items: ['3x Kippensaté'], statusKey: 'queued', status: 'Wordt bereid', readyIn: 5 }
      ]
    }
  ];

  const statusSteps = [
    { key: 'received', label: 'Bestelling ontvangen', icon: 'inbox' },
    { key: 'preparing', label: 'Bar bereidt je order', icon: 'timer' },
    { key: 'ready', label: 'Klaar voor ophalen', icon: 'check-circle-2' }
  ];

  const demoState = {
    selectedBarId: null,
    cart: new Map(),
    queueData: [],
    queueTimer: null,
    statusTimeouts: [],
    activeOrderCode: null
  };

  const createCartKey = (barId, itemId) => `${barId}__${itemId}`;
  const getBarById = (id) => demoBars.find((bar) => bar.id === id);
  const getSelectedBar = () => getBarById(demoState.selectedBarId ?? '');

  const resetStatus = () => {
    demoState.statusTimeouts.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    demoState.statusTimeouts = [];
    demoState.activeOrderCode = null;
    statusListEl.innerHTML = '';
    statusCodeEl.textContent = '';
    statusSubtitleEl.textContent = '';
    statusMessageEl.textContent = '';
    if (statusWrapper) {
      statusWrapper.hidden = true;
    }
  };

  const formatMinutes = (value) => {
    if (value <= 0) {
      return 'nu';
    }

    return `${value} min`;
  };

  const formatQueueSummary = (items) => items.join(' · ');

  const renderBars = () => {
    if (!barsListEl) {
      return;
    }

    barsListEl.innerHTML = '';
    const fragment = document.createDocumentFragment();

    demoBars.forEach((bar) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'demo__bar-card';
      button.dataset.barButton = bar.id;
      button.setAttribute('role', 'listitem');
      button.setAttribute('aria-pressed', bar.id === demoState.selectedBarId ? 'true' : 'false');

      const top = document.createElement('div');
      top.className = 'demo__bar-top';

      const name = document.createElement('h4');
      name.className = 'demo__bar-name';
      name.textContent = bar.name;

      const chip = document.createElement('span');
      chip.className = 'demo__chip';
      if (bar.crowdLevel === 'busy') {
        chip.classList.add('demo__chip--busy');
      } else if (bar.crowdLevel === 'calm') {
        chip.classList.add('demo__chip--calm');
      }
      chip.textContent = bar.crowdLabel;

      top.append(name, chip);

      const meta = document.createElement('p');
      meta.className = 'demo__bar-meta';
      meta.textContent = `Gem. wachttijd ${bar.waitTime} min · ${bar.crew} crewleden actief`;

      const highlight = document.createElement('p');
      highlight.className = 'demo__highlight';
      highlight.textContent = bar.highlight;

      button.append(top, meta, highlight);
      fragment.append(button);
    });

    barsListEl.append(fragment);
  };

  const updateOrderMeta = () => {
    if (!orderMetaEl) {
      return;
    }

    const bar = getSelectedBar();
    if (!bar) {
      orderMetaEl.textContent = 'Vul je mandje en ontdek hoe snel een order doorloopt.';
      return;
    }

    orderMetaEl.textContent = `Bestelling voor ${bar.name}. Verwachte wachttijd ± ${bar.waitTime} min.`;
  };

  const renderMenu = () => {
    const bar = getSelectedBar();

    if (!menuContainer || !emptyStateEl || !barNameEl || !barMetaEl) {
      return;
    }

    if (!bar) {
      menuContainer.hidden = true;
      emptyStateEl.hidden = false;
      barNameEl.textContent = 'Selecteer een bar';
      barMetaEl.textContent = 'Je ziet hier het live menu inclusief wachttijd en specials.';
      menuContainer.innerHTML = '';
      return;
    }

    menuContainer.hidden = false;
    emptyStateEl.hidden = true;
    menuContainer.innerHTML = '';
    barNameEl.textContent = bar.name;
    barMetaEl.textContent = `Gem. wachttijd ± ${bar.waitTime} min · ${bar.crew} crewleden actief. ${bar.highlight}`;

    const categories = Array.from(new Set(bar.menu.map((item) => item.category)));

    const fragment = document.createDocumentFragment();

    categories.forEach((category) => {
      const categoryWrapper = document.createElement('div');
      categoryWrapper.className = 'demo__category';

      const title = document.createElement('h4');
      title.className = 'demo__category-title';
      title.textContent = category;

      const list = document.createElement('ul');
      list.className = 'demo__items';

      bar.menu
        .filter((item) => item.category === category)
        .forEach((item) => {
          const listItem = document.createElement('li');
          listItem.className = 'demo__item';

          const info = document.createElement('div');
          info.className = 'demo__item-info';

          const itemTitle = document.createElement('h5');
          itemTitle.className = 'demo__item-title';
          itemTitle.textContent = item.name;

          const itemDescription = document.createElement('p');
          itemDescription.className = 'demo__item-description';
          itemDescription.textContent = item.description;

          info.append(itemTitle, itemDescription);

          const action = document.createElement('div');
          action.className = 'demo__item-action';

          const price = document.createElement('span');
          price.className = 'demo__price';
          price.textContent = currency.format(item.price);

          const addButton = document.createElement('button');
          addButton.type = 'button';
          addButton.className = 'demo__add';
          addButton.dataset.addItem = item.id;
          addButton.textContent = 'Voeg toe';

          action.append(price, addButton);

          listItem.append(info, action);
          list.append(listItem);
        });

      categoryWrapper.append(title, list);
      fragment.append(categoryWrapper);
    });

    menuContainer.append(fragment);
  };

  const renderCart = () => {
    if (!cartContainer) {
      return;
    }

    cartContainer.innerHTML = '';

    if (!demoState.cart.size) {
      const empty = document.createElement('p');
      empty.className = 'demo__empty';
      empty.textContent = 'Nog niets geselecteerd. Voeg producten toe uit het menu.';
      cartContainer.append(empty);
      return;
    }

    const itemsWrapper = document.createElement('div');
    itemsWrapper.className = 'demo__cart-items';

    let totalQuantity = 0;
    let totalAmount = 0;

    demoState.cart.forEach((entry, key) => {
      const { item, quantity } = entry;
      totalQuantity += quantity;
      totalAmount += item.price * quantity;

      const article = document.createElement('article');
      article.className = 'demo__cart-item';
      article.dataset.cartItem = key;

      const info = document.createElement('div');
      info.className = 'demo__cart-info';

      const title = document.createElement('h5');
      title.className = 'demo__cart-title';
      title.textContent = item.name;

      const meta = document.createElement('p');
      meta.className = 'demo__cart-meta';
      meta.textContent = `${currency.format(item.price)} per stuk`;

      info.append(title, meta);

      const controls = document.createElement('div');
      controls.className = 'demo__cart-controls';

      const decrease = document.createElement('button');
      decrease.type = 'button';
      decrease.className = 'demo__quantity-btn';
      decrease.dataset.cartAction = 'decrease';
      decrease.dataset.itemKey = key;
      decrease.setAttribute('aria-label', `${item.name} verwijderen`);
      decrease.textContent = '−';

      const value = document.createElement('span');
      value.className = 'demo__quantity-value';
      value.textContent = String(quantity);

      const increase = document.createElement('button');
      increase.type = 'button';
      increase.className = 'demo__quantity-btn';
      increase.dataset.cartAction = 'increase';
      increase.dataset.itemKey = key;
      increase.setAttribute('aria-label', `${item.name} toevoegen`);
      increase.textContent = '+';

      controls.append(decrease, value, increase);

      const lineTotal = document.createElement('div');
      lineTotal.className = 'demo__cart-total';
      lineTotal.textContent = currency.format(item.price * quantity);

      article.append(info, controls, lineTotal);
      itemsWrapper.append(article);
    });

    const footer = document.createElement('div');
    footer.className = 'demo__cart-footer';

    const summary = document.createElement('div');
    summary.className = 'demo__summary';

    const count = document.createElement('span');
    count.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;

    const total = document.createElement('strong');
    total.textContent = currency.format(totalAmount);

    summary.append(count, total);

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.className = 'btn btn--primary demo__submit';
    submit.dataset.cartAction = 'submit';
    submit.textContent = 'Plaats demo-bestelling';
    submit.disabled = !demoState.selectedBarId || totalQuantity === 0;

    footer.append(summary, submit);

    cartContainer.append(itemsWrapper, footer);
  };

  const renderQueue = () => {
    const bar = getSelectedBar();
    if (!queueWrapper || !queueListEl || !queueBarEl) {
      return;
    }

    if (!bar) {
      queueWrapper.hidden = true;
      queueListEl.innerHTML = '';
      return;
    }

    queueWrapper.hidden = false;
    queueBarEl.textContent = `${bar.name} · wachttijd ± ${bar.waitTime} min`;
    queueListEl.innerHTML = '';

    if (!demoState.queueData.length) {
      const empty = document.createElement('li');
      empty.className = 'demo__queue-empty';
      empty.textContent = 'Nog geen openstaande bestellingen.';
      queueListEl.append(empty);
      return;
    }

    demoState.queueData.slice(0, 5).forEach((order) => {
      const item = document.createElement('li');
      item.className = 'demo__queue-item';
      if (order.statusKey === 'ready') {
        item.classList.add('is-ready');
      }
      if (order.isUserOrder) {
        item.classList.add('demo__queue-item--mine');
      }

      const orderInfo = document.createElement('div');
      orderInfo.className = 'demo__queue-order';

      const code = document.createElement('strong');
      code.textContent = `Order ${order.code}`;

      const summary = document.createElement('span');
      summary.textContent = formatQueueSummary(order.items);

      orderInfo.append(code, summary);

      const meta = document.createElement('div');
      meta.className = 'demo__queue-meta';

      const status = document.createElement('span');
      status.className = 'demo__queue-status';
      status.textContent = order.status;

      const time = document.createElement('span');
      time.className = 'demo__queue-time';
      time.textContent = formatMinutes(order.readyIn);

      meta.append(status, time);

      item.append(orderInfo, meta);
      queueListEl.append(item);
    });
  };

  const updateQueueOrder = (code, updates) => {
    const index = demoState.queueData.findIndex((entry) => entry.code === code);
    if (index === -1) {
      return;
    }

    demoState.queueData[index] = {
      ...demoState.queueData[index],
      ...updates,
      readyCycles: updates.readyCycles ?? demoState.queueData[index].readyCycles ?? 0
    };
    renderQueue();
  };

  const createQueueOrder = (bar) => {
    const selections = Array.from({ length: Math.random() > 0.55 ? 3 : 2 }, () => {
      const item = bar.menu[Math.floor(Math.random() * bar.menu.length)];
      return item.name;
    });

    const summaryMap = selections.reduce((acc, name) => {
      const existing = acc.get(name) ?? 0;
      acc.set(name, existing + 1);
      return acc;
    }, new Map());

    const summary = Array.from(summaryMap.entries()).map(([name, count]) => `${count}x ${name}`);

    return {
      code: `${bar.codePrefix}-${Math.floor(100 + Math.random() * 900)}`,
      items: summary,
      statusKey: 'queued',
      status: 'Wordt bereid',
      readyIn: Math.max(2, Math.round(bar.waitTime + Math.random() * 2)),
      readyCycles: 0,
      isUserOrder: false
    };
  };

  const advanceQueue = (bar) => {
    const previousLength = demoState.queueData.length;
    const updated = [];

    demoState.queueData.forEach((order) => {
      if (order.statusKey === 'ready') {
        const cycles = (order.readyCycles ?? 0) + 1;
        if (cycles < 2) {
          updated.push({ ...order, readyCycles: cycles });
        }
        return;
      }

      const decrement = order.isUserOrder ? 1 : Math.max(1, Math.round(Math.random()));
      const nextReadyIn = Math.max(0, order.readyIn - decrement);

      let statusKey = order.statusKey;
      let statusText = order.status;

      if (nextReadyIn <= 0) {
        statusKey = 'ready';
        statusText = order.isUserOrder ? 'Klaar voor ophalen' : 'Klaar om af te halen';
      } else if (nextReadyIn <= 2) {
        statusKey = 'preparing';
        statusText = order.isUserOrder ? 'Crew rondt jouw order af' : 'Crew rondt af';
      } else {
        statusKey = 'queued';
        statusText = order.isUserOrder ? 'In de wachtrij' : 'Wordt bereid';
      }

      updated.push({
        ...order,
        readyIn: nextReadyIn,
        statusKey,
        status: statusText
      });
    });

    demoState.queueData = updated;

    if (demoState.queueData.length < Math.max(previousLength, 4)) {
      demoState.queueData.push(createQueueOrder(bar));
    }

    while (demoState.queueData.length < 4) {
      demoState.queueData.push(createQueueOrder(bar));
    }

    renderQueue();
  };

  const startQueueSimulation = (bar) => {
    if (demoState.queueTimer) {
      window.clearInterval(demoState.queueTimer);
    }

    demoState.queueData = bar.queue.map((order) => ({
      ...order,
      readyCycles: order.statusKey === 'ready' ? 1 : 0,
      isUserOrder: false
    }));
    renderQueue();

    demoState.queueTimer = window.setInterval(() => {
      advanceQueue(bar);
    }, 5000);
  };

  const ensureStatusList = () => {
    statusListEl.innerHTML = '';

    statusSteps.forEach((step) => {
      const listItem = document.createElement('li');
      listItem.className = 'demo__status-step';
      listItem.dataset.statusStep = step.key;

      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', step.icon);

      const label = document.createElement('span');
      label.textContent = step.label;

      listItem.append(icon, label);
      statusListEl.append(listItem);
    });

    initializeIcons();
  };

  const setStatusStep = (activeKey) => {
    const activeIndex = statusSteps.findIndex((step) => step.key === activeKey);

    statusListEl.querySelectorAll('.demo__status-step').forEach((element) => {
      const stepKey = element.dataset.statusStep;
      const stepIndex = statusSteps.findIndex((step) => step.key === stepKey);
      element.classList.toggle('is-active', stepKey === activeKey);
      element.classList.toggle('is-complete', stepIndex < activeIndex);
    });
  };

  const scheduleStatus = (order, bar) => {
    if (!statusWrapper) {
      return;
    }

    ensureStatusList();
    setStatusStep('received');
    statusWrapper.hidden = false;
    statusCodeEl.textContent = order.code;
    statusSubtitleEl.textContent = `Bestelling voor ${bar.name}. Verwachte wachttijd ± ${bar.waitTime} min.`;
    statusMessageEl.textContent = 'Onze crew heeft je bestelling ontvangen.';

    demoState.statusTimeouts.push(
      window.setTimeout(() => {
        setStatusStep('preparing');
        statusMessageEl.textContent = 'Het barteam is bezig met je bestelling.';
        updateQueueOrder(order.code, { statusKey: 'preparing', status: 'Crew rondt jouw order af', readyIn: Math.max(1, Math.round(bar.waitTime / 2)) });
      }, 2400)
    );

    const readyDelay = 2400 + Math.max(2600, bar.waitTime * 500);

    demoState.statusTimeouts.push(
      window.setTimeout(() => {
        setStatusStep('ready');
        statusMessageEl.textContent = `Order ${order.code} staat klaar bij de pick-up counter.`;
        updateQueueOrder(order.code, { statusKey: 'ready', status: 'Klaar voor ophalen', readyIn: 0, readyCycles: 0 });
      }, readyDelay)
    );

    demoState.statusTimeouts.push(
      window.setTimeout(() => {
        statusMessageEl.textContent = 'Laat je code zien bij het afhaalpunt voor snelle service.';
      }, readyDelay + 3200)
    );
  };

  const selectBar = (barId) => {
    if (demoState.selectedBarId === barId) {
      return;
    }

    demoState.selectedBarId = barId;
    demoState.cart.clear();
    resetStatus();

    const bar = getSelectedBar();

    renderBars();
    renderMenu();
    renderCart();
    updateOrderMeta();

    if (bar) {
      startQueueSimulation(bar);
    } else if (demoState.queueTimer) {
      window.clearInterval(demoState.queueTimer);
      demoState.queueTimer = null;
      demoState.queueData = [];
      renderQueue();
    }
  };

  const addItemToCart = (itemId) => {
    const bar = getSelectedBar();
    if (!bar) {
      return;
    }

    const item = bar.menu.find((entry) => entry.id === itemId);
    if (!item) {
      return;
    }

    const key = createCartKey(bar.id, item.id);
    const existing = demoState.cart.get(key);

    demoState.cart.set(key, {
      item,
      quantity: existing ? existing.quantity + 1 : 1
    });

    renderCart();
  };

  const updateCartQuantity = (key, delta) => {
    const entry = demoState.cart.get(key);
    if (!entry) {
      return;
    }

    const nextQuantity = entry.quantity + delta;
    if (nextQuantity <= 0) {
      demoState.cart.delete(key);
    } else {
      demoState.cart.set(key, { ...entry, quantity: nextQuantity });
    }

    renderCart();
  };

  const placeOrder = () => {
    const bar = getSelectedBar();
    if (!bar || !demoState.cart.size) {
      return;
    }

    const items = Array.from(demoState.cart.values());
    const summary = items.map((entry) => `${entry.quantity}x ${entry.item.name}`);
    const totalQuantity = items.reduce((acc, entry) => acc + entry.quantity, 0);

    const orderCode = `${bar.codePrefix}-${Math.floor(200 + Math.random() * 700)}`;
    demoState.activeOrderCode = orderCode;

    const queueOrder = {
      code: orderCode,
      items: summary,
      statusKey: 'queued',
      status: 'In de wachtrij',
      readyIn: Math.max(2, bar.waitTime - 1),
      readyCycles: 0,
      isUserOrder: true
    };

    demoState.cart.clear();
    renderCart();

    demoState.queueData = [queueOrder, ...demoState.queueData];
    renderQueue();

    resetStatus();
    scheduleStatus({ code: orderCode, quantity: totalQuantity }, bar);
  };

  renderBars();
  renderMenu();
  renderCart();
  updateOrderMeta();
  resetStatus();
  renderQueue();

  barsListEl?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-bar-button]');
    if (!button) {
      return;
    }

    selectBar(button.dataset.barButton ?? '');
  });

  menuContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-item]');
    if (!button) {
      return;
    }

    addItemToCart(button.dataset.addItem ?? '');
  });

  cartContainer?.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-cart-action]');
    if (!actionButton) {
      return;
    }

    const { cartAction, itemKey } = actionButton.dataset;

    if (cartAction === 'increase') {
      updateCartQuantity(itemKey ?? '', 1);
      return;
    }

    if (cartAction === 'decrease') {
      updateCartQuantity(itemKey ?? '', -1);
      return;
    }

    if (cartAction === 'submit') {
      placeOrder();
    }
  });
}

const initEnhancements = () => {
  initializeIcons();
  setupMotionAnimations();
  setupFramerStaggerTimelines();
  setupFramerMicroAnimations();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEnhancements);
} else {
  initEnhancements();
}
