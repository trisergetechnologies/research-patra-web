import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/** Branded 1200x630 share card, used when a post has no cover or OG image of its own. */
export function ogCard({ eyebrow, title, footer, from = '#EA580C', to = '#7C2D12' }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: '#F97316' }} />
          Research Patra Journal
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {eyebrow && (
            <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.85 }}>{eyebrow}</div>
          )}
          <div style={{ fontSize: title.length > 70 ? 54 : 64, fontWeight: 800, lineHeight: 1.12, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, opacity: 0.9 }}>
          <span>{footer}</span>
          <span>researchpatra.com/blog</span>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
