import { getMetadata } from '../../utils/utils.js';
import loadFragment from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
    }
  }
}

function openOnFocus(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget) && !isDesktop.matches) {
    // eslint-disable-next-line no-use-before-define
    toggleMenu(nav, nav.querySelector('.nav-sections'));
  }
}

function toggleMenu(nav, navSections) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  toggleAllNavSections(navSections, expanded);
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

function toggleAllNavSections(navSections, expanded = false) {
  navSections.querySelectorAll('[aria-expanded]').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

function enableToggleMenuOnFocus(nav) {
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  nav.addEventListener('focusout', closeOnFocusLost);
  nav.addEventListener('focusin', openOnFocus);
}

function initMobileNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  const hasHashLink = navSections.querySelector('a[href*="#"]');
  if (hasHashLink) {
    navSections.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggleMenu(nav, navSections);
      });
    });
  }

  enableToggleMenuOnFocus(nav);
}

function initDesktopNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;

  const hasHashLink = navSections.querySelector('a[href*="#"]');
  if (hasHashLink) {
    navSections.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        toggleAllNavSections(navSections);
      });
    });
  }

  enableToggleMenuOnFocus(nav);
}

function decorateNavSections(nav) {
  const navSections = [...nav.children];
  if (navSections.length === 0) return;

  const navSectionsWrapper = document.createElement('div');
  navSectionsWrapper.className = 'nav-sections';
  if (isDesktop.matches) {
    navSectionsWrapper.setAttribute('aria-expanded', 'true');
  }
  navSections.forEach((section) => {
    if (section.children.length === 2 && section.querySelector('div')) {
      navSectionsWrapper.append(section);
    }
  });
  nav.append(navSectionsWrapper);
}

function decorateButtons(nav) {
  const buttons = [...nav.querySelectorAll('a')];
  if (buttons.length === 0) return;

  buttons.forEach((a) => {
    a.classList.add('button');
    if (a.textContent.trim().toUpperCase() === 'SIGN IN') a.classList.add('button--secondary');
  });
}

function decorateLogo(nav) {
  const logo = nav.querySelector('.nav-brand');
  if (!logo) return;

  const logoWrapper = document.createElement('div');
  logoWrapper.className = 'nav-brand';
  logoWrapper.append(logo);
  nav.prepend(logoWrapper);
}

function decorateBlockBg(block) {
  const hasBg = block.classList.contains('has-bg');
  if (!hasBg) return;

  const children = [...block.children];
  if (children.length === 0) return;

  const picture = children[0].querySelector('picture');
  if (!picture) return;

  block.style.backgroundImage = `url(${picture.querySelector('img').src})`;
  children[0].remove();
}

export default async function decorate(block) {
  try {
    // load header as fragment
    const headerMeta = getMetadata('header');
    const headerPath = headerMeta ? new URL(headerMeta, window.location).pathname : '/header';
    
    // Create a temporary anchor element
    const tempLink = document.createElement('a');
    tempLink.href = headerPath;
    const fragment = await loadFragment(tempLink);

    // decorate header DOM
    block.textContent = '';
    const header = document.createElement('div');
    
    // Check if fragment exists and has children
    if (fragment && fragment.firstElementChild) {
      while (fragment.firstElementChild) header.append(fragment.firstElementChild);
      block.append(header);

      const nav = document.getElementById('nav');
      if (!nav) return;

      decorateBlockBg(block);
      decorateNavSections(nav);
      decorateButtons(nav);
      decorateLogo(nav);

      if (isDesktop.matches) {
        initDesktopNav();
      } else {
        initMobileNav();
      }

      document.addEventListener('keydown', closeOnEscape);
    } else {
      console.warn('Header fragment failed to load or is empty');
      // Optionally add a fallback header here
    }
  } catch (error) {
    console.error('Error loading header:', error);
    // Optionally add a fallback header here
  }
}
