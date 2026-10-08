import sanitizeHtml from 'sanitize-html';

// Same allowlist as blog-web/lib/content.js; the blog sanitizes again on render.
const OPTIONS = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'br', 'hr', 'blockquote', 'cite', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'a', 'code', 'pre', 'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'aside', 'span', 'mark', 'abbr',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'width', 'height', 'title'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    abbr: ['title'],
    aside: ['class'],
    ol: ['start'],
  },
  allowedClasses: { aside: ['j-note'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  transformTags: { h1: 'h2', h5: 'h4', h6: 'h4' },
  // Inline images must come through the media library, never hot-linked from elsewhere.
  exclusiveFilter: (frame) => frame.tag === 'img' && !String(frame.attribs.src || '').startsWith('https://res.cloudinary.com/'),
};

export const sanitizePostHtml = (html) => sanitizeHtml(html || '', OPTIONS);

export function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

export function readingTime(html) {
  const words = stripTags(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
