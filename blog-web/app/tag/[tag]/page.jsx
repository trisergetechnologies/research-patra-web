import { TagListing, tagMetadata } from '@/lib/listings';
import { staticParams } from '@/lib/staticParams';

export const revalidate = 3600;

export function generateStaticParams() {
  return staticParams('tags', 'tag');
}

export async function generateMetadata({ params }) {
  return tagMetadata((await params).tag);
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  return <TagListing slug={tag} />;
}
