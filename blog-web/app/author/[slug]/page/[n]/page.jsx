import { notFound, permanentRedirect } from 'next/navigation';
import { AuthorListing, authorMetadata } from '@/lib/listings';
import { parsePageParam } from '@/lib/format';

export const revalidate = 3600;

// Rendered on first request, then cached and revalidated like the statically built pages.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, n } = await params;
  const page = parsePageParam(n);
  return page ? authorMetadata(slug, page) : {};
}

export default async function AuthorPagedPage({ params }) {
  const { slug, n } = await params;
  if (n === '1') permanentRedirect(`/author/${slug}`);
  const page = parsePageParam(n);
  if (!page) notFound();
  return <AuthorListing slug={slug} page={page} />;
}
