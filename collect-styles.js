// Auto-collect all CSS for Shadow DOM injection
// This file is imported by init.js to bundle all styles

// Main styles
import mainStyles from './styles/styles.css?inline';
import iframeStyles from './styles/iframe.css?inline';
import roundedCorners from './styles/rounded-corners.css?inline';

// Block styles - all imported explicitly
import adobetvCSS from './blocks/adobetv/adobetv.css?inline';
import asideCSS from './blocks/aside/aside.css?inline';
import cardsCSS from './blocks/cards/cards.css?inline';
import carouselCSS from './blocks/carousel/carousel.css?inline';
import columnsCSS from './blocks/columns/columns.css?inline';
import editorialCardCSS from './blocks/editorial-card/editorial-card.css?inline';
import headerCSS from './blocks/header/header.css?inline';
import heroCSS from './blocks/hero/hero.css?inline';
import iframeBlockCSS from './blocks/iframe/iframe.css?inline';
import fragmentCSS from './blocks/fragment/fragment.css?inline';
import footerCSS from './blocks/footer/footer.css?inline';
import marqueeCSS from './blocks/marquee/marquee.css?inline';
import mediaCSS from './blocks/media/media.css?inline';
import mnemonicListCSS from './blocks/mnemonic-list/mnemonic-list.css?inline';
import quoteCSS from './blocks/quote/quote.css?inline';
import sectionMetadataCSS from './blocks/section-metadata/section-metadata.css?inline';
import linkFarmsCSS from './blocks/text/link-farms.css?inline';
import textCSS from './blocks/text/text.css?inline';
import videoCSS from './blocks/video/video.css?inline';

// Combine all styles
const allStyles = [
  mainStyles,
  iframeStyles,
  roundedCorners,
  adobetvCSS,
  asideCSS,
  cardsCSS,
  carouselCSS,
  columnsCSS,
  editorialCardCSS,
  headerCSS,
  heroCSS,
  iframeBlockCSS,
  fragmentCSS,
  footerCSS,
  marqueeCSS,
  mediaCSS,
  mnemonicListCSS,
  quoteCSS,
  sectionMetadataCSS,
  linkFarmsCSS,
  textCSS,
  videoCSS,
].join('\n\n');

export default allStyles;
