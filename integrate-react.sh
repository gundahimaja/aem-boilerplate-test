#!/bin/bash

# AEM Sites Web Component - React Integration Helper
# This script helps you integrate the web component into your React app

echo "🚀 AEM Sites Web Component - React Integration"
echo "=============================================="
echo ""

# Check if a React app path is provided
if [ -z "$1" ]; then
  echo "Usage: ./integrate-react.sh /path/to/your-react-app"
  echo ""
  echo "Example:"
  echo "  ./integrate-react.sh ~/projects/my-react-app"
  exit 1
fi

REACT_APP_PATH="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build/release"

# Verify React app exists
if [ ! -d "$REACT_APP_PATH" ]; then
  echo "❌ Error: React app directory not found: $REACT_APP_PATH"
  exit 1
fi

if [ ! -f "$REACT_APP_PATH/package.json" ]; then
  echo "❌ Error: Not a valid React app (package.json not found)"
  exit 1
fi

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "📦 Building web component first..."
  npm run build
  
  if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Error: Build failed"
    exit 1
  fi
fi

echo "✅ Found React app at: $REACT_APP_PATH"
echo ""

# Create public directory if it doesn't exist
mkdir -p "$REACT_APP_PATH/public"

# Copy files
echo "📋 Copying web component files..."
cp "$BUILD_DIR/bundle.js" "$REACT_APP_PATH/public/aem-sites-component.js"
cp "$BUILD_DIR/styles.css" "$REACT_APP_PATH/public/aem-sites-component.css"

echo "✅ Copied bundle.js → public/aem-sites-component.js"
echo "✅ Copied styles.css → public/aem-sites-component.css"
echo ""

# Create components directory if it doesn't exist
mkdir -p "$REACT_APP_PATH/src/components"

# Create the React wrapper component if it doesn't exist
COMPONENT_FILE="$REACT_APP_PATH/src/components/AEMSites.jsx"
if [ ! -f "$COMPONENT_FILE" ]; then
  echo "📝 Creating React wrapper component..."
  cat > "$COMPONENT_FILE" << 'EOF'
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
EOF
  echo "✅ Created: src/components/AEMSites.jsx"
else
  echo "⚠️  Component already exists: src/components/AEMSites.jsx (skipped)"
fi
echo ""

# Check and update index.html
INDEX_HTML="$REACT_APP_PATH/public/index.html"
if [ -f "$INDEX_HTML" ]; then
  if ! grep -q "aem-sites-component" "$INDEX_HTML"; then
    echo "⚠️  Manual step required:"
    echo "   Update $INDEX_HTML to include:"
    echo ""
    echo "   In <head>:"
    echo "     <link rel=\"stylesheet\" href=\"%PUBLIC_URL%/aem-sites-component.css\">"
    echo ""
    echo "   Before </body>:"
    echo "     <script src=\"%PUBLIC_URL%/aem-sites-component.js\"></script>"
    echo ""
  else
    echo "✅ index.html already includes aem-sites-component"
  fi
fi

echo ""
echo "✨ Integration complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Update your public/index.html (if not done)"
echo "   2. Import the component: import AEMSites from './components/AEMSites';"
echo "   3. Use it: <AEMSites path=\"https://your-aem-site.aem.page/fragment.plain.html\" />"
echo ""
echo "📖 See REACT_INTEGRATION.md for detailed documentation"
echo ""
