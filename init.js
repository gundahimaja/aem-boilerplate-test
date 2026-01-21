import(/* webpackMode: "eager" */ './blocks/adobetv/adobetv.js');
import(/* webpackMode: "eager" */ './blocks/aside/aside.js');
import(/* webpackMode: "eager" */ './blocks/cards/cards.js');
import(/* webpackMode: "eager" */ './blocks/carousel/carousel.js');
import(/* webpackMode: "eager" */ './blocks/columns/columns.js');
import(/* webpackMode: "eager" */ './blocks/editorial-card/editorial-card.js');
import(/* webpackMode: "eager" */ './blocks/header/header.js');
import(/* webpackMode: "eager" */ './blocks/hero/hero.js');
import(/* webpackMode: "eager" */ './blocks/iframe/iframe.js');
import(/* webpackMode: "eager" */ './blocks/fragment/fragment.js');
import(/* webpackMode: "eager" */ './blocks/footer/footer.js');
import(/* webpackMode: "eager" */ './blocks/marquee/marquee.js');
import(/* webpackMode: "eager" */ './blocks/media/media.js');
import(/* webpackMode: "eager" */ './blocks/mnemonic-list/mnemonic-list.js');
import(/* webpackMode: "eager" */ './blocks/quote/quote.js');
import(/* webpackMode: "eager" */ './blocks/section-metadata/section-metadata.js');
import(/* webpackMode: "eager" */ './blocks/section-metadata/sticky-section.js');
import(/* webpackMode: "eager" */ './blocks/text/text.js');
import(/* webpackMode: "eager" */ './blocks/video/video.js');
import(/* webpackMode: "eager" */ './utils/utils.js');

import loadPage from "./scripts/scripts.js";
import { customFetch } from "./utils/utils.js";

// Import all CSS as text for Shadow DOM (CSS is in collect-styles.js)
import allStyles from './collect-styles.js';

import { LitElement, html, css, unsafeCSS } from 'lit';

class AEMSites extends LitElement {
  static properties = {
    path: { type: String },
  };

  // Bundle all CSS into Shadow DOM
  static styles = [
    css`
      :host {
        display: block;
        position: relative;
      }
    `,
    unsafeCSS(allStyles), // All bundled CSS injected here!
  ];

  // Remove createRenderRoot() - use default Shadow DOM
  
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
    console.log('[AEM Sites] Starting to load fragment:', url);
    try {
      const baseUrl = new URL(url);
      console.log('[AEM Sites] Base URL:', baseUrl.origin);
      
      window.hlx = window.hlx || {};
      window.hlx.contentBaseRoot = baseUrl.origin;

      console.log('[AEM Sites] Fetching content...');
      const response = await customFetch({ resource: url, withCacheRules: true });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const processedHtml = await response.text();
      console.log('[AEM Sites] Content fetched, parsing...');

      const parser = new DOMParser();
      const fragmentDoc = parser.parseFromString(processedHtml, 'text/html');
      const fragmentBody = fragmentDoc.body;

      const main = document.createElement('main');
      main.innerHTML = fragmentBody.innerHTML;

      this.shadowRoot.appendChild(main); // Shadow DOM with CSS!

      console.log('[AEM Sites] Fragment loaded and injected successfully');

      loadPage(this.shadowRoot); // Shadow DOM
      console.log('[AEM Sites] loadPage() completed');
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

  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get('aem-sites')) {
  customElements.define('aem-sites', AEMSites);
}
