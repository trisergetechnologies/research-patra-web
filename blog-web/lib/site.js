export const SITE_URL = (process.env.SITE_URL || 'https://researchpatra.com').replace(/\/+$/, '');
export const BASE_PATH = '/blog';
export const BLOG_URL = `${SITE_URL}${BASE_PATH}`;

export const SITE_NAME = 'Research Patra';
export const BLOG_NAME = 'Research Patra Journal';
export const BLOG_TITLE = 'Journal';
export const BLOG_DESCRIPTION =
  'Practical, ethical guides on thesis writing, research proposals, data analysis and publishing from the Research Patra team.';

export const PAGE_SIZE = 9;
export const MAX_PAGE = 50;
export const SORT_KEYS = ['latest', 'popular', 'quick'];
/** Related / trending candidates fetched per page; each visitor sees a few of them (lib/picks.js). */
export const POOL_SIZE = 12;
export const REVALIDATE_SECONDS = 3600;

/** Absolute URL for a path inside the blog, e.g. abs('/my-post') -> https://site.com/blog/my-post */
export function abs(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const p = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `${BLOG_URL}${p}`;
}

/** Absolute URL for a path on the main site. */
export function siteAbs(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
