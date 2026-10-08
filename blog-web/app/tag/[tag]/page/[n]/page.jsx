import { notFound, permanentRedirect } from 'next/navigation';
import { TagListing, tagMetadata } from '@/lib/listings';
import { parsePageParam } from '@/lib/format';

export const revalidate = 3600;

// Rendered on first request, then cached and revalidated like the statically built pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { tag, n } = await params;
  const page = parsePageParam(n);
  return page ? tagMetadata(tag, page) : {};
}

export default async function TagPagedPage({ params }) {
  const { tag, n } = await params;
  if (n === '1') permanentRedirect(`/tag/${tag}`);
  const page = parsePageParam(n);
  if (!page) notFound();
  return <TagListing slug={tag} page={page} />;
}
