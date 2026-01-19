/**
 * AEM Sites Web Component Type Definitions
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'aem-sites': AEMSitesElement;
    }
  }
}

export interface AEMSitesElement extends HTMLElement {
  /**
   * URL to the AEM fragment (.plain.html)
   */
  path: string;
  
  /**
   * Enable debug mode (Meta key + hover overlay)
   * @default "true"
   */
  debug?: 'true' | 'false';
}

/**
 * Custom events dispatched by the aem-sites component
 */
export interface AEMSitesEvents {
  'aem:load': CustomEvent<{ path: string }>;
  'aem:error': CustomEvent<{ error: Error; path: string }>;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'aem-sites': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          path: string;
          debug?: string;
        },
        HTMLElement
      >;
    }
  }
}

export {};
