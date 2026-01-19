import { LitElement, html, css } from 'lit';
import loadPage from './scripts/scripts.js';
import { customFetch } from './utils/utils.js';

import(/* webpackMode: "eager" */ './blocks/cards/cards.js');
import(/* webpackMode: "eager" */ './blocks/cards/cards.css');
import(/* webpackMode: "eager" */ './blocks/columns/columns.js');
import(/* webpackMode: "eager" */ './blocks/columns/columns.css');
import(/* webpackMode: "eager" */ './blocks/footer/footer.js');
import(/* webpackMode: "eager" */ './blocks/footer/footer.css');
import(/* webpackMode: "eager" */ './blocks/fragment/fragment.js');
import(/* webpackMode: "eager" */ './blocks/fragment/fragment.css');
import(/* webpackMode: "eager" */ './blocks/header/header.js');
import(/* webpackMode: "eager" */ './blocks/header/header.css');
import(/* webpackMode: "eager" */ './blocks/hero/hero.js');
import(/* webpackMode: "eager" */ './blocks/hero/hero.css');

class AEMBoilerplateTest extends LitElement {
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

      const response = await customFetch({ resource: url, withCacheRules: true });
      const processedHtml = await response.text();

      const parser = new DOMParser();
      const fragmentDoc = parser.parseFromString(processedHtml, 'text/html');
      const fragmentBody = fragmentDoc.body;

      const main = document.createElement('main');
      main.innerHTML = fragmentBody.innerHTML;

      this.appendChild(main);
      console.log('Fragment loaded and injected successfully');
      loadPage(this);
      console.log('Page loaded and decorated');
    } catch (error) {
      console.error('Error loading fragment:', error);
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
    }).catch((err) => {
      console.error('Failed to copy path:', err);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return html`<slot></slot>`;
  }
}

if (!customElements.get('aem-sites')) {
  customElements.define('aem-sites', AEMBoilerplateTest);
}
