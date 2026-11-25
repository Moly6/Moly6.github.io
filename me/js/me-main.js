document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimation();
  initSkillBars();
  initMobileMenu();
  initPageTransition();
});

function initNavbar() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.me-navbar__link, .me-navbar__mobile-link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || currentPath.startsWith(href + '/')) {
      link.classList.add('is-active');
    }
  });
}

function initScrollAnimation() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.me-fade-in, .me-stagger-item, .me-scale-in').forEach(el => {
    observer.observe(el);
  });
}

function initSkillBars() {
  const skillBars = document.querySelectorAll('.me-skill-bar__fill');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  skillBars.forEach(bar => {
    observer.observe(bar);
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.me-navbar__toggle');
  const menu = document.querySelector('.me-navbar__mobile-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  });

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.me-navbar__mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

function initPageTransition() {
  document.body.classList.add('me-page-transition');
}

export function showSuccess(message) {
  const existing = document.querySelector('.me-form__success');
  if (existing) existing.remove();

  const successDiv = document.createElement('div');
  successDiv.className = 'me-form__success';
  successDiv.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span>${message}</span>
  `;

  const form = document.querySelector('.me-contact-form');
  if (form) {
    form.insertBefore(successDiv, form.firstChild);
  }
}

export function showError(message) {
  alert(message);
}

export function setLoading(button, isLoading) {
  if (isLoading) {
    button.classList.add('me-button--loading');
    button.disabled = true;
  } else {
    button.classList.remove('me-button--loading');
    button.disabled = false;
  }
}
