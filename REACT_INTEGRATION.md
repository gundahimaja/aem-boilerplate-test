# 🚀 React Integration Guide for AEM Sites Web Component

## Overview

This guide shows you how to integrate the `aem-sites` web component into your React application. The component is built and ready in `build/release/`.

## ✅ Build Complete

Your web component is now available at:
- `build/release/bundle.js` (102 KiB)
- `build/release/styles.css` (6.96 KiB)
- `build/release/index.html` (demo)

---

## 📦 Method 1: Copy Bundle to React Public Folder (Recommended for Quick Start)

### Step 1: Copy Built Files

```bash
# From your aem-boilerplate-test directory
cp build/release/bundle.js /path/to/your-react-app/public/aem-sites-component.js
cp build/release/styles.css /path/to/your-react-app/public/aem-sites-component.css
```

### Step 2: Load in React's index.html

Edit `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
    
    <!-- Add AEM Sites Web Component -->
    <link rel="stylesheet" href="%PUBLIC_URL%/aem-sites-component.css">
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    
    <!-- Load Web Component before React -->
    <script src="%PUBLIC_URL%/aem-sites-component.js"></script>
  </body>
</html>
```

### Step 3: Create React Wrapper Component

Create `src/components/AEMSites.jsx`:

```jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * React wrapper for aem-sites web component
 */
const AEMSites = ({ path, debug = false, onLoad, onError }) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    
    if (!element) return;

    // Wait for custom element to be defined
    if (customElements.get('aem-sites')) {
      if (onLoad) {
        // Monitor for content load
        const observer = new MutationObserver(() => {
          if (element.querySelector('main')) {
            onLoad();
            observer.disconnect();
          }
        });
        
        observer.observe(element, { childList: true, subtree: true });
        
        return () => observer.disconnect();
      }
    } else {
      console.error('aem-sites custom element not defined');
      if (onError) onError(new Error('aem-sites not defined'));
    }
  }, [onLoad, onError]);

  useEffect(() => {
    // Update path when prop changes
    if (ref.current && path) {
      ref.current.setAttribute('path', path);
    }
  }, [path]);

  useEffect(() => {
    // Update debug when prop changes
    if (ref.current) {
      ref.current.setAttribute('debug', debug ? 'true' : 'false');
    }
  }, [debug]);

  return (
    <aem-sites 
      ref={ref}
      path={path}
      debug={debug ? 'true' : 'false'}
    />
  );
};

AEMSites.propTypes = {
  path: PropTypes.string.isRequired,
  debug: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default AEMSites;
```

### Step 4: Use in Your React App

```jsx
// src/App.js
import React, { useState } from 'react';
import AEMSites from './components/AEMSites';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLoad = () => {
    console.log('AEM content loaded!');
    setIsLoading(false);
  };

  const handleError = (error) => {
    console.error('AEM content failed to load:', error);
    setIsLoading(false);
  };

  return (
    <div className="App">
      {/* Header from AEM */}
      <AEMSites
        path="https://main--your-site--your-org.aem.page/fragments/header.plain.html"
        debug={false}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Your React Content */}
      <main className="app-content">
        <h1>My React Application</h1>
        {isLoading && <p>Loading AEM content...</p>}
        <p>This content is from React</p>
      </main>

      {/* Footer from AEM */}
      <AEMSites
        path="https://main--your-site--your-org.aem.page/fragments/footer.plain.html"
        debug={false}
      />
    </div>
  );
}

export default App;
```

### Step 5: Add Styling (Optional)

```css
/* src/App.css */
.App {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Style the web component */
aem-sites {
  display: block;
  width: 100%;
}

/* Loading state */
aem-sites:empty::after {
  content: 'Loading AEM content...';
  display: block;
  padding: 2rem;
  text-align: center;
  color: #666;
}
```

---

## 📦 Method 2: Using with React Hooks (Advanced)

Create a custom hook for better control:

```jsx
// src/hooks/useAEMSites.js
import { useEffect, useState, useRef } from 'react';

export const useAEMSites = (path, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    if (!path) return;

    const checkContent = () => {
      const element = elementRef.current;
      if (!element) return;

      const main = element.querySelector('main');
      if (main) {
        setContent(main);
        setIsLoaded(true);
        if (options.onLoad) options.onLoad(main);
      }
    };

    // Check immediately
    checkContent();

    // Set up observer for content changes
    const observer = new MutationObserver(checkContent);
    
    if (elementRef.current) {
      observer.observe(elementRef.current, {
        childList: true,
        subtree: true,
      });
    }

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        const err = new Error('Timeout loading AEM content');
        setError(err);
        if (options.onError) options.onError(err);
      }
    }, options.timeout || 10000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [path, isLoaded, options]);

  return { elementRef, isLoaded, error, content };
};
```

Usage:

```jsx
// src/components/AEMSection.jsx
import React from 'react';
import { useAEMSites } from '../hooks/useAEMSites';

const AEMSection = ({ path, debug = false }) => {
  const { elementRef, isLoaded, error } = useAEMSites(path, {
    timeout: 5000,
    onLoad: () => console.log('Content loaded'),
    onError: (err) => console.error('Error:', err),
  });

  return (
    <div className="aem-section">
      {!isLoaded && !error && <div className="loading">Loading...</div>}
      {error && <div className="error">Failed to load content</div>}
      <aem-sites 
        ref={elementRef}
        path={path}
        debug={debug ? 'true' : 'false'}
      />
    </div>
  );
};

export default AEMSection;
```

---

## 📦 Method 3: Dynamic Path Loading

For dynamic content based on routing:

```jsx
// src/components/DynamicAEMContent.jsx
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AEMSites from './AEMSites';

const DynamicAEMContent = ({ baseUrl }) => {
  const location = useLocation();
  
  const aemPath = useMemo(() => {
    // Map React routes to AEM fragments
    const routeMap = {
      '/': 'home',
      '/about': 'about',
      '/products': 'products',
      '/contact': 'contact',
    };
    
    const fragment = routeMap[location.pathname] || 'default';
    return `${baseUrl}/fragments/${fragment}.plain.html`;
  }, [location.pathname, baseUrl]);

  return <AEMSites path={aemPath} debug={false} />;
};

export default DynamicAEMContent;
```

Usage in App:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DynamicAEMContent from './components/DynamicAEMContent';

function App() {
  return (
    <Router>
      <DynamicAEMContent 
        baseUrl="https://main--your-site--your-org.aem.page"
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* ... more routes */}
      </Routes>
    </Router>
  );
}
```

---

## 📦 Method 4: TypeScript Support

Create type definitions:

```typescript
// src/types/aem-sites.d.ts
declare namespace JSX {
  interface IntrinsicElements {
    'aem-sites': {
      path: string;
      debug?: string;
      ref?: React.Ref<HTMLElement>;
    };
  }
}

// Component props type
export interface AEMSitesProps {
  path: string;
  debug?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

TypeScript component:

```typescript
// src/components/AEMSites.tsx
import React, { useEffect, useRef } from 'react';
import type { AEMSitesProps } from '../types/aem-sites';

const AEMSites: React.FC<AEMSitesProps> = ({ 
  path, 
  debug = false, 
  onLoad, 
  onError 
}) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!customElements.get('aem-sites')) {
      const error = new Error('aem-sites not defined');
      console.error(error);
      onError?.(error);
      return;
    }

    const observer = new MutationObserver(() => {
      if (element.querySelector('main')) {
        onLoad?.();
        observer.disconnect();
      }
    });

    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [onLoad, onError]);

  return (
    <aem-sites 
      ref={ref}
      path={path}
      debug={debug ? 'true' : 'false'}
    />
  );
};

export default AEMSites;
```

---

## 🎨 Styling Best Practices

### Global Styles

```css
/* src/index.css */

/* Reset for web component */
aem-sites {
  display: block;
  width: 100%;
}

/* Loading skeleton */
aem-sites:not(:defined) {
  display: block;
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Component-Specific Styles

```css
/* Scope styles to specific instances */
.header-wrapper aem-sites {
  border-bottom: 1px solid #eee;
}

.footer-wrapper aem-sites {
  background-color: #f5f5f5;
  padding: 2rem 0;
}
```

---

## 🔧 Configuration & Environment Variables

Create `.env` file in your React app:

```env
# .env
REACT_APP_AEM_BASE_URL=https://main--your-site--your-org.aem.page
REACT_APP_AEM_DEBUG=false
```

Usage:

```jsx
// src/config/aem.js
export const aemConfig = {
  baseUrl: process.env.REACT_APP_AEM_BASE_URL,
  debug: process.env.REACT_APP_AEM_DEBUG === 'true',
  fragments: {
    header: `${process.env.REACT_APP_AEM_BASE_URL}/fragments/header.plain.html`,
    footer: `${process.env.REACT_APP_AEM_BASE_URL}/fragments/footer.plain.html`,
  },
};
```

```jsx
// src/App.js
import { aemConfig } from './config/aem';

function App() {
  return (
    <div>
      <AEMSites 
        path={aemConfig.fragments.header}
        debug={aemConfig.debug}
      />
    </div>
  );
}
```

---

## 🧪 Testing with Jest

Mock the web component for testing:

```javascript
// src/setupTests.js
class MockAEMSites extends HTMLElement {
  constructor() {
    super();
    this._path = '';
  }

  get path() {
    return this._path;
  }

  set path(value) {
    this._path = value;
    this.setAttribute('path', value);
  }

  connectedCallback() {
    // Simulate content load
    setTimeout(() => {
      this.innerHTML = '<main><p>Mock AEM Content</p></main>';
    }, 100);
  }
}

if (!customElements.get('aem-sites')) {
  customElements.define('aem-sites', MockAEMSites);
}
```

Test example:

```javascript
// src/components/__tests__/AEMSites.test.js
import { render, screen, waitFor } from '@testing-library/react';
import AEMSites from '../AEMSites';

describe('AEMSites Component', () => {
  it('renders with path attribute', () => {
    const path = 'https://example.com/fragment.plain.html';
    render(<AEMSites path={path} />);
    
    const element = document.querySelector('aem-sites');
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('path', path);
  });

  it('calls onLoad when content is loaded', async () => {
    const onLoad = jest.fn();
    render(<AEMSites path="https://example.com/test.plain.html" onLoad={onLoad} />);
    
    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled();
    }, { timeout: 200 });
  });
});
```

---

## 🚀 Production Build

### Step 1: Build React App

```bash
cd your-react-app
npm run build
```

### Step 2: Verify Bundle Inclusion

Check that `build/aem-sites-component.js` and `build/aem-sites-component.css` are included.

### Step 3: Deploy

Deploy the entire `build` folder to your hosting service (Vercel, Netlify, AWS, etc.).

---

## 📊 Performance Optimization

### Lazy Loading

```jsx
import React, { lazy, Suspense } from 'react';

const AEMSites = lazy(() => import('./components/AEMSites'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AEMSites path="..." />
    </Suspense>
  );
}
```

### Code Splitting by Route

```jsx
import { lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Only load AEM content when needed
```

---

## 🐛 Troubleshooting

### Issue: "aem-sites not defined"

**Solution**: Ensure the script is loaded before React renders:
```html
<!-- Load BEFORE React scripts -->
<script src="%PUBLIC_URL%/aem-sites-component.js"></script>
```

### Issue: CORS errors

**Solution**: Ensure your AEM server has proper CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

### Issue: Content not updating

**Solution**: Force re-render by using key prop:
```jsx
<AEMSites 
  key={path} 
  path={path} 
/>
```

---

## 📚 Complete Example App

Create a complete working example:

```bash
npx create-react-app aem-react-demo
cd aem-react-demo

# Copy your built web component
cp /Users/gun/Desktop/milo-pocs/aem-boilerplate-test/build/release/bundle.js public/aem-sites-component.js
cp /Users/gun/Desktop/milo-pocs/aem-boilerplate-test/build/release/styles.css public/aem-sites-component.css
```

Then follow the steps above to integrate!

---

## 🎯 Next Steps

1. ✅ Build your web component (`npm run build`)
2. ✅ Copy files to React `public/` folder
3. ✅ Add scripts to `public/index.html`
4. ✅ Create wrapper component
5. ✅ Use in your app
6. ✅ Test and deploy

---

## 📞 Support

For issues or questions:
- Check console for errors
- Verify network requests in DevTools
- Ensure paths are correct
- Test with debug mode enabled

Happy coding! 🚀
