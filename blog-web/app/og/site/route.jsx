import { ogCard } from '@/lib/ogCard';

export const dynamic = 'force-static';

export function GET() {
  return ogCard({
    eyebrow: 'Guides for scholars',
    title: 'Thesis writing, research proposals, data analysis and publishing',
    footer: 'Practical, ethical advice',
  });
}
