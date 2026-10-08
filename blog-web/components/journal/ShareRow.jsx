'use client';

import { useState } from 'react';
import { useSaved } from './useSaved';

const Icon = {
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>
  ),
  li: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3V9.75zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V21h-4V9.75z" /></svg>
  ),
  wa: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 3.2 17.3L2 22l4.8-1.2A11 11 0 1 0 20.5 3.5zM12 20a9 9 0 0 1-4.6-1.3l-.3-.2-2.8.7.8-2.7-.2-.3A9 9 0 1 1 12 20zm5-6.7c-.3-.1-1.6-.8-1.8-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1a7.4 7.4 0 0 1-3.7-3.2c-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z" /></svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" /></svg>
  ),
};

/** `url` is the absolute canonical URL, so shares never carry tracking params or preview hosts. */
export default function ShareRow({ slug, url, title }) {
  const [copied, setCopied] = useState(false);
  const [saved, toggleSaved] = useSaved(slug);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="j-acts">
      <button type="button" className={`j-icon-btn ${copied ? 'j-done' : ''}`} onClick={copy}
        aria-label={copied ? 'Link copied' : 'Copy link'} title={copied ? 'Link copied' : 'Copy link'}>
        {copied ? Icon.check : Icon.copy}
      </button>
      <a className="j-icon-btn" target="_blank" rel="noopener noreferrer nofollow" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`}
        aria-label="Share on X" title="Share on X">{Icon.x}</a>
      <a className="j-icon-btn" target="_blank" rel="noopener noreferrer nofollow" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        aria-label="Share on LinkedIn" title="Share on LinkedIn">{Icon.li}</a>
      <a className="j-icon-btn" target="_blank" rel="noopener noreferrer nofollow" href={`https://wa.me/?text=${t}%20${u}`}
        aria-label="Share on WhatsApp" title="Share on WhatsApp">{Icon.wa}</a>
      <button type="button" className="j-icon-btn" onClick={toggleSaved} aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save for later'} title={saved ? 'Remove from saved' : 'Save for later'}>
        {Icon.save}
      </button>
    </div>
  );
}
