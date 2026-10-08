import sanitizeHtml from 'sanitize-html';
import { SITE_URL } from './site';

export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };

export function stripTags(html) {
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&(#39|[a-z]+);/g, (m, e) => ENTITIES[e] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

const SANITIZE_OPTIONS = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'br', 'hr', 'blockquote', 'cite', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'a', 'code', 'pre', 'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'aside', 'span', 'mark', 'abbr',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'rel', 'target'],
    img: ['src', 'alt', 'width', 'height', 'title', 'loading', 'decoding'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    abbr: ['title'],
    aside: ['class'],
    ol: ['start'],
  },
  allowedClasses: { aside: ['j-note'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https', 'http', 'data'] },
  // The page already has an <h1>; demote any stray ones from the editor.
  transformTags: {
    h1: 'h2',
    h5: 'h4',
    h6: 'h4',
    a: (tagName, attribs) => {
      const href = attribs.href || '';
      const external = /^https?:\/\//i.test(href) && !href.startsWith(SITE_URL);
      if (!external) return { tagName, attribs: { href, ...(attribs.title ? { title: attribs.title } : {}) } };
      return { tagName, attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy', decoding: 'async' } }),
  },
};

const REF_HEADING = /^\s*(references|sources|bibliography|works cited)\s*$/i;
const URL_RE = /\bhttps?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;
const escAttr = (s) => s.replace(/&(?!amp;)/g, '&amp;').replace(/"/g, '&quot;');

/** Replaces text outside tags (and outside links/code) using `fn`. */
function mapText(html, fn) {
  let skip = 0;
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith('<')) {
        const m = /^<(\/?)(a|code|pre)\b/i.exec(part);
        if (m) skip += m[1] ? -1 : 1;
        return part;
      }
      return skip > 0 ? part : fn(part);
    })
    .join('');
}

/**
 * Writers cite with "[n]" and a numbered list under a "References" heading (the editor's Cite button does both).
 * Markers become linked superscripts, list items get ids, back-links and clickable URLs. Only numbers that exist in the
 * list are linked, so a stray "[3]" in prose stays plain text.
 */
function linkCitations(html) {
  const heads = [...html.matchAll(/<h2>([\s\S]*?)<\/h2>/g)];
  const head = heads.find((h) => REF_HEADING.test(stripTags(h[1])));
  if (!head) return html;
  const afterHead = head.index + head[0].length;
  const nextH2 = html.indexOf('<h2', afterHead);
  const olAt = html.slice(afterHead, nextH2 === -1 ? undefined : nextH2).search(/<ol[\s>]/);
  if (olAt === -1) return html;
  const olStart = afterHead + olAt;
  const olEnd = html.indexOf('</ol>', olStart);
  if (olEnd === -1) return html;

  const olHtml = html.slice(olStart, olEnd + 5);
  const first = Number.parseInt(/<ol[^>]*\bstart="(\d+)"/.exec(olHtml)?.[1] ?? '1', 10);
  const known = new Set();
  let n = first - 1;
  olHtml.replace(/<li>/g, () => known.add(++n));
  if (!known.size) return html;

  const seen = new Map();
  const body = mapText(html.slice(0, head.index), (t) =>
    t.replace(/\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\]/g, (match, nums) => {
      const ids = nums.split(',').map((x) => Number.parseInt(x, 10));
      if (!ids.every((i) => known.has(i))) return match;
      const links = ids.map((i) => {
        const k = (seen.get(i) || 0) + 1;
        seen.set(i, k);
        const id = k === 1 ? `cite-${i}` : `cite-${i}-${k}`;
        return `<a href="#ref-${i}" id="${id}" class="j-ref" data-ref="${i}" aria-label="Source ${i}">${i}</a>`;
      });
      return `<sup class="j-cite">[${links.join(', ')}]</sup>`;
    })
  );

  n = first - 1;
  const list = olHtml
    .replace(/^<ol/, '<ol class="j-refs"')
    .replace(/<li>([\s\S]*?)<\/li>/g, (_, inner) => {
      n += 1;
      const linked = mapText(inner, (t) => t.replace(URL_RE, (u) => `<a href="${escAttr(u)}" target="_blank" rel="noopener noreferrer">${u}</a>`));
      if (!seen.has(n)) return `<li id="ref-${n}">${linked}</li>`;
      const back = ` <a class="j-backref" href="#cite-${n}" aria-label="Back to citation ${n}">&#8617;</a>`;
      const withBack = /<\/p>\s*$/.test(linked) ? linked.replace(/<\/p>\s*$/, `${back}</p>`) : linked + back;
      return `<li id="ref-${n}">${withBack}</li>`;
    });
  return body + html.slice(head.index, olStart) + list + html.slice(olEnd + 5);
}

/**
 * Sanitizes CMS HTML and builds the table of contents.
 * h2/h3 get stable slug ids and a hover anchor link; tables get a scroll wrapper so they never break the layout on phones.
 */
export function processHtml(rawHtml = '') {
  const clean = linkCitations(sanitizeHtml(rawHtml, SANITIZE_OPTIONS));
  const toc = [];
  const used = new Map();

  let html = clean.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_, tag, inner) => {
    const text = stripTags(inner);
    if (!text) return '';
    const base = slugify(text) || 'section';
    const n = used.get(base) || 0;
    used.set(base, n + 1);
    const id = n ? `${base}-${n + 1}` : base;
    toc.push({ id, text, level: tag === 'h2' ? 2 : 3 });
    return `<${tag} id="${id}">${inner}<a class="j-anchor" href="#${id}" aria-label="Link to this section">#</a></${tag}>`;
  });

  html = html.replace(/<table>/g, '<div class="j-tw"><table>').replace(/<\/table>/g, '</table></div>');
  return { html, toc };
}

export function estimateReadingTime(html) {
  const words = stripTags(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
