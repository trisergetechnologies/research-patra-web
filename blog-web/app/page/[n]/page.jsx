import { notFound, permanentRedirect } from 'next/navigation';
import { HomeListing, homeMetadata } from '@/lib/listings';
import { parsePageParam } from '@/lib/format';
import { abs } from '@/lib/site';

export const revalidate = 3600;

// Rendered on first request, then cached and revalidated like the statically built pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const page = parsePageParam((await params).n);
  return page ? homeMetadata(page) : {};
}

export default async function BlogPage({ params }) {
  const { n } = await params;
  // Absolute, because permanentRedirect('/') resolves to "/blog/" and costs an extra trailing-slash hop.
  if (n === '1') permanentRedirect(abs('/'));
  const page = parsePageParam(n);
  if (!page) notFound();
  return <HomeListing page={page} />;
}
