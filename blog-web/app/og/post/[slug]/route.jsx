import { getPost } from '@/lib/api';
import { ogCard } from '@/lib/ogCard';
import { staticParams } from '@/lib/staticParams';

export const revalidate = 3600;

export function generateStaticParams() {
  return staticParams('posts');
}

export async function GET(_req, { params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.redirectTo) return new Response('Not found', { status: 404 });
  return ogCard({
    eyebrow: post.category.name,
    title: post.title,
    footer: `${post.author.name} · ${post.readingTime} min read`,
    from: post.category.color.from,
    to: post.category.color.to,
  });
}
