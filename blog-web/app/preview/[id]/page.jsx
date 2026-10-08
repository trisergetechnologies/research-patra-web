import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Lock } from 'lucide-react';
import ArticleView from '@/components/journal/ArticleView';
import { getAdjacentPosts, getPosts, getPreviewPost, getRelatedPosts } from '@/lib/api';
import { POOL_SIZE, abs } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Preview',
  robots: { index: false, follow: false, nocache: true },
};

const OBJECT_ID = /^[a-f0-9]{24}$/i;

const STATUS_LABEL = {
  draft: 'Draft',
  in_review: 'In review',
  changes_requested: 'Changes requested',
  published: 'Published',
  archived: 'Archived',
};

const GATE_TEXT = {
  expired: ['Preview expired', 'Previews are private and last 30 minutes. Open it again from the editor.'],
  denied: ['Not available', 'Only the writer of this post and admins can see its preview.'],
  missing: ['Not available', 'This post no longer exists or was moved to the trash.'],
};

function Gate({ id, reason }) {
  const [title, text] = GATE_TEXT[reason] || GATE_TEXT.expired;
  return (
    <div className="bg-surface min-h-[70vh] flex items-center justify-center px-6 py-20 font-sans">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
          <Lock size={22} />
        </div>
        <h1 className="text-2xl font-extrabold text-body mb-2">{title}</h1>
        <p className="text-muted mb-8">{text}</p>
        <a
          href={`/admin/posts/${id}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold"
        >
          Open in editor
        </a>
      </div>
    </div>
  );
}

function PreviewBar({ id, post }) {
  const label = post.isRevision ? 'Pending edits' : STATUS_LABEL[post.status] || 'Draft';
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-full bg-[#0F172A] text-white text-sm shadow-2xl pl-4 pr-1.5 py-1.5 max-w-[calc(100vw-2rem)] font-sans"
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
        <span className="font-semibold shrink-0">Preview</span>
        <span className="text-white/60 truncate">{label} · not visible to readers</span>
      </span>
      <a href={`/admin/posts/${id}`} className="shrink-0 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 font-semibold">
        Back to editor
      </a>
    </div>
  );
}

export default async function PreviewPage({ params }) {
  const { id } = await params;
  if (!OBJECT_ID.test(id)) notFound();

  const session = (await cookies()).get('rp_preview')?.value;
  const { post, error } = await getPreviewPost(id, session);
  if (error) return <Gate id={id} reason={error} />;

  // Same neighbours the live page would show; for unpublished posts, what they will be once published.
  const live = post.status === 'published';
  const [related, adjacent, latest] = await Promise.all([
    live ? getRelatedPosts(post.slug, POOL_SIZE) : getPosts({ category: post.category.slug, limit: POOL_SIZE, exclude: post.slug }).then((r) => r.items),
    live ? getAdjacentPosts(post.slug) : Promise.resolve({ newer: null, older: null }),
    live ? Promise.resolve(null) : getPosts({ limit: 1, exclude: post.slug }).then((r) => r.items[0] || null),
  ]);
  const older = adjacent.older || (latest ? { slug: latest.slug, title: latest.title } : null);

  return (
    <ArticleView
      preview
      post={post}
      url={post.seo.canonical || abs(`/${post.slug}`)}
      related={related}
      newer={adjacent.newer}
      older={older}
      before={<PreviewBar id={id} post={post} />}
    />
  );
}
