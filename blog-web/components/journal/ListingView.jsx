import Link from 'next/link';
import Cover from './Cover';
import Pager from './Pager';
import PostGrid from './PostGrid';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import { TrendingList } from './Picks';
import { Byline, Meta, PostCard } from './PostBits';

function Hero({ featured, trending }) {
  return (
    <section className="j-hero" aria-label="Featured">
      <article className="j-feature">
        <Cover post={featured} sizes="(max-width: 900px) 100vw, 700px" preload />
        <Meta post={featured}>
          <span className="j-badge">Featured</span>
        </Meta>
        <h2>
          <Link href={`/${featured.slug}`}>{featured.title}</Link>
        </h2>
        <p className="j-dek">{featured.excerpt}</p>
        <Byline post={featured} />
      </article>

      {trending.length > 0 && (
        <aside className="j-trend">
          <h3>
            Trending now <span>Most read</span>
          </h3>
          <TrendingList items={trending} count={4} />
        </aside>
      )}
    </section>
  );
}

/**
 * Shared layout for the home, category, tag, author and search pages.
 * `masthead` is the page's own <h1> block; `pills` are removable-filter links shown above the grid.
 * `query` is the list's filter (category, tag, q…) so "Load more" fetches the same list.
 */
export default function ListingView({
  masthead,
  hero,
  label,
  pills = [],
  posts,
  page,
  totalPages,
  hrefFor,
  query = {},
  categories,
  tags,
  activeCategory,
  activeTag,
  q,
  sort,
  emptyTitle = 'No articles here yet',
  emptyText = 'Try a different keyword or browse all topics.',
}) {
  const totalCount = categories.reduce((n, c) => n + c.count, 0);

  return (
    <div className="rpj">
      <div className="j-container j-fade">
        {masthead}
        {hero && <Hero featured={hero.featured} trending={hero.trending} />}

        <Toolbar categories={categories} totalCount={totalCount} activeCategory={activeCategory} q={q} sort={sort} />

        <div className="j-layout">
          <div>
            <div className="j-status">
              <strong>{label}</strong>
              {pills.map((p) => (
                <Link key={p.href + p.text} href={p.href} className="j-pill" aria-label={`Remove ${p.text} filter`}>
                  {p.text} &times;
                </Link>
              ))}
            </div>

            {posts.length ? (
              <PostGrid
                initialSlugs={posts.map((p) => p.slug)}
                page={page}
                totalPages={totalPages}
                query={query}
                pager={<Pager current={page} total={totalPages} hrefFor={hrefFor} />}
              >
                {posts.map((p) => <PostCard key={p.slug} post={p} />)}
              </PostGrid>
            ) : (
              <div className="j-grid">
                <div className="j-empty">
                  <h3>{emptyTitle}</h3>
                  <p>{emptyText}</p>
                  <Link href="/" className="j-btn j-ghost">Browse all articles</Link>
                </div>
              </div>
            )}
          </div>

          <Sidebar categories={categories} tags={tags} activeCategory={activeCategory} activeTag={activeTag} />
        </div>
      </div>
    </div>
  );
}

export function Masthead({ eyebrow, title, lede, children }) {
  return (
    <section className="j-masthead">
      <p className="j-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lede && <p className="j-lede">{lede}</p>}
      {children}
    </section>
  );
}
