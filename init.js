import(/* webpackMode: "eager" */ './blocks/adobetv/adobetv.js');
import(/* webpackMode: "eager" */ './blocks/adobetv/adobetv.css');
import(/* webpackMode: "eager" */ './blocks/aside/aside.js');
import(/* webpackMode: "eager" */ './blocks/aside/aside.css');
import(/* webpackMode: "eager" */ './blocks/cards/cards.js');
import(/* webpackMode: "eager" */ './blocks/cards/cards.css');
import(/* webpackMode: "eager" */ './blocks/carousel/carousel.js');
import(/* webpackMode: "eager" */ './blocks/carousel/carousel.css');
import(/* webpackMode: "eager" */ './blocks/columns/columns.js');
import(/* webpackMode: "eager" */ './blocks/columns/columns.css');
import(/* webpackMode: "eager" */ './blocks/editorial-card/editorial-card.js');
import(/* webpackMode: "eager" */ './blocks/editorial-card/editorial-card.css');
import(/* webpackMode: "eager" */ './blocks/header/header.js');
import(/* webpackMode: "eager" */ './blocks/header/header.css');
import(/* webpackMode: "eager" */ './blocks/hero/hero.js');
import(/* webpackMode: "eager" */ './blocks/hero/hero.css');
import(/* webpackMode: "eager" */ './blocks/iframe/iframe.js');
import(/* webpackMode: "eager" */ './blocks/iframe/iframe.css');
import(/* webpackMode: "eager" */ './blocks/fragment/fragment.js');
import(/* webpackMode: "eager" */ './blocks/fragment/fragment.css');
import(/* webpackMode: "eager" */ './blocks/footer/footer.js');
import(/* webpackMode: "eager" */ './blocks/footer/footer.css');
import(/* webpackMode: "eager" */ './blocks/marquee/marquee.js');
import(/* webpackMode: "eager" */ './blocks/marquee/marquee.css');
import(/* webpackMode: "eager" */ './blocks/media/media.js');
import(/* webpackMode: "eager" */ './blocks/media/media.css');
import(/* webpackMode: "eager" */ './blocks/mnemonic-list/mnemonic-list.js');
import(/* webpackMode: "eager" */ './blocks/mnemonic-list/mnemonic-list.css');
import(/* webpackMode: "eager" */ './blocks/quote/quote.js');
import(/* webpackMode: "eager" */ './blocks/quote/quote.css');
import(/* webpackMode: "eager" */ './blocks/section-metadata/section-metadata.css');
import(/* webpackMode: "eager" */ './blocks/section-metadata/section-metadata.js');
import(/* webpackMode: "eager" */ './blocks/section-metadata/sticky-section.js');
import(/* webpackMode: "eager" */ './blocks/text/link-farms.css');
import(/* webpackMode: "eager" */ './blocks/text/text.css');
import(/* webpackMode: "eager" */ './blocks/text/text.js');
import(/* webpackMode: "eager" */ './blocks/video/video.js');
import(/* webpackMode: "eager" */ './blocks/video/video.css');
import(/* webpackMode: "eager" */ './styles/iframe.css');
import(/* webpackMode: "eager" */ './styles/rounded-corners.css');
import(/* webpackMode: "eager" */ './utils/utils.js');

import loadPage from "./scripts/scripts.js";
import { customFetch } from "./utils/utils.js";
import "./styles/styles.css";

import { LitElement, html, css } from 'lit';

class AEMSites extends LitElement {
  static properties = {
    path: { type: String },
  };

  static styles = css`
    :host {
      display: block;
      position: relative;
    }
  `;

  constructor() {
    super();
    this.path = '';
    this._handleKeyDown = this._handleKeyDown.bind(this);
    this._handleKeyUp = this._handleKeyUp.bind(this);
    this._handleMouseEnter = this._handleMouseEnter.bind(this);
    this._handleMouseLeave = this._handleMouseLeave.bind(this);
    this._showOverlay = this._showOverlay.bind(this);
    this._hideOverlay = this._hideOverlay.bind(this);
    this._copyPathToClipboard = this._copyPathToClipboard.bind(this);
  }

  async firstUpdated() {
    await this.loadAEMFragment(this.path);
  }

  async loadAEMFragment(url) {
    try {
      const baseUrl = new URL(url);
      window.hlx = window.hlx || {};
      window.hlx.contentBaseRoot = baseUrl.origin;

      // Load AEM styles if not already loaded
      const stylesUrl = `${baseUrl.origin}/styles/styles.css`;
      const styleId = `aem-styles-${baseUrl.host}`;
      
      if (!document.getElementById(styleId)) {
        const link = document.createElement('link');
        link.id = styleId;
        link.rel = 'stylesheet';
        link.href = stylesUrl;
        document.head.appendChild(link);
        console.log('[AEM Sites] Styles loaded:', stylesUrl);
      }

      const response = await customFetch({ resource: url, withCacheRules: true });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const processedHtml = await response.text();

      const parser = new DOMParser();
      const fragmentDoc = parser.parseFromString(processedHtml, 'text/html');
      const fragmentBody = fragmentDoc.body;

      const main = document.createElement('main');
      main.innerHTML = fragmentBody.innerHTML;

      this.appendChild(main);

      console.log('[AEM Sites] Fragment loaded and injected successfully');

      loadPage(this);
    } catch (error) {
      console.error('[AEM Sites] Error loading fragment:', error);
      
      // Display error message to user
      const errorDiv = document.createElement('div');
      errorDiv.style.padding = '20px';
      errorDiv.style.border = '2px solid #d32f2f';
      errorDiv.style.borderRadius = '4px';
      errorDiv.style.backgroundColor = '#ffebee';
      errorDiv.style.color = '#c62828';
      errorDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      errorDiv.innerHTML = `
        <h3 style="margin-top: 0;">AEM Content Load Error</h3>
        <p><strong>Path:</strong> ${url}</p>
        <p><strong>Error:</strong> ${error.message || error}</p>
        <p style="font-size: 12px; color: #666;">
          Common causes: CORS not configured, invalid path, or network issue.
        </p>
      `;
      this.appendChild(errorDiv);
      
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('aem-load-error', { 
        detail: { error, url },
        bubbles: true 
      }));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    const isDebug = this.getAttribute('debug') !== 'false';
    if (isDebug) {
      window.addEventListener('keydown', this._handleKeyDown);
      window.addEventListener('keyup', this._handleKeyUp);
      this.addEventListener('mouseenter', this._handleMouseEnter);
      this.addEventListener('mouseleave', this._handleMouseLeave);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    const isDebug = this.getAttribute('debug') !== 'false';
    if (isDebug) {
      window.removeEventListener('keydown', this._handleKeyDown);
      window.removeEventListener('keyup', this._handleKeyUp);
      this.removeEventListener('mouseenter', this._handleMouseEnter);
      this.removeEventListener('mouseleave', this._handleMouseLeave);
    }
  }

  _handleMouseEnter() {
    if (this._isMetaPressed) {
      this._showOverlay();
    }
  }

  _handleMouseLeave() {
    this._hideOverlay();
  }

  _handleKeyDown(event) {
    if (event.key === 'Meta') {
      this._isMetaPressed = true;
    }
  }

  _handleKeyUp(event) {
    if (event.key === 'Meta') {
      this._isMetaPressed = false;
      this._hideOverlay();
    }
  }

  _showOverlay() {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
    overlay.style.zIndex = '10';
    overlay.style.cursor = 'pointer';
    overlay.addEventListener('click', () => {
      this._copyPathToClipboard();
      overlay.style.transition = 'background-color 0.2s';
      overlay.style.backgroundColor = 'rgba(0, 0, 255, 0)';
      setTimeout(() => {
        overlay.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
      }, 200);
    });
    this.appendChild(overlay);
    this._overlay = overlay;
  }

  _hideOverlay() {
    if (this._overlay) {
      this.removeChild(this._overlay);
      this._overlay = null;
    }
  }

  _copyPathToClipboard() {
    navigator.clipboard.writeText(this.path).then(() => {
      console.log('Path copied to clipboard:', this.path);
    }).catch(err => {
      console.error('Failed to copy path:', err);
    });
  }

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get('aem-sites')) {
  customElements.define('aem-sites', AEMSites);
}
