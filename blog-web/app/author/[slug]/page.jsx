import { AuthorListing, authorMetadata } from '@/lib/listings';
import { staticParams } from '@/lib/staticParams';

export const revalidate = 3600;

export function generateStaticParams() {
  return staticParams('authors');
}

export async function generateMetadata({ params }) {
  return authorMetadata((await params).slug);
}

export default async function AuthorPage({ params }) {
  const { slug } = await params;
  return <AuthorListing slug={slug} />;
}
