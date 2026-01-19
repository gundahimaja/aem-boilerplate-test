export async function customFetch({ resource, withCacheRules }) {
  const options = {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  };
  
  if (withCacheRules) {
    const params = new URLSearchParams(window.location.search);
    options.cache = params.get('cache') === 'off' ? 'reload' : 'default';
  }

  const baseUrl = new URL(resource);
  // HACK: Adding a forced cache bust to avoid cache issues
  baseUrl.searchParams.set('cb', new Date().getTime());
  
  try {
    const response = await fetch(baseUrl.toString(), options);
    if (!resource.endsWith('.plain.html')) {
      return response;
    }

    const html = await response.text();
    const processedHtml = html.replace(
      /(href|src|srcset)="(\.\/[^"\s]*|\.\.\/[^"\s]*|[^"/][^"\s]*)"/g,
      (match, attr, path) => {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
          return match;
        }
        if (attr === 'srcset') {
          return `srcset="${path
            .split(',')
            .map((url) => {
              const [urlPart, size] = url.trim().split(' ');
              if (urlPart.startsWith('http') || urlPart.startsWith('//') || urlPart.startsWith('data:')) {
                return url;
              }
              return `${new URL(urlPart, baseUrl).href}${size ? ` ${size}` : ''}`;
            })
            .join(', ')}"`;
        }
        return `${attr}="${new URL(path, baseUrl).href}"`;
      },
    );
    return new Response(processedHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('[customFetch] CORS or network error:', error);
    console.log('[customFetch] Trying no-cors mode as fallback...');
    
    // Fallback: try with no-cors mode
    try {
      const noCorsOptions = { ...options, mode: 'no-cors' };
      const response = await fetch(baseUrl.toString(), noCorsOptions);
      // Note: no-cors mode returns opaque response, we can't read the body
      return response;
    } catch (fallbackError) {
      console.error('[customFetch] Fallback also failed:', fallbackError);
      throw error; // Throw original error
    }
  }
}

export default customFetch;
