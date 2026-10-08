import { getPosts } from '@/lib/api';
import { BLOG_DESCRIPTION, BLOG_NAME, BLOG_URL, abs } from '@/lib/site';

export const revalidate = 3600;

const xml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
  const { items } = await getPosts({ page: 1, limit: 30 });
  const lastBuild = items[0]?.updatedAt ? new Date(items[0].updatedAt) : new Date();

  const entries = items
    .map((p) => {
      const url = abs(`/${p.slug}`);
      return `    <item>
      <title>${xml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${xml(p.excerpt)}</description>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <dc:creator>${xml(p.author.name)}</dc:creator>
      <category>${xml(p.category.name)}</category>
    </item>`;
    })
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(BLOG_NAME)}</title>
    <link>${BLOG_URL}</link>
    <description>${xml(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${abs('/feed.xml')}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
