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
})();