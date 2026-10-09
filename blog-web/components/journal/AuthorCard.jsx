import Link from 'next/link';
import { Avatar } from './PostBits';

export const LINK_LABELS = { linkedin: 'LinkedIn', orcid: 'ORCID', scholar: 'Google Scholar', website: 'Website' };

/** Author box at the end of an article and at the top of the author page: credentials, expertise and verifiable profiles. */
export default function AuthorCard({ author, headingLevel = 'h4', linkName = true }) {
  const Heading = headingLevel;
  const links = Object.entries(author.links || {}).filter(([k, v]) => v && LINK_LABELS[k]);
  return (
    <div className="j-author">
      <Avatar author={author} large />
      <div className="j-author-body">
        <p className="j-eyebrow">Written by</p>
        <Heading>{linkName && author.slug ? <Link href={`/author/${author.slug}`} rel="author">{author.name}</Link> : author.name}</Heading>
        {(author.role || author.credentials) && (
          <div className="j-role">{[author.role, author.credentials].filter(Boolean).join(' · ')}</div>
        )}
        {author.bio && <p className="j-small">{author.bio}</p>}
        {author.expertise?.length > 0 && (
          <ul className="j-expertise" aria-label="Areas of expertise">
            {author.expertise.map((e) => <li key={e}>{e}</li>)}
          </ul>
        )}
        {links.length > 0 && (
          <div className="j-author-links">
            {links.map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noopener noreferrer me">{LINK_LABELS[k]} ↗</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
