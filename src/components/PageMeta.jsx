import { useEffect } from 'react';

const SITE_NAME = 'Research Patra';

export default function PageMeta({ title, description, path = '' }) {
  useEffect(() => {
    document.title = title || SITE_NAME;

    const setMeta = (name, content, attr = 'name') => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');

    if (path) {
      const origin = window.location.origin;
      setMeta('og:url', `${origin}${path}`, 'property');
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${origin}${path}`);
    }
  }, [title, description, path]);

  return null;
}
