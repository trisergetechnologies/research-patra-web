import Link from 'next/link';
import Newsletter from './Newsletter';

export default function Sidebar({ categories, tags, activeCategory, activeTag }) {
  return (
    <aside className="j-side">
      <div className="j-box">
        <h2 className="j-box-h">Topics</h2>
        <ul className="j-topics">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} aria-current={activeCategory === c.slug ? 'page' : undefined}>
                <span>{c.name}</span>
                <small>{c.count}</small>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {tags.length > 0 && (
        <div className="j-box">
          <h2 className="j-box-h">Popular tags</h2>
          <div className="j-tags">
            {tags.map((t) => (
              <Link key={t.slug} className="j-tag" href={`/tag/${t.slug}`} aria-current={activeTag === t.slug ? 'page' : undefined}>
                #{t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      <Newsletter />
    </aside>
  );
}
