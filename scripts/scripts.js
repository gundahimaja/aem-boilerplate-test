import { loadArea, setConfig } from '../utils/utils.js';

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  // document.documentElement.lang = 'en';
  // decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    loadArea(main);
    // document.body.classList.add('appear');
    // await loadSection(main.querySelector('.section'), waitForFirstImage);
  }
}

const config = {
  contentRoot: "/",
  codeRoot: "/",
  miloLibs: window.location.origin
};

export default async function loadPage(el) {
  setConfig(config);
  await loadEager(el);
}

if (window.app && window.app.BUILD_MODE === "dynamic") {
  loadPage(document);
}
