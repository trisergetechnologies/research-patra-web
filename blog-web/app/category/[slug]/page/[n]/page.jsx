import { notFound, permanentRedirect } from 'next/navigation';
import { CategoryListing, categoryMetadata } from '@/lib/listings';
import { parsePageParam } from '@/lib/format';

export const revalidate = 3600;

// Rendered on first request, then cached and revalidated like the statically built pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  return page ? categoryMetadata(slug, page) : {};
}

export default async function CategoryPagedPage({ params }) {
  const { slug, n } = await params;
  if (n === '1') permanentRedirect(`/category/${slug}`);
  const page = parsePageParam(n);
  if (!page) notFound();
  return <CategoryListing slug={slug} page={page} />;
}
