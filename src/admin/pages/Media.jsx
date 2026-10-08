import React, { useEffect, useState } from 'react';
import { Copy, ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { cmsApi, errorMessage } from '../api/client';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { useMediaRules } from '../hooks/useMediaRules';
import { useToast } from '../components/ui/toastContext';
import SearchBar from '../components/ui/SearchBar';
import FilterChips from '../components/ui/FilterChips';
import LoadMore from '../components/ui/LoadMore';
import InfoTip from '../components/ui/InfoTip';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import UploadPanel from '../components/media/UploadPanel';
import { EmptyState, ErrorBanner, PageHeader, Skeleton } from '../components/ui/States';
import { formatDate } from '../lib/format';

const DEFAULTS = { q: '', slot: '', mine: '' };
const LIMIT = 24;

export default function Media() {
  const toast = useToast();
  const rules = useMediaRules();
  const [filters, setFilters] = useUrlFilters(DEFAULTS);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const list = useInfiniteList((cursor) => cmsApi.listMedia({ ...filters, limit: LIMIT, cursor }), (d) => d.media, JSON.stringify(filters));
  const { loading, reload: load } = list;

  const slotOptions = [
    { value: '', label: 'All' },
    ...Object.entries(rules?.slots || {}).map(([value, r]) => ({ value, label: r.label })),
  ];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Media"
        info={
          <InfoTip side="bottom">
            Shared image library. Each image is checked for its slot (cover, social, inline, avatar) so it always fits where it is shown. Max 500 KB.
          </InfoTip>
        }
        actions={
          <button type="button" className="admin-btn-primary" onClick={() => setUploadOpen(true)}>
            <Upload className="w-4 h-4" /> Upload
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <FilterChips options={slotOptions} value={filters.slot} onChange={(slot) => setFilters({ slot })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted shrink-0">
            <input type="checkbox" className="accent-primaryGreen" checked={filters.mine === 'true'} onChange={(e) => setFilters({ mine: e.target.checked ? 'true' : '' })} />
            My uploads
          </label>
        </div>
        <SearchBar value={filters.q} onChange={(q) => setFilters({ q })} placeholder="Search alt text or file name" className="lg:ml-auto lg:w-72 shrink-0" />
      </div>

      <ErrorBanner message={list.items.length ? '' : list.error} onRetry={load} />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-video rounded-lg" />)}
        </div>
      ) : list.items.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            icon={ImageOff}
            title={filters.q || filters.slot ? 'No images match these filters' : 'No images yet'}
            action={<button type="button" className="admin-btn-secondary" onClick={() => setUploadOpen(true)}>Upload an image</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {list.items.map((m) => (
            <button key={m.id} type="button" onClick={() => setSelected(m)} className="group text-left admin-card overflow-hidden hover:border-primaryGreen/40">
              <img src={m.thumbUrl} alt={m.alt} loading="lazy" className="w-full aspect-video object-cover bg-soft" />
              <div className="px-2 py-1.5">
                <p className="text-xs truncate">{m.alt}</p>
                <p className="text-[10px] text-muted uppercase tracking-wide">{rules?.slots[m.slot]?.label || m.slot} · {Math.round(m.bytes / 1024)} KB</p>
              </div>
            </button>
          ))}
        </div>
      )}
      <LoadMore list={list} total={list.meta?.total} noun="images" />

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload image" size="lg">
        <UploadPanel
          slot={filters.slot || undefined}
          onUploaded={() => {
            setUploadOpen(false);
            toast.success('Image uploaded');
            load();
          }}
        />
      </Modal>

      {selected && (
        <MediaDetails
          media={selected}
          rules={rules}
          onClose={() => setSelected(null)}
          onChanged={(m) => {
            list.setItems((items) => items.map((x) => (x.id === m.id ? { ...x, ...m } : x)));
            setSelected((s) => ({ ...s, ...m }));
          }}
          onDeleted={() => {
            list.setItems((items) => items.filter((x) => x.id !== selected.id));
            setSelected(null);
            toast.success('Image deleted');
          }}
        />
      )}
    </div>
  );
}

function MediaDetails({ media, rules, onClose, onChanged, onDeleted }) {
  const toast = useToast();
  const [alt, setAlt] = useState(media.alt);
  const [saving, setSaving] = useState(false);
  const [usage, setUsage] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    cmsApi.mediaUsage(media.id).then((d) => setUsage(d.usage)).catch(() => setUsage({ posts: [], authors: [] }));
  }, [media.id]);

  const inUse = usage && (usage.posts.length > 0 || usage.authors.length > 0);

  const saveAlt = async () => {
    setSaving(true);
    try {
      const { media: m } = await cmsApi.updateMedia(media.id, { alt: alt.trim() });
      onChanged(m);
      toast.success('Alt text saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Image details" size="lg">
      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <img src={media.url} alt={media.alt} className="w-full rounded-lg bg-soft object-contain max-h-80" />
        <div className="space-y-4 text-sm">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted">Slot</dt>
            <dd>{rules?.slots[media.slot]?.label || media.slot}</dd>
            <dt className="text-muted">Size</dt>
            <dd>{media.width}×{media.height}px · {Math.round(media.bytes / 1024)} KB</dd>
            <dt className="text-muted">Uploaded</dt>
            <dd>{formatDate(media.createdAt)}{media.uploadedBy ? ` by ${media.uploadedBy}` : ''}</dd>
          </dl>
          <div>
            <label className="admin-label" htmlFor="media-alt">Alt text</label>
            <div className="flex gap-2">
              <input id="media-alt" className="admin-input" value={alt} maxLength={200} disabled={!media.canManage} onChange={(e) => setAlt(e.target.value)} />
              {media.canManage && (
                <button type="button" className="admin-btn-secondary" disabled={saving || !alt.trim() || alt.trim() === media.alt} onClick={saveAlt}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              )}
            </div>
          </div>
          <div>
            <span className="admin-label">Used in</span>
            {!usage ? (
              <Skeleton className="h-5 w-32" />
            ) : !inUse ? (
              <p className="text-muted">Not used anywhere</p>
            ) : (
              <ul className="space-y-0.5">
                {usage.posts.map((p) => <li key={p.id} className="truncate">{p.title}{p.deleted && <span className="text-muted"> (trash)</span>}</li>)}
                {usage.authors.map((a) => <li key={a.id} className="truncate">Avatar of {a.name}</li>)}
              </ul>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={() => navigator.clipboard.writeText(media.url).then(() => toast.success('URL copied'))}
            >
              <Copy className="w-4 h-4" /> Copy URL
            </button>
            {media.canManage && (
              <button
                type="button"
                className="admin-btn-secondary text-red-600 dark:text-red-400"
                disabled={!usage || inUse}
                title={inUse ? 'Remove it from the posts above first' : undefined}
                onClick={() => setConfirm(true)}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await cmsApi.deleteMedia(media.id);
          onDeleted();
        }}
        title="Delete image?"
        message="It is removed from the library and the image host. This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </Modal>
  );
}
