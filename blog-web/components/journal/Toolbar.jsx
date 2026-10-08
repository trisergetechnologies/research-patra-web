import Link from 'next/link';
import Form from 'next/form';
import SortSelect from './SortSelect';
import SearchHint from './SearchHint';

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/**
 * Search + sort is a plain GET form to /search (works without JS, never indexed).
 * Category chips are real links to /category/[slug] so crawlers can follow them.
 */
export default function Toolbar({ categories, totalCount, activeCategory, q = '', sort = 'latest' }) {
  return (
    <section className="j-bar" id="articles" aria-label="Find articles">
      <Form action="/search" className="j-bar-row" role="search">
        <label className="j-search">
          <span className="j-sr">Search articles</span>
          {SearchIcon}
          <input
            className="j-input"
            type="search"
            name="q"
            placeholder="Search thesis, statistics, APA, publishing"
            autoComplete="off"
            defaultValue={q}
          />
          <SearchHint />
        </label>
        {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
        <label className="j-sort">
          Sort by
          <SortSelect defaultValue={sort} />
        </label>
      </Form>
      <nav className="j-chips" aria-label="Categories">
        <Link href="/" className="j-chip" aria-current={!activeCategory ? 'page' : undefined}>
          All <small>{totalCount}</small>
        </Link>
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="j-chip" aria-current={activeCategory === c.slug ? 'page' : undefined}>
            {c.name} <small>{c.count}</small>
          </Link>
        ))}
      </nav>
    </section>
  );
}
