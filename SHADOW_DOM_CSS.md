# Shadow DOM CSS Solution

## ✅ **The Solution**

All CSS is now bundled **inside Shadow DOM** for full isolation!

---

## 🎯 **How It Works**

### **1. Webpack Configuration**

```javascript
// webpack.config.js
{
  test: /\.css$/,
  oneOf: [
    // CSS with ?inline query → returns as string
    {
      resourceQuery: /inline/,
      type: 'asset/source',
    },
    // Regular CSS → processes normally
    {
      use: ['style-loader', 'css-loader'],
    },
  ],
}
```

**What this does:**
- `import './styles.css'` → Normal processing (injected to page)
- `import './styles.css?inline'` → Returns CSS as string

---

### **2. Collect All CSS**

```javascript
// collect-styles.js
import mainStyles from './styles/styles.css?inline';
import accordionCSS from './blocks/accordion/accordion.css?inline';
// ... all other blocks

export const allStyles = [
  mainStyles,
  accordionCSS,
  // ...
].join('\n\n');
```

**One file** collects all CSS as text.

---

### **3. Inject Into Shadow DOM**

```javascript
// init.js
import { unsafeCSS } from 'lit';
import allStyles from './collect-styles.js';

class AEMSites extends LitElement {
  static styles = [
    css`:host { display: block; }`,
    unsafeCSS(allStyles), // All CSS here!
  ];

  async loadAEMFragment(url) {
    // ...
    this.shadowRoot.appendChild(main); // Shadow DOM
    loadPage(this.shadowRoot);
  }
}
```

**Result:** All CSS bundled into Shadow DOM!

---

## ✅ **Benefits**

### **1. Full CSS Isolation**
```
┌─────────────────────────────────────────┐
│ Parent App                              │
│   <style>                               │
│     .button { color: blue; }            │
│   </style>                              │
└─────────────────────────────────────────┘
                  ↓ No conflict!
┌─────────────────────────────────────────┐
│ <aem-sites>                             │
│   #shadow-root                          │
│     <style>                             │
│       .button { color: red; }           │
│     </style>                            │
│     <main>                              │
│       <button class="button">           │
│         Red button ✅                   │
│       </button>                         │
│     </main>                             │
└─────────────────────────────────────────┘
```

---

### **2. Single Bundle**
```bash
# Build output
build/release/
  ├── bundle.js      # All JS + CSS bundled!
  ├── index.html     # Demo page
  └── bundle.js.map  # Source map
```

**No separate CSS file needed!**

---

### **3. True Web Component**

```html
<!-- Consumer just needs one file -->
<script src="/path/to/bundle.js"></script>
<aem-sites path="https://site.aem.page/content.plain.html"></aem-sites>
```

**No stylesheet link required!** ✅

---

## 📊 **Comparison**

| Approach | Isolation | Files | Conflicts | Maintenance |
|----------|-----------|-------|-----------|-------------|
| **Light DOM** | ❌ None | 2 (JS+CSS) | ⚠️ Possible | Easy |
| **Shadow DOM (current)** | ✅ Full | 1 (JS only) | ✅ None | Easy |
| Shadow DOM + fetch | ✅ Full | 1 (JS only) | ✅ None | Complex |

---

## 🔧 **Adding New Blocks**

When you add a new block:

1. **Add to `collect-styles.js`:**
   ```javascript
   import newBlockCSS from './blocks/new-block/new-block.css?inline';
   
   export const allStyles = [
     mainStyles,
     // ...
     newBlockCSS, // Add here
   ].join('\n\n');
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

**That's it!** CSS automatically bundled into Shadow DOM.

---

## 🚀 **Build & Test**

### **1. Build:**
```bash
cd /Users/gun/Desktop/milo-pocs/aem-boilerplate-test
npm run build
```

### **2. Check output:**
```bash
ls -lh build/release/
# Should see:
# - bundle.js (larger now - includes CSS!)
# - bundle.js.map
# - index.html
```

### **3. Test in browser:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test AEM Sites Component</title>
</head>
<body>
  <h1>My App</h1>
  
  <!-- Just one script tag needed! -->
  <script src="/path/to/bundle.js"></script>
  
  <aem-sites path="https://main--site--user.aem.page/content.plain.html"></aem-sites>
  
  <p>More app content</p>
</body>
</html>
```

### **4. Verify in DevTools:**
- Inspect `<aem-sites>` element
- Should see `#shadow-root`
- Expand shadow root → see `<style>` tag with all CSS
- Check computed styles → all block styles applied ✅

---

## 🎯 **Key Advantages**

### **1. Zero Configuration for Consumers**
```html
<!-- Before (2 files) -->
<link rel="stylesheet" href="/styles.css">
<script src="/bundle.js"></script>

<!-- After (1 file) -->
<script src="/bundle.js"></script>
```

### **2. No Style Pollution**
```javascript
// Parent app styles don't affect component
// Component styles don't leak to parent
// Perfect encapsulation ✅
```

### **3. Portable Component**
```bash
# Ship one file
cp build/release/bundle.js /path/to/consumer/app/
```

### **4. Automatic Updates**
```javascript
// Add new block CSS → auto-included in bundle
// No manual updates to index.html needed
```

---

## 💡 **Pro Tip: Auto-Discovery**

Want to avoid manually listing CSS files? Use webpack's `require.context`:

```javascript
// collect-styles.js
import mainStyles from './styles/styles.css?inline';

// Auto-discover all block CSS
const blockContext = require.context('./blocks', true, /\.css$/);
const blockStyles = blockContext.keys()
  .map(key => blockContext(key).default)
  .join('\n\n');

export const allStyles = [mainStyles, blockStyles].join('\n\n');
```

**Fully automatic!** Webpack finds all CSS files.

---

## ✅ **Summary**

Your web component now:
- ✅ **Bundles all CSS into Shadow DOM**
- ✅ **Full style isolation** from parent app
- ✅ **Single file distribution** (bundle.js)
- ✅ **No manual CSS links** needed
- ✅ **True web component** architecture
- ✅ **Easy maintenance** - add CSS to `collect-styles.js`

This is the **proper way** to build web components! 🎉
