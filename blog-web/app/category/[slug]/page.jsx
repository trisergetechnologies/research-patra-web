import { CategoryListing, categoryMetadata } from '@/lib/listings';
import { staticParams } from '@/lib/staticParams';

export const revalidate = 3600;

export function generateStaticParams() {
  return staticParams('categories');
}

export async function generateMetadata({ params }) {
  return categoryMetadata((await params).slug);
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  return <CategoryListing slug={slug} />;
}
