import Link from 'next/link';
import Cover from '@/components/journal/Cover';
import ShareRow from '@/components/journal/ShareRow';
import { ArticleByline, Meta } from '@/components/journal/PostBits';
import { ConsultButton, ReadingProgress, Toc, Vote } from '@/components/journal/ArticleIslands';
import ProseEnhancer from '@/components/journal/ProseEnhancer';
import AuthorCard from '@/components/journal/AuthorCard';
import Newsletter from '@/components/journal/Newsletter';
import { SeriesBox, SeriesNext } from '@/components/journal/SeriesBox';
import { RelatedGrid } from '@/components/journal/Picks';
import { BLOG_TITLE } from '@/lib/site';
import { ctaFor } from '@/lib/cta';

/** The full article layout. The live page and the private preview both render this, so they always match. */
export default function ArticleView({ post, url, related = [], newer = null, older = null, before = null, preview = false }) {
  const categoryHref = `/category/${post.category.slug}`;
  const cta = ctaFor(post.category);

  return (
    <div className="rpj">
      {before}
      <ReadingProgress targetId="article-body" />

      <article className="j-fade">
        <div className="j-container">
          <nav className="j-crumbs" aria-label="Breadcrumb">
            <Link href="/">{BLOG_TITLE}</Link>
            <span aria-hidden="true">/</span>
            <Link href={categoryHref}>{post.category.name}</Link>
          </nav>

          <header className="j-post-head">
            <Meta post={post} linkCategory />
            <h1>{post.title}</h1>
            <p className="j-dek">{post.excerpt}</p>
            <div className="j-byline">
              <ArticleByline post={post} />
              <ShareRow slug={post.slug} url={url} title={post.title} />
            </div>
          </header>

          <Cover post={post} className="j-post-cover" sizes="(max-width: 1200px) 100vw, 1150px" preload />

          <div className="j-post-grid">
            <aside className="j-rail" aria-label="Contents">
              {post.toc.length > 0 && (
                <>
                  <h4>In this article</h4>
                  <Toc items={post.toc} />
                </>
              )}
            </aside>

            <div className="j-post-body">
              {post.toc.length > 0 && (
                <details className="j-toc-m">
                  <summary>In this article</summary>
                  <Toc items={post.toc} />
                </details>
              )}

              {post.series && <SeriesBox series={post.series} slug={post.slug} />}

              {post.keyTakeaways.length > 0 && (
                <section className="j-takeaways" aria-label="Key takeaways">
                  <h4>Key takeaways</h4>
                  <ul>{post.keyTakeaways.map((k) => <li key={k}>{k}</li>)}</ul>
                </section>
              )}

              <div id="article-body" className="j-prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
              <ProseEnhancer targetId="article-body" slug={preview ? null : post.slug} />

              <div className="j-post-foot">
                {post.series && <SeriesNext series={post.series} slug={post.slug} />}

                {post.tags.length > 0 && (
                  <div className="j-tags">
                    {post.tags.map((t) => (
                      <Link key={t.slug} className="j-tag" href={`/tag/${t.slug}`} rel="tag">#{t.name}</Link>
                    ))}
                  </div>
                )}

                <div className="j-row-b">
                  <Vote slug={preview ? null : post.slug} />
                  <ShareRow slug={post.slug} url={url} title={post.title} />
                </div>

                <AuthorCard author={post.author} />

                {!preview && <Newsletter variant="article" source={`article:${post.slug}`.slice(0, 80)} />}

                <div className="j-cta">
                  <p className="j-eyebrow">{cta.eyebrow}</p>
                  <h3>{cta.title}</h3>
                  <p>{cta.body}</p>
                  <ConsultButton />
                </div>

                {(newer || older) && (
                  <nav className="j-pn" aria-label="More articles">
                    {newer && (
                      <Link href={`/${newer.slug}`}>
                        <span>&larr; Newer</span>
                        <b>{newer.title}</b>
                      </Link>
                    )}
                    {older && (
                      <Link href={`/${older.slug}`} className="j-older">
                        <span>Older &rarr;</span>
                        <b>{older.title}</b>
                      </Link>
                    )}
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="j-related" aria-labelledby="keep-reading">
            <div className="j-container">
              <h2 id="keep-reading">Keep reading</h2>
              <RelatedGrid items={related} count={3} seedKey={post.slug} />
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
