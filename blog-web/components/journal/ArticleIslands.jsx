'use client';

import { useEffect, useRef, useState } from 'react';
import { useContactForm } from '@/components/site/ContactFormContext';

/** Counts one view per tab session. The site serves /api (backend) on the same origin as /blog. */
export function ViewPing({ slug }) {
  useEffect(() => {
    const key = `rp-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // Storage blocked; the server still de-duplicates by visitor.
    }
    const url = `/api/public/posts/${encodeURIComponent(slug)}/view`;
    if (!navigator.sendBeacon?.(url)) fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}

/** Reading progress bar, measured against the article body. */
export function ReadingProgress({ targetId }) {
  const barRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const prose = document.getElementById(targetId);
      if (!prose || !barRef.current) return;
      const r = prose.getBoundingClientRect();
      const h = r.height - window.innerHeight * 0.6;
      const v = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.2) / Math.max(h, 1)));
      barRef.current.style.width = `${(v * 100).toFixed(1)}%`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetId]);

  return (
    <div className="j-progress" aria-hidden="true">
      <i ref={barRef} />
    </div>
  );
}

/** Table of contents as real anchor links (crawlable, work without JS); JS only highlights the current section. */
export function Toc({ items }) {
  const [active, setActive] = useState(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      let current = null;
      items.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 160) current = id;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  return (
    <div className="j-toc">
      {items.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={`${h.level === 3 ? 'j-l3 ' : ''}${active === h.id ? 'j-on' : ''}`.trim() || undefined}
          aria-current={active === h.id ? 'location' : undefined}
        >
          {h.text}
        </a>
      ))}
    </div>
  );
}

/** "Was this useful?" Stored per article so editors can see which posts land; the choice can be changed. */
export function Vote({ slug }) {
  const [vote, setVote] = useState(null);

  const send = (helpful) => {
    setVote(helpful);
    if (!slug) return;
    fetch(`/api/public/posts/${encodeURIComponent(slug)}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <div className="j-vote" aria-live="polite">
      {vote === null ? (
        <>
          <span>Was this useful?</span>
          <button type="button" className="j-btn j-ghost j-sm" onClick={() => send(true)}>👍 Yes</button>
          <button type="button" className="j-btn j-ghost j-sm" onClick={() => send(false)}>Not really</button>
        </>
      ) : (
        <span>
          <strong>{vote ? 'Glad it helped.' : 'Thanks, we’ll work on it.'}</strong> Your feedback shapes what we write next.{' '}
          <button type="button" className="j-linkbtn" onClick={() => send(!vote)}>
            {vote ? 'Actually, not really' : 'Actually, it was useful'}
          </button>
        </span>
      )}
    </div>
  );
}

export function ConsultButton() {
  const { openContactForm } = useContactForm();
  return (
    <button type="button" className="j-btn" onClick={() => openContactForm({ source: 'blog' })}>
      Book a free consultation
    </button>
  );
}
