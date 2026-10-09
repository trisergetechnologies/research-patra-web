import { BLOG_DESCRIPTION, BLOG_NAME, BLOG_URL, SITE_NAME, SITE_URL, abs, siteAbs } from './site';
import { SITE as CONTACT } from './contact';

const ORG_ID = `${SITE_URL}/#organization`;
const BLOG_ID = `${BLOG_URL}#blog`;

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: siteAbs('/favicon.svg'),
    email: CONTACT.email,
    telephone: CONTACT.phone,
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': BLOG_ID,
    name: BLOG_NAME,
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${abs('/search')}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function personLd(author) {
  return {
    '@type': 'Person',
    name: author.name,
    ...(author.slug ? { url: abs(`/author/${author.slug}`) } : {}),
    ...(author.role ? { jobTitle: author.role } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.avatar ? { image: author.avatar } : {}),
    ...(author.credentials ? { hasCredential: author.credentials } : {}),
    ...(author.expertise?.length ? { knowsAbout: author.expertise } : {}),
    ...(Object.values(author.links || {}).some(Boolean) ? { sameAs: Object.values(author.links).filter(Boolean) } : {}),
    worksFor: { '@id': ORG_ID },
  };
}

export function blogPostingLd(post, { url, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: post.title.slice(0, 110),
    description: post.seo.metaDescription || post.excerpt,
    image: [image],
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt || post.publishedAt,
    author: personLd(post.author),
    ...(post.reviewedBy ? { reviewedBy: personLd(post.reviewedBy) } : {}),
    publisher: { '@id': ORG_ID },
    isPartOf:
      post.series?.parts.length > 1 ? [{ '@id': BLOG_ID }, { '@type': 'CreativeWorkSeries', name: post.series.name }] : { '@id': BLOG_ID },
    articleSection: post.category.name,
    keywords: post.tags.map((t) => t.name).join(', '),
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: 'en',
  };
}

export function collectionLd({ name, description, url, posts }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: { '@id': BLOG_ID },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/${p.slug}`), name: p.title })),
    },
  };
}

export function profileLd(author) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: abs(`/author/${author.slug}`),
    mainEntity: personLd(author),
  };
}

export const DEFAULT_OG_IMAGE = { url: abs('/og/site'), width: 1200, height: 630, alt: BLOG_NAME };

/** Next replaces `alternates` per page instead of merging, so every page re-adds the RSS link. */
export function alternatesFor(canonical) {
  return { canonical, types: { 'application/rss+xml': [{ url: abs('/feed.xml'), title: BLOG_NAME }] } };
}

/** Shared metadata for list-style pages. `path` is relative to /blog. Next replaces (not merges) openGraph, so images are always set. */
export function listMetadata({ title, description, path, noindex = false, images = [DEFAULT_OG_IMAGE] }) {
  const url = abs(path);
  return {
    title,
    description,
    alternates: alternatesFor(url),
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_IN', url, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map((i) => i.url || i) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
