import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    // Icon container (first element)
    const iconDiv = document.createElement('div');
    iconDiv.className = 'hva-card-icon';

    // Content container (title + description)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'hva-card-content';

    // CTA container (last element)
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'hva-card-cta';

    const children = [...row.children];

    children.forEach((cell, index) => {
      if (index === 0 && cell.querySelector('picture')) {
        // First cell with picture = icon
        iconDiv.append(...cell.children);
      } else if (index === children.length - 1 && cell.querySelector('a')) {
        // Last cell with link = CTA
        ctaDiv.append(...cell.children);
      } else if (index === 0 || (index === 1 && !children[0].querySelector('picture'))) {
        // Title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'hva-card-title';
        titleDiv.append(...cell.children);
        contentDiv.append(titleDiv);
      } else {
        // Description
        const descDiv = document.createElement('div');
        descDiv.className = 'hva-card-description';
        descDiv.append(...cell.children);
        contentDiv.append(descDiv);
      }
    });

    // Append in order: icon, content, cta
    if (iconDiv.children.length > 0) li.append(iconDiv);
    if (contentDiv.children.length > 0) li.append(contentDiv);
    if (ctaDiv.children.length > 0) li.append(ctaDiv);

    ul.append(li);
  });

  // Optimize images in icons
  ul.querySelectorAll('.hva-card-icon picture > img').forEach((img) => {
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, false, [
      { width: '100' },
    ]);
    img.closest('picture').replaceWith(optimizedPicture);
  });

  block.textContent = '';
  block.append(ul);
}
