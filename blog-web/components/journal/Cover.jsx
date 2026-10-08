import { useId } from 'react';
import Image from 'next/image';
import { canOptimize } from '@/lib/images';

function rng(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const LINE_WIDTHS = [150, 170, 120, 160, 90, 140, 110];

// Deterministic artwork per post, shown when the CMS post has no cover image.
function buildArt(slug) {
  const r = rng(slug);
  const shapes = [];
  for (let i = 0; i < 6; i++) {
    const x = Math.round(r() * 640);
    const y = Math.round(r() * 400);
    const s = 50 + Math.round(r() * 130);
    const o = +(0.06 + r() * 0.14).toFixed(2);
    if (i % 2) shapes.push({ type: 'circle', x, y, s, o });
    else shapes.push({ type: 'rect', x, y, s, o, rot: Math.round(r() * 50 - 25) });
  }
  const rot = Math.round(r() * 14 - 7);
  const lines = [];
  for (let i = 0; i < 7; i++) lines.push(LINE_WIDTHS[(i + Math.floor(r() * 3)) % 7]);
  const hl = Math.floor(r() * 5);
  const hlWidth = 90 + Math.round(r() * 60);
  return { shapes, rot, lines, hl, hlWidth };
}

function GeneratedArt({ post }) {
  const id = useId();
  const { from, to } = post.category.color;
  const art = buildArt(post.slug);
  const gid = `g${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${post.category.name} cover art`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill={`url(#${gid})`} />
      {art.shapes.map((s, i) =>
        s.type === 'circle' ? (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
        ) : (
          <rect key={i} x={s.x} y={s.y} width={Math.round(s.s * 1.5)} height={s.s} rx="16" fill="#fff" opacity={s.o}
            transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
        )
      )}
      <g transform={`rotate(${art.rot} 500 210)`}>
        <rect x="396" y="62" width="208" height="296" rx="14" fill="#fff" opacity=".96" />
        <rect x="428" y="86" width="70" height="12" rx="6" fill={to} opacity=".85" />
        {art.lines.map((w, i) => (
          <rect key={i} x="428" y={112 + i * 24} width={w} height="9" rx="4.5" fill={from} opacity=".28" />
        ))}
        <rect x="428" y={112 + art.hl * 24 - 3} width={art.hlWidth} height="15" rx="4" fill="#F97316" opacity=".85" />
      </g>
    </svg>
  );
}

/**
 * `sizes` should describe the rendered width so the browser picks the right srcset entry.
 * `preload` only for the above-the-fold LCP image (featured post, article cover).
 */
export default function Cover({ post, className = '', sizes = '(max-width: 640px) 100vw, 400px', preload = false }) {
  const img = post.coverImage;
  return (
    <div className={`j-cv ${className}`}>
      {img ? (
        <Image
          src={img.url}
          alt={img.alt || post.title}
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={!canOptimize(img.url)}
        />
      ) : (
        <GeneratedArt post={post} />
      )}
    </div>
  );
}
