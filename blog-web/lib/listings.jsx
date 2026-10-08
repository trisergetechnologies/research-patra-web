// Server-side builders for every list page. Route files stay thin: they parse params and call these.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import ListingView, { Masthead } from '@/components/journal/ListingView';
import { Avatar } from '@/components/journal/PostBits';
import { LINK_LABELS as AUTHOR_LINKS } from '@/components/journal/AuthorCard';
import { getAuthor, getCategories, getCategory, getFeaturedPost, getPosts, getTags, getTrendingPosts } from './api';
import { DEFAULT_OG_IMAGE, breadcrumbLd, collectionLd, listMetadata, profileLd } from './seo';
import { BLOG_DESCRIPTION, BLOG_NAME, BLOG_TITLE, POOL_SIZE, SITE_NAME, abs } from './site';

const pageSuffix = (page) => (page > 1 ? `, page ${page}` : '');
const pagedPath = (base, n) => (n > 1 ? `${base === '/' ? '' : base}/page/${n}` : base);

async function sidebarData() {
  const [categories, tags] = await Promise.all([getCategories(), getTags(12)]);
  return { categories, tags };
}

/** 404s past the last page, so only real pages can be indexed. */
function guardPage(page, totalPages) {
  if (page > totalPages) notFound();
}

function crumbs(...items) {
  return breadcrumbLd([{ name: BLOG_TITLE, url: abs('/') }, ...items]);
}

/* ---------- Home ---------- */

export async function homeMetadata(page = 1) {
  if (page === 1) {
    return {
      ...listMetadata({ title: `${BLOG_NAME}: Thesis, Research & Publishing Guides`, description: BLOG_DESCRIPTION, path: '/' }),
      title: { absolute: `${BLOG_NAME}: Thesis, Research & Publishing Guides` },
    };
  }
  return listMetadata({ title: `Latest articles${pageSuffix(page)}`, description: BLOG_DESCRIPTION, path: pagedPath('/', page) });
}

export async function HomeListing({ page = 1 }) {
  const featured = await getFeaturedPost();
  const [list, trending, side] = await Promise.all([
    getPosts({ page, exclude: featured?.slug }),
    page === 1 ? getTrendingPosts(POOL_SIZE, featured?.slug) : [],
    sidebarData(),
  ]);
  guardPage(page, list.totalPages);

  const url = abs(pagedPath('/', page));
  return (
    <>
      <JsonLd data={collectionLd({ name: BLOG_NAME, description: BLOG_DESCRIPTION, url, posts: list.items })} />
      <ListingView
        masthead={
          page === 1 ? (
            <Masthead
              eyebrow="The Research Patra Journal"
              title={<>Guides for scholars who write to be <em>examined</em></>}
              lede="Practical, ethical advice on thesis writing, proposals, data analysis and publishing, from the team that supports researchers worldwide."
            />
          ) : (
            <Masthead eyebrow="The Research Patra Journal" title={`Latest articles${pageSuffix(page)}`} />
          )
        }
        hero={page === 1 && featured ? { featured, trending } : null}
        label="Latest articles"
        posts={list.items}
        page={page}
        totalPages={list.totalPages}
        hrefFor={(n) => pagedPath('/', n)}
        query={{ exclude: featured?.slug }}
        {...side}
      />
    </>
  );
}

/* ---------- Category ---------- */

export async function categoryMetadata(slug, page = 1) {
  const cat = await getCategory(slug);
  if (!cat) return {};
  return listMetadata({
    title: `${cat.name} guides${pageSuffix(page)}`,
    description: cat.description || `Articles on ${cat.name.toLowerCase()} from the ${BLOG_NAME}.`,
    path: pagedPath(`/category/${slug}`, page),
  });
}

export async function CategoryListing({ slug, page = 1 }) {
  const cat = await getCategory(slug);
  if (!cat) notFound();
  const [list, side, popular] = await Promise.all([
    getPosts({ page, category: slug }),
    sidebarData(),
    page === 1 ? getPosts({ category: slug, sort: 'popular', limit: 1 }) : null,
  ]);
  guardPage(page, list.totalPages);
  // A clear first read for newcomers to a topic; pointless when the topic only has a couple of posts.
  const startHere = list.total >= 4 ? popular?.items[0] : null;

  const base = `/category/${slug}`;
  const url = abs(pagedPath(base, page));
  return (
    <>
      <JsonLd data={[
        collectionLd({ name: cat.name, description: cat.description, url, posts: list.items }),
        crumbs({ name: cat.name, url: abs(base) }),
      ]} />
      <ListingView
        masthead={
          <Masthead eyebrow="Topic" title={`${cat.name}${pageSuffix(page)}`} lede={cat.description}>
            {startHere && (
              <Link href={`/${startHere.slug}`} className="j-start">
                <span className="j-eyebrow">New to {cat.name.toLowerCase()}? Start here</span>
                <b>{startHere.title}</b>
                <small>{startHere.readingTime} min read · most read in this topic →</small>
              </Link>
            )}
          </Masthead>
        }
        label={`${list.total} ${list.total === 1 ? 'article' : 'articles'}`}
        pills={[{ text: cat.name, href: '/' }]}
        posts={list.items}
        page={page}
        totalPages={list.totalPages}
        hrefFor={(n) => pagedPath(base, n)}
        query={{ category: slug }}
        activeCategory={slug}
        {...side}
      />
    </>
  );
}

/* ---------- Tag ---------- */

async function findTag(slug) {
  const tags = await getTags();
  return tags.find((t) => t.slug === slug) || null;
}

export async function tagMetadata(slug, page = 1) {
  const tag = await findTag(slug);
  if (!tag) return {};
  return listMetadata({
    title: `#${tag.name} articles${pageSuffix(page)}`,
    description: `Articles tagged “${tag.name}” on the ${BLOG_NAME}: practical guides for researchers and scholars.`,
    path: pagedPath(`/tag/${slug}`, page),
    // Thin tag pages compete with category pages; keep them crawlable but out of the index.
    noindex: tag.count < 2,
  });
}

export async function TagListing({ slug, page = 1 }) {
  const tag = await findTag(slug);
  if (!tag) notFound();
  const [list, side] = await Promise.all([getPosts({ page, tag: slug }), sidebarData()]);
  guardPage(page, list.totalPages);

  const base = `/tag/${slug}`;
  return (
    <>
      <JsonLd data={[
        collectionLd({ name: `#${tag.name}`, description: `Articles tagged ${tag.name}`, url: abs(pagedPath(base, page)), posts: list.items }),
        crumbs({ name: `#${tag.name}`, url: abs(base) }),
      ]} />
      <ListingView
        masthead={<Masthead eyebrow="Tag" title={`#${tag.name}${pageSuffix(page)}`} />}
        label={`${list.total} ${list.total === 1 ? 'article' : 'articles'}`}
        pills={[{ text: `#${tag.name}`, href: '/' }]}
        posts={list.items}
        page={page}
        totalPages={list.totalPages}
        hrefFor={(n) => pagedPath(base, n)}
        query={{ tag: slug }}
        activeTag={slug}
        {...side}
      />
    </>
  );
}

/* ---------- Author ---------- */

export async function authorMetadata(slug, page = 1) {
  const author = await getAuthor(slug);
  if (!author) return {};
  return {
    ...listMetadata({
      title: `${author.name}${author.role ? `, ${author.role}` : ''}${pageSuffix(page)}`,
      description: author.bio || `Articles by ${author.name} on the ${BLOG_NAME}.`,
      path: pagedPath(`/author/${slug}`, page),
    }),
    openGraph: {
      type: 'profile',
      siteName: SITE_NAME,
      url: abs(pagedPath(`/author/${slug}`, page)),
      title: author.name,
      description: author.bio,
      images: author.avatar ? [author.avatar] : [DEFAULT_OG_IMAGE],
    },
  };
}

export async function AuthorListing({ slug, page = 1 }) {
  const author = await getAuthor(slug);
  if (!author) notFound();
  const [list, side] = await Promise.all([getPosts({ page, author: slug }), sidebarData()]);
  guardPage(page, list.totalPages);

  const base = `/author/${slug}`;
  return (
    <>
      <JsonLd data={[profileLd(author), crumbs({ name: author.name, url: abs(base) })]} />
      <ListingView
        masthead={
          <Masthead eyebrow={author.role || 'Author'} title={`${author.name}${pageSuffix(page)}`} lede={author.bio}>
            <div className="j-masthead-meta">
              <Avatar author={author} large />
              <span>
                {author.credentials && <b className="j-cred">{author.credentials} · </b>}
                {list.total} {list.total === 1 ? 'article' : 'articles'}
              </span>
            </div>
            {author.expertise.length > 0 && (
              <ul className="j-expertise" aria-label="Areas of expertise">
                {author.expertise.map((e) => <li key={e}>{e}</li>)}
              </ul>
            )}
            {Object.values(author.links).some(Boolean) && (
              <div className="j-author-links">
                {Object.entries(author.links)
                  .filter(([k, v]) => v && AUTHOR_LINKS[k])
                  .map(([k, v]) => (
                    <a key={k} href={v} target="_blank" rel="noopener noreferrer me">{AUTHOR_LINKS[k]} ↗</a>
                  ))}
              </div>
            )}
          </Masthead>
        }
        label={`Articles by ${author.name}`}
        posts={list.items}
        page={page}
        totalPages={list.totalPages}
        hrefFor={(n) => pagedPath(base, n)}
        query={{ author: slug }}
        {...side}
      />
    </>
  );
}

/* ---------- Search (dynamic, never indexed) ---------- */

export { SORT_KEYS } from './site';

export async function SearchListing({ q = '', sort = 'latest', category, tag, page = 1 }) {
  const [list, side] = await Promise.all([getPosts({ page, q, sort, category, tag }), sidebarData()]);
  const cat = category ? side.categories.find((c) => c.slug === category) : null;

  const params = (patch) => {
    const s = new URLSearchParams();
    const next = { q, sort, category, tag, page: 1, ...patch };
    if (next.q) s.set('q', next.q);
    if (next.sort && next.sort !== 'latest') s.set('sort', next.sort);
    if (next.category) s.set('category', next.category);
    if (next.tag) s.set('tag', next.tag);
    if (next.page > 1) s.set('page', String(next.page));
    const str = s.toString();
    return `/search${str ? `?${str}` : ''}`;
  };

  const pills = [];
  if (q) pills.push({ text: `“${q}”`, href: params({ q: '' }) });
  if (cat) pills.push({ text: cat.name, href: params({ category: undefined }) });
  if (tag) pills.push({ text: `#${tag}`, href: params({ tag: undefined }) });

  return (
    <ListingView
      masthead={<Masthead eyebrow="Search" title={q ? <>Results for <em>{q}</em></> : 'All articles'} />}
      label={`${list.total} ${list.total === 1 ? 'article' : 'articles'}`}
      pills={pills}
      posts={list.items}
      page={Math.min(page, list.totalPages)}
      totalPages={list.totalPages}
      hrefFor={(n) => params({ page: n })}
      query={{ q, sort, category, tag }}
      activeCategory={cat?.slug}
      q={q}
      sort={sort}
      emptyTitle="No articles match your search"
      {...side}
    />
  );
}