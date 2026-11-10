(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const previousButton = document.querySelector('.hero-prev');
  const nextButton = document.querySelector('.hero-next');
  const hero = document.querySelector('.hero');
  const topButton = document.querySelector('.back-to-top');
  const year = document.getElementById('current-year');

  if (year) year.textContent = new Date().getFullYear();

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
        nav.classList.remove('is-open');
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton && nav) {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
      menuButton.focus();
    }
  });

  if (slides.length) {
    let activeIndex = 0;
    let timer = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === activeIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => {
        const active = i === activeIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', String(active));
      });
    };

    const next = () => showSlide(activeIndex + 1);
    const previous = () => showSlide(activeIndex - 1);

    const stopAutoplay = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };
    const startAutoplay = () => {
      stopAutoplay();
      if (!reduceMotion && !document.hidden) {
        timer = window.setInterval(next, 5500);
      }
    };

    if (nextButton) nextButton.addEventListener('click', () => { next(); startAutoplay(); });
    if (previousButton) previousButton.addEventListener('click', () => { previous(); startAutoplay(); });
    dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); startAutoplay(); }));

    if (hero) {
      hero.addEventListener('mouseenter', stopAutoplay);
      hero.addEventListener('mouseleave', startAutoplay);
      hero.addEventListener('focusin', stopAutoplay);
      hero.addEventListener('focusout', startAutoplay);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    showSlide(0);
    startAutoplay();
  }

  if (topButton) {
    const updateTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > 500);
    window.addEventListener('scroll', updateTopButton, { passive: true });
    updateTopButton();
    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Sidebar category filters and category-card shortcuts.
  const offerCards = Array.from(document.querySelectorAll('.offer-card[data-category]'));
  const filterControls = Array.from(document.querySelectorAll('.category-filter'));
  const categoryCards = Array.from(document.querySelectorAll('.category-card[data-filter]'));
  const discoveriesHeading = document.querySelector('#discoveries .section-heading h2');
  const filterStatus = document.getElementById('filter-status');

  const applyCategoryFilter = (filter) => {
    offerCards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
    filterControls.forEach((control) => {
      const selected = control.dataset.filter === filter;
      control.classList.toggle('is-selected', selected);
      control.setAttribute('aria-pressed', String(selected));
    });
    if (filterStatus) {
      const labels = { all: 'all discoveries', technology: 'technology discoveries', travel: 'travel discoveries', fashion: 'fashion discoveries', outdoor: 'outdoor discoveries', wellness: 'wellness discoveries', beauty: 'beauty & personal care discoveries' };
      const visibleCount = offerCards.filter((card) => !card.hidden).length;
      filterStatus.textContent = `Showing ${visibleCount} ${labels[filter] || labels.all}`;
    }
    if (discoveriesHeading) {
      const names = {
        all: 'Worth a closer <em>look</em>',
        technology: 'Technology <em>discoveries</em>',
        travel: 'Travel <em>discoveries</em>',
        fashion: 'Fashion <em>discoveries</em>',
        outdoor: 'Outdoor <em>discoveries</em>',
        wellness: 'Wellness <em>discoveries</em>',
        beauty: 'Beauty &amp; Personal Care <em>discoveries</em>'
      };
      discoveriesHeading.innerHTML = names[filter] || names.all;
    }
  };

  filterControls.forEach((control) => {
    control.addEventListener('click', () => {
      applyCategoryFilter(control.dataset.filter || 'all');
      document.querySelectorAll('.sidebar-group').forEach((group) => { group.open = false; });
      document.getElementById('discoveries')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  categoryCards.forEach((card) => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      applyCategoryFilter(card.dataset.filter || 'all');
      document.getElementById('discoveries')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  
  // Editorial inspiration shortcuts use the same category filter as the sidebar.
  document.querySelectorAll('.inspiration-link[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      applyCategoryFilter(button.dataset.filter || 'all');
      document.getElementById('discoveries')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  
  // Reveal selected sections gently as visitors move through the page.
  const revealTargets = document.querySelectorAll(
    '.intro-strip, .categories-section, .blitz-edit, .inspiration-strip, .featured-section, .brand-directory, .brand-note'
  );
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-ready');
    revealTargets.forEach((element) => element.setAttribute('data-reveal', ''));
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach((element) => revealObserver.observe(element));
  }

  // Mid-page product deep-link carousel.
  const discoverySlides = Array.from(document.querySelectorAll('.discovery-slide'));
  const discoveryDots = Array.from(document.querySelectorAll('.discovery-dot'));
  const discoveryPrev = document.querySelector('.discovery-prev');
  const discoveryNext = document.querySelector('.discovery-next');
  const discoverySlider = document.querySelector('.discovery-slider');

  if (discoverySlides.length) {
    let discoveryIndex = 0;
    let discoveryTimer = null;
    const discoveryReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const showDiscovery = (index) => {
      discoveryIndex = (index + discoverySlides.length) % discoverySlides.length;
      discoverySlides.forEach((slide, i) => {
        const active = i === discoveryIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      discoveryDots.forEach((dot, i) => {
        const active = i === discoveryIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', String(active));
      });
    };
    const stopDiscovery = () => {
      if (discoveryTimer) window.clearInterval(discoveryTimer);
      discoveryTimer = null;
    };
    const startDiscovery = () => {
      stopDiscovery();
      if (!discoveryReduceMotion && !document.hidden) {
        discoveryTimer = window.setInterval(() => showDiscovery(discoveryIndex + 1), 6000);
      }
    };

    if (discoveryNext) discoveryNext.addEventListener('click', () => { showDiscovery(discoveryIndex + 1); startDiscovery(); });
    if (discoveryPrev) discoveryPrev.addEventListener('click', () => { showDiscovery(discoveryIndex - 1); startDiscovery(); });
    discoveryDots.forEach((dot, index) => dot.addEventListener('click', () => { showDiscovery(index); startDiscovery(); }));
    if (discoverySlider) {
      discoverySlider.addEventListener('mouseenter', stopDiscovery);
      discoverySlider.addEventListener('mouseleave', startDiscovery);
      discoverySlider.addEventListener('focusin', stopDiscovery);
      discoverySlider.addEventListener('focusout', startDiscovery);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopDiscovery();
      else startDiscovery();
    });
    showDiscovery(0);
    startDiscovery();
  }


  // Measure the brand strip so it travels across the available width and glides back.
  const brandWindow = document.querySelector('.brand-directory-window');
  const brandRail = document.querySelector('.brand-directory-rail');
  if (brandWindow && brandRail) {
    const updateBrandTravel = () => {
      const distance = Math.max(0, brandRail.scrollWidth - brandWindow.clientWidth);
      brandRail.style.setProperty('--brand-rail-distance', distance + 'px');
      brandRail.style.setProperty('--brand-rail-duration', Math.max(22, distance / 24) + 's');
    };
    updateBrandTravel();
    if ('ResizeObserver' in window) {
      const brandResizeObserver = new ResizeObserver(updateBrandTravel);
      brandResizeObserver.observe(brandWindow);
      brandResizeObserver.observe(brandRail);
    } else {
      window.addEventListener('resize', updateBrandTravel);
    }
  }

})();
