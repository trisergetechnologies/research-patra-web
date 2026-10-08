'use client';

export default function Error({ reset }) {
  return (
    <div className="rpj">
      <div className="j-container" style={{ paddingBlock: 'clamp(48px, 8vw, 96px)' }}>
        <div className="j-empty">
          <h1 style={{ fontSize: '1.4rem' }}>The Journal is taking a moment</h1>
          <p>We couldn&apos;t load this page right now. Please try again.</p>
          <button type="button" className="j-btn" onClick={reset}>Try again</button>
        </div>
      </div>
    </div>
  );
}
