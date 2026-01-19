export async function customFetch({ resource, withCacheRules }) {
  const options = {};
  if (withCacheRules) {
    const params = new URLSearchParams(window.location.search);
    options.cache = params.get('cache') === 'off' ? 'reload' : 'default';
  }

  const baseUrl = new URL(resource);
  // HACK: Adding a forced cache bust to avoid cache issues
  baseUrl.searchParams.set('cb', new Date().getTime());
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
}

export default customFetch;
