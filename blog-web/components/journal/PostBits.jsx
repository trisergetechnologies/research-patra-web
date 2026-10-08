import Link from 'next/link';
import Image from 'next/image';
import Cover from './Cover';
import CardProgress from './CardProgress';
import { formatDate, initials } from '@/lib/format';
import { canOptimize } from '@/lib/images';

export function Avatar({ author, large = false }) {
  const size = large ? 52 : 30;
  return (
    <span className={`j-av ${large ? 'j-lg' : ''}`}>
      {author.avatar ? (
        <Image src={author.avatar} alt="" width={size} height={size} unoptimized={!canOptimize(author.avatar)} />
      ) : (
        initials(author.name)
      )}
    </span>
  );
}

export function Byline({ post }) {
  return (
    <div className="j-by">
      <Avatar author={post.author} />
      <span>
        <b>{post.author.name}</b> &middot; <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </span>
    </div>
  );
}

const DAY = 24 * 60 * 60 * 1000;

/** Article header byline: author, dates (with "Updated" when the text changed later) and the expert reviewer. */
export function ArticleByline({ post }) {
  const updated = post.modifiedAt && new Date(post.modifiedAt) - new Date(post.publishedAt) > DAY;
  return (
    <div className="j-by j-by-article">
      <Avatar author={post.author} />
      <span>
        <span className="j-by-line">
          By{' '}
          <Link href={`/author/${post.author.slug}`} rel="author">
            <b>{post.author.name}</b>
          </Link>
          {post.author.credentials && <span className="j-by-cred">, {post.author.credentials}</span>}
        </span>
        <span className="j-by-sub">
          {updated ? (
            <>
              Updated <time dateTime={post.modifiedAt}>{formatDate(post.modifiedAt)}</time>
              <span className="j-by-muted"> · Published {formatDate(post.publishedAt)}</span>
            </>
          ) : (
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          )}
          {post.reviewedBy && (
            <>
              {' · '}
              <span className="j-reviewed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Reviewed by{' '}
                <Link href={`/author/${post.reviewedBy.slug}`}>{post.reviewedBy.name}</Link>
                {post.reviewedBy.role && <span className="j-by-muted">, {post.reviewedBy.role}</span>}
              </span>
            </>
          )}
        </span>
      </span>
    </div>
  );
}

export function Meta({ post, children, linkCategory = false }) {
  return (
    <div className="j-cm">
      {children}
      {linkCategory ? (
        <Link className="j-cat" href={`/category/${post.category.slug}`}>{post.category.name}</Link>
      ) : (
        <span className="j-cat">{post.category.name}</span>
      )}
      <span className="j-dot" />
      <span>{post.readingTime} min read</span>
    </div>
  );
}

export function PostCard({ post }) {
  return (
    <article className="j-card">
      <div className="j-card-media">
        <Cover post={post} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 300px" />
        <CardProgress slug={post.slug} />
      </div>
      <Meta post={post} />
      <h3>
        <Link href={`/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="j-dek">{post.excerpt}</p>
      <Byline post={post} />
    </article>
  );
}
