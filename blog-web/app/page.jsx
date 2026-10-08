import { HomeListing, homeMetadata } from '@/lib/listings';

export const revalidate = 3600;

export function generateMetadata() {
  return homeMetadata(1);
}

export default function BlogHome() {
  return <HomeListing page={1} />;
}
