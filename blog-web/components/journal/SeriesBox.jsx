import Link from 'next/link';

/** "Part 2 of 5" box listing every published part, with the current one marked. */
export function SeriesBox({ series, slug }) {
  const index = series.parts.findIndex((p) => p.slug === slug);
  if (series.parts.length < 2 || index === -1) return null;
  return (
    <nav className="j-series" aria-label={`Series: ${series.name}`}>
      <p className="j-eyebrow">
        Series · Part {index + 1} of {series.parts.length}
      </p>
      <h4>{series.name}</h4>
      <ol>
        {series.parts.map((p, i) => (
          <li key={p.slug} className={i === index ? 'j-on' : undefined}>
            {i === index ? (
              <span aria-current="page">{p.title}</span>
            ) : (
              <Link href={`/${p.slug}`}>{p.title}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Big "Next in this series" link at the end of an article. */
export function SeriesNext({ series, slug }) {
  const index = series.parts.findIndex((p) => p.slug === slug);
  const next = index === -1 ? null : series.parts[index + 1];
  if (!next) return null;
  return (
    <Link href={`/${next.slug}`} className="j-series-next">
      <span>
        Next in “{series.name}” · Part {index + 2} of {series.parts.length}
      </span>
      <b>{next.title} →</b>
    </Link>
  );
}
