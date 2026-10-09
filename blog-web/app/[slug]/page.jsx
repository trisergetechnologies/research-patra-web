import { notFound, permanentRedirect } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import ArticleView from '@/components/journal/ArticleView';
import { ViewPing } from '@/components/journal/ArticleIslands';
import { getAdjacentPosts, getPost, getRelatedPosts } from '@/lib/api';
import { alternatesFor, blogPostingLd, breadcrumbLd } from '@/lib/seo';
import { staticParams } from '@/lib/staticParams';
import { BLOG_TITLE, POOL_SIZE, SITE_NAME, abs } from '@/lib/site';

export const revalidate = 3600;

export function generateStaticParams() {
  return staticParams('posts');
}

function ogImageFor(post) {
  if (post.seo.ogImage) return { url: post.seo.ogImage, alt: post.title };
  if (post.coverImage) {
    const { url, width, height, alt } = post.coverImage;
    return { url, alt: alt || post.title, ...(width && height ? { width, height } : {}) };
  }
  return { url: abs(`/og/post/${post.slug}`), width: 1200, height: 630, alt: post.title };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Page Not Found', robots: { index: false, follow: true } };
  if (post.redirectTo) return {};

  const url = post.seo.canonical || abs(`/${post.slug}`);
  const title = post.seo.metaTitle || post.title;
  const description = post.seo.metaDescription || post.excerpt;
  const image = ogImageFor(post);

  return {
    title,
    description,
    authors: [{ name: post.author.name, ...(post.author.slug ? { url: abs(`/author/${post.author.slug}`) } : {}) }],
    keywords: post.tags.map((t) => t.name),
    category: post.category.name,
    alternates: alternatesFor(url),
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      locale: 'en_IN',
      url,
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      ...(post.author.slug ? { authors: [abs(`/author/${post.author.slug}`)] } : {}),
      section: post.category.name,
      tags: post.tags.map((t) => t.name),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
    ...(post.seo.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  if (post.redirectTo) permanentRedirect(`/${post.redirectTo}`);

  const [related, { newer, older }] = await Promise.all([getRelatedPosts(post.slug, POOL_SIZE), getAdjacentPosts(post.slug)]);
  const url = post.seo.canonical || abs(`/${post.slug}`);

  return (
    <ArticleView
      post={post}
      url={url}
      related={related}
      newer={newer}
      older={older}
      before={
        <>
          <JsonLd
            data={[
              blogPostingLd(post, { url, image: ogImageFor(post).url }),
              breadcrumbLd([
                { name: BLOG_TITLE, url: abs('/') },
                { name: post.category.name, url: abs(`/category/${post.category.slug}`) },
                { name: post.title, url },
              ]),
            ]}
          />
          <ViewPing slug={post.slug} />
        </>
      }
    />
  );
}
