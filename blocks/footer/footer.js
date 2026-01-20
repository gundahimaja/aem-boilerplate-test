import { getMetadata } from '../../utils/utils.js';
import loadFragment from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  try {
    // load footer as fragment
    const footerMeta = getMetadata('footer');
    const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
    
    // Create a temporary anchor element
    const tempLink = document.createElement('a');
    tempLink.href = footerPath;
    const fragment = await loadFragment(tempLink);

    // decorate footer DOM
    block.textContent = '';
    const footer = document.createElement('div');
    
    // Check if fragment exists and has children
    if (fragment && fragment.firstElementChild) {
      while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
      block.append(footer);
    } else {
      console.warn('Footer fragment failed to load or is empty');
      // Optionally add a fallback footer here
    }
  } catch (error) {
    console.error('Error loading footer:', error);
    // Optionally add a fallback footer here
  }
}
