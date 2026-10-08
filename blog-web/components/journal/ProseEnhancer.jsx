'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getProgress, setProgress } from '@/lib/readingProgress';

/**
 * Progressive extras for the server-rendered article body: zoomable images, copy buttons on code,
 * citation previews and "continue where you left off". The article reads fine without any of it.
 */
export default function ProseEnhancer({ targetId, slug }) {
  const [zoom, setZoom] = useState(null);
  const [cite, setCite] = useState(null);
  const [resume, setResume] = useState(null);

  useImageZoom(targetId, setZoom);
  useCopyButtons(targetId);
  useCitationPreview(targetId, setCite);
  useResumeReading(targetId, slug, setResume);

  return (
    <>
      {zoom && <Lightbox image={zoom} onClose={() => setZoom(null)} />}
      {cite && (
        <div className="j-cite-pop" role="tooltip" id="j-cite-pop" style={{ top: cite.top, left: cite.left }}>
          <b>{cite.n}.</b> {cite.text}
        </div>
      )}
      {resume && (
        <div className="j-resume" role="status">
          <span>Pick up where you left off?</span>
          <button
            type="button"
            className="j-btn j-sm"
            onClick={() => {
              window.scrollTo({ top: resume.top, behavior: 'smooth' });
              setResume(null);
            }}
          >
            Resume
          </button>
          <button type="button" className="j-resume-x" aria-label="Dismiss" onClick={() => setResume(null)}>
            &times;
          </button>
        </div>
      )}
    </>
  );
}

function useImageZoom(targetId, setZoom) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    const imgs = [...root.querySelectorAll('img')].filter((img) => !img.closest('a'));
    imgs.forEach((img) => {
      img.classList.add('j-zoomable');
      img.tabIndex = 0;
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Enlarge image${img.alt ? `: ${img.alt}` : ''}`);
    });
    const open = (img) => setZoom({ src: img.currentSrc || img.src, alt: img.alt });
    const onClick = (e) => {
      const img = e.target.closest?.('img.j-zoomable');
      if (img) open(img);
    };
    const onKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('img.j-zoomable')) {
        e.preventDefault();
        open(e.target);
      }
    };
    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
    };
  }, [targetId, setZoom]);
}

function Lightbox({ image, onClose }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="j-lightbox" role="dialog" aria-modal="true" aria-label={image.alt || 'Image'} onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} />
      {image.alt && <p>{image.alt}</p>}
      <button ref={closeRef} type="button" className="j-lightbox-x" aria-label="Close" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}

function useCopyButtons(targetId) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root || !navigator.clipboard) return;
    const added = [...root.querySelectorAll('pre')].map((pre) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'j-copy';
      btn.textContent = 'Copy';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
          btn.textContent = 'Copied';
        } catch {
          btn.textContent = 'Press Ctrl+C';
        }
        setTimeout(() => (btn.textContent = 'Copy'), 1600);
      });
      pre.classList.add('j-has-copy');
      pre.appendChild(btn);
      return btn;
    });
    return () => added.forEach((b) => b.remove());
  }, [targetId]);
}

function useCitationPreview(targetId, setCite) {
  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    let hideTimer;
    const show = (a) => {
      clearTimeout(hideTimer);
      const li = document.getElementById(`ref-${a.dataset.ref}`);
      if (!li) return;
      const text = [...li.childNodes]
        .filter((n) => !(n.nodeType === 1 && n.classList.contains('j-backref')))
        .map((n) => n.textContent)
        .join('')
        .trim();
      const r = a.getBoundingClientRect();
      const width = Math.min(340, window.innerWidth - 24);
      a.setAttribute('aria-describedby', 'j-cite-pop');
      setCite({
        n: a.dataset.ref,
        text,
        top: r.bottom + window.scrollY + 8,
        left: Math.max(12, Math.min(r.left + window.scrollX - width / 2, window.scrollX + window.innerWidth - width - 12)),
      });
    };
    const hide = () => {
      hideTimer = setTimeout(() => setCite(null), 120);
    };
    const over = (e) => {
      const a = e.target.closest?.('a.j-ref');
      if (a) show(a);
    };
    const out = (e) => e.target.closest?.('a.j-ref') && hide();
    root.addEventListener('mouseover', over);
    root.addEventListener('mouseout', out);
    root.addEventListener('focusin', over);
    root.addEventListener('focusout', out);
    return () => {
      clearTimeout(hideTimer);
      root.removeEventListener('mouseover', over);
      root.removeEventListener('mouseout', out);
      root.removeEventListener('focusin', over);
      root.removeEventListener('focusout', out);
    };
  }, [targetId, setCite]);
}

const progressOf = (root) => {
  const r = root.getBoundingClientRect();
  const total = r.height - window.innerHeight * 0.5;
  return Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / Math.max(total, 1)));
};

function useResumeReading(targetId, slug, setResume) {
  const offer = useCallback(
    (root) => {
      const saved = getProgress(slug);
      if (saved === null || saved < 0.1 || saved > 0.9 || window.location.hash || window.scrollY > 200) return;
      const r = root.getBoundingClientRect();
      const top = r.top + window.scrollY + saved * (r.height - window.innerHeight * 0.5) - window.innerHeight * 0.5;
      setResume({ top: Math.max(0, top) });
    },
    [slug, setResume]
  );

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root || !slug) return;
    offer(root);
    let timer;
    let best = getProgress(slug) ?? 0;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const p = progressOf(root);
        if (p > 0.15) setResume(null);
        // Only the furthest point counts, so scrolling back up to re-read a section doesn't lose your place.
        if (p > best) {
          best = p;
          setProgress(slug, p);
        }
      }, 250);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [targetId, slug, offer, setResume]);
}
