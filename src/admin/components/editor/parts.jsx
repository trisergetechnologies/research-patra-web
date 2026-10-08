import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';
import { cmsApi, errorMessage } from '../../api/client';
import InfoTip from '../ui/InfoTip';
import ImagePicker from '../media/ImagePicker';

export function Section({ title, info, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-card">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-semibold" aria-expanded={open}>
        <span className="flex items-center gap-1.5">
          {title}
          {info && <InfoTip>{info}</InfoTip>}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

export function Counter({ value, max, warnAt }) {
  const n = value?.length || 0;
  const cls = n > max ? 'text-red-500' : warnAt && n > warnAt ? 'text-amber-500' : 'text-muted';
  return (
    <span className={`ml-auto text-[11px] tabular-nums font-normal ${cls}`}>
      {n}/{max}
    </span>
  );
}

/** Pick from existing tags; admins can also create one inline. */
export function TagInput({ value, onChange, canCreate, disabled, max = 10 }) {
  const [all, setAll] = useState([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const box = useRef(null);

  useEffect(() => {
    cmsApi.listTags().then((d) => setAll(d.tags)).catch(() => {});
  }, []);

  useEffect(() => {
    const close = (e) => !box.current?.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const chosen = new Set(value.map((t) => t.id));
  const q = text.trim().toLowerCase();
  const matches = useMemo(
    () => all.filter((t) => !chosen.has(t.id) && (!q || t.name.toLowerCase().includes(q))).slice(0, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, q, value]
  );
  const exact = all.some((t) => t.name.toLowerCase() === q);

  const add = (t) => {
    if (value.length >= max) return setError(`Up to ${max} tags`);
    onChange([...value, { id: t.id, name: t.name, slug: t.slug }]);
    setText('');
    setError('');
  };

  const create = async () => {
    try {
      const { tag } = await cmsApi.createTag({ name: text.trim() });
      setAll((list) => [...list, tag]);
      add(tag);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div ref={box} className="relative">
      <div className={`admin-input flex flex-wrap items-center gap-1.5 min-h-[40px] py-1.5 ${disabled ? 'opacity-60' : ''}`}>
        {value.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 rounded-md bg-soft px-2 py-0.5 text-xs">
            {t.name}
            {!disabled && (
              <button type="button" onClick={() => onChange(value.filter((x) => x.id !== t.id))} aria-label={`Remove ${t.name}`} className="text-muted hover:text-body">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (matches[0]) add(matches[0]);
                else if (canCreate && q && !exact) create();
              } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
            }}
            placeholder={value.length ? '' : 'Add tags'}
            className="flex-1 min-w-[6rem] bg-transparent text-sm outline-none"
            aria-label="Add tag"
          />
        )}
      </div>
      {open && !disabled && (matches.length > 0 || (canCreate && q && !exact)) && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-theme bg-surface py-1 shadow-lg text-sm">
          {matches.map((t) => (
            <li key={t.id}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(t)} className="w-full text-left px-3 py-1.5 hover:bg-soft">
                {t.name}
              </button>
            </li>
          ))}
          {canCreate && q && !exact && (
            <li>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={create} className="w-full text-left px-3 py-1.5 hover:bg-soft text-primaryGreen inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Create “{text.trim()}”
              </button>
            </li>
          )}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function KeyTakeaways({ value, onChange, disabled }) {
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (!t || value.length >= 8) return;
    onChange([...value, t.slice(0, 200)]);
    setText('');
  };
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primaryGreen shrink-0" />
          <input
            className="admin-input py-1.5"
            value={item}
            maxLength={200}
            disabled={disabled}
            onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
            aria-label={`Takeaway ${i + 1}`}
          />
          {!disabled && (
            <button type="button" className="admin-btn-ghost px-1.5" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="Remove takeaway">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {!disabled && value.length < 8 && (
        <div className="flex gap-2">
          <input
            className="admin-input py-1.5"
            value={text}
            maxLength={200}
            placeholder="Add a takeaway and press Enter"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" className="admin-btn-secondary px-3" onClick={add} disabled={!text.trim()} aria-label="Add takeaway">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function SeoPanel({ form, set, disabled, siteBase }) {
  const seo = form.seo;
  const setSeo = (patch) => set({ seo: { ...seo, ...patch } });
  const title = seo.metaTitle || form.title || 'Post title';
  const description = seo.metaDescription || form.excerpt || 'The excerpt is used when no meta description is set.';

  return (
    <>
      <div className="rounded-lg border border-theme p-3 bg-page">
        <p className="text-[11px] text-muted truncate">{`${siteBase}/${form.slug || 'post-url'}`}</p>
        <p className="text-[15px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8] line-clamp-1">{title}</p>
        <p className="text-xs text-muted line-clamp-2">{description}</p>
      </div>
      <div>
        <label className="admin-label" htmlFor="seo-title">
          Meta title
          <InfoTip>Shown as the headline in Google. Leave empty to use the post title. Around 50–60 characters fits best.</InfoTip>
          <Counter value={seo.metaTitle} max={70} warnAt={60} />
        </label>
        <input id="seo-title" className="admin-input" value={seo.metaTitle} maxLength={70} disabled={disabled} onChange={(e) => setSeo({ metaTitle: e.target.value })} placeholder={form.title} />
      </div>
      <div>
        <label className="admin-label" htmlFor="seo-desc">
          Meta description
          <InfoTip>The snippet under the headline in search results. Leave empty to use the excerpt. Aim for 120–160 characters.</InfoTip>
          <Counter value={seo.metaDescription} max={170} warnAt={160} />
        </label>
        <textarea id="seo-desc" rows={3} className="admin-input" value={seo.metaDescription} maxLength={170} disabled={disabled} onChange={(e) => setSeo({ metaDescription: e.target.value })} placeholder={form.excerpt} />
      </div>
      <div>
        <label className="admin-label" htmlFor="seo-canonical">
          Canonical URL
          <InfoTip>Only set this if the article was first published elsewhere. Search engines will credit that URL instead.</InfoTip>
        </label>
        <input id="seo-canonical" className="admin-input" value={seo.canonical} disabled={disabled} onChange={(e) => setSeo({ canonical: e.target.value })} placeholder="https://…" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-primaryGreen" checked={seo.noindex} disabled={disabled} onChange={(e) => setSeo({ noindex: e.target.checked })} />
        Hide from search engines
        <InfoTip>Adds noindex. The post stays reachable by link but is left out of Google and the sitemap.</InfoTip>
      </label>
      <ImagePicker slot="og" label="Social share image" info="Used when the post is shared on WhatsApp, LinkedIn or X. Defaults to an auto-generated card." value={form.ogImage} onChange={(ogImage) => set({ ogImage })} disabled={disabled} />
    </>
  );
}
