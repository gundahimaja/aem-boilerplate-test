# CSS Fix for Web Component

## 🔴 The Problem

When using Shadow DOM in the web component, **bundled CSS couldn't style the content**.

### Why?

1. **Webpack bundles CSS globally** (into page `<head>` or external file)
2. **Shadow DOM is isolated** from global styles
3. **Content was in Shadow DOM** but CSS was on the page
4. **Result:** Unstyled content ❌

---

## ✅ The Solution: Disable Shadow DOM

By adding `createRenderRoot()` method, we disable Shadow DOM and use **Light DOM** instead.

### Code Changes in `init.js`

```javascript
class AEMSites extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
    }
  `;

  // Disable Shadow DOM so bundled CSS can style content
  createRenderRoot() {
    return this; // Returns component itself, not shadowRoot
  }

  async loadAEMFragment(url) {
    // ...
    this.appendChild(main); // Light DOM - can access bundled CSS
    loadPage(this); // Pass component, not shadowRoot
  }
}
```

---

## 🎯 How It Works Now

### Before (Shadow DOM - CSS didn't work)

```
┌─────────────────────────────────────────┐
│ Page <head>                             │
│   <style>                               │
│     /* All bundled CSS here */          │
│   </style>                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ <aem-sites>                             │
│   #shadow-root (isolated)               │
│     <main>                              │
│       <div class="accordion">           │
│         ❌ NO CSS APPLIED               │
│       </div>                            │
│     </main>                             │
└─────────────────────────────────────────┘
```

### After (Light DOM - CSS works!)

```
┌─────────────────────────────────────────┐
│ Page <head>                             │
│   <style>                               │
│     /* All bundled CSS here */          │
│   </style>                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ <aem-sites>                             │
│   <main>                                │
│     <div class="accordion">             │
│       ✅ CSS APPLIED                    │
│     </div>                              │
│   </main>                               │
└─────────────────────────────────────────┘
```

---

## ⚖️ Trade-offs

### ❌ Lost: CSS Isolation
- Component styles can leak to page
- Page styles can affect component
- No style encapsulation

### ✅ Gained: Simplicity
- ✅ All bundled CSS works immediately
- ✅ No need to fetch/inject CSS at runtime
- ✅ Better performance (no extra fetch)
- ✅ Works with webpack's CSS processing

---

## 🔧 If You Need CSS Isolation

If you must use Shadow DOM (for style encapsulation), you need to:

### Option 1: Import CSS as Text in Lit

```javascript
import { unsafeCSS } from 'lit';
import stylesText from './styles/styles.css?inline';
import cardsCSS from './blocks/cards/cards.css?inline';
// ... all other block CSS

class AEMSites extends LitElement {
  static styles = [
    css`:host { display: block; }`,
    unsafeCSS(stylesText),
    unsafeCSS(cardsCSS),
    // ... all block styles
  ];
  
  // Remove createRenderRoot() to use Shadow DOM
}
```

**Webpack config needed:**
```javascript
{
  test: /\.css$/,
  oneOf: [
    {
      resourceQuery: /inline/,
      type: 'asset/source', // Import as text
    },
    // ... regular CSS rules
  ],
}
```

### Option 2: Constructable Stylesheets

```javascript
async connectedCallback() {
  super.connectedCallback();
  
  // Fetch bundled CSS
  const response = await fetch('/path/to/bundle-styles.css');
  const cssText = await response.text();
  
  // Inject into Shadow DOM
  const sheet = new CSSStyleSheet();
  await sheet.replace(cssText);
  this.shadowRoot.adoptedStyleSheets = [sheet];
}
```

---

## 📊 Comparison

| Approach | Isolation | Complexity | Performance | Bundle Size |
|----------|-----------|------------|-------------|-------------|
| **Light DOM (current)** | ❌ None | ✅ Simple | ✅ Best | ✅ Small |
| Lit `static styles` | ✅ Full | ⚠️ Medium | ✅ Good | ⚠️ Large |
| Constructable Sheets | ✅ Full | ⚠️ Medium | ⚠️ Extra fetch | ✅ Small |

---

## 🎯 Recommendation

**For this project: Light DOM (current approach) is best** because:

1. ✅ Web component is meant to be used in controlled environments
2. ✅ Style conflicts unlikely (AEM blocks use specific class names)
3. ✅ Simpler maintenance
4. ✅ Better performance
5. ✅ Works with existing webpack setup

If you need isolation later, implement Option 1 (Lit static styles with inline imports).

---

## ✅ Testing

After the fix, verify:

1. **Build the bundle:**
   ```bash
   npm run build
   ```

2. **Check CSS is in bundle:**
   ```bash
   # In build/release/
   cat styles.css | grep "accordion"  # Should see accordion styles
   ```

3. **Use in app:**
   ```html
   <link rel="stylesheet" href="/path/to/styles.css">
   <script src="/path/to/bundle.js"></script>
   <aem-sites path="https://site.aem.page/content.plain.html"></aem-sites>
   ```

4. **Verify styling:**
   - Open browser dev tools
   - Inspect `<aem-sites>` element
   - Should NOT see `#shadow-root`
   - CSS should apply to all blocks
