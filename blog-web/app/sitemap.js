import { getSitemapData, getTags } from '@/lib/api';
import { abs } from '@/lib/site';

export const revalidate = 3600;

// Served at /blog/sitemap.xml and referenced from the main site's robots.txt.
// The backend's /public/sitemap must only list published, indexable posts.
export default async function sitemap() {
  const [data, tags] = await Promise.all([getSitemapData(), getTags()]);
  const latest = data.posts.reduce((max, p) => (p.updatedAt > max ? p.updatedAt : max), '');
  const lastModified = latest ? new Date(latest) : new Date();

  return [
    { url: abs('/'), lastModified, changeFrequency: 'daily', priority: 1 },
    ...data.posts.map((p) => ({
      url: abs(`/${p.slug}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
    ...data.categories.map((c) => ({ url: abs(`/category/${c.slug}`), lastModified, changeFrequency: 'weekly', priority: 0.6 })),
    ...data.authors.map((a) => ({ url: abs(`/author/${a.slug}`), changeFrequency: 'monthly', priority: 0.4 })),
    // Single-post tags are noindex (see tagMetadata), so they stay out of the sitemap too.
    ...tags.filter((t) => t.count >= 2).map((t) => ({ url: abs(`/tag/${t.slug}`), changeFrequency: 'weekly', priority: 0.3 })),
  ];
}
