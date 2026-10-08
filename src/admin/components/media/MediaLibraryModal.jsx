import React, { useCallback, useEffect, useState } from 'react';
import { Check, ImageOff, Loader2 } from 'lucide-react';
import { cmsApi, errorMessage } from '../../api/client';
import Modal from '../ui/Modal';
import SearchBar from '../ui/SearchBar';
import { EmptyState, Skeleton } from '../ui/States';
import UploadPanel from './UploadPanel';

const PAGE = 24;

/** Pick an existing image for a slot or upload a new one. */
export default function MediaLibraryModal({ open, onClose, slot, onSelect, title }) {
  const [tab, setTab] = useState('library');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(
    async (cursor) => {
      const setBusy = cursor ? setLoadingMore : setLoading;
      setBusy(true);
      setError('');
      try {
        const data = await cmsApi.listMedia({ slot, q, cursor, limit: PAGE });
        setItems((prev) => (cursor ? [...prev, ...data.media] : data.media));
        setNextCursor(data.nextCursor);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setBusy(false);
      }
    },
    [slot, q]
  );

  useEffect(() => {
    if (open && tab === 'library') load();
  }, [open, tab, load]);

  const choose = (m) => {
    onSelect(m);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Choose image'}
      size="xl"
      footer={
        tab === 'library' && (
          <>
            <button type="button" className="admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="admin-btn-primary" disabled={!selected} onClick={() => choose(selected)}>
              Use image
            </button>
          </>
        )
      }
    >
      <div className="flex items-center gap-1 mb-4 border-b border-theme -mt-1">
        {['library', 'upload'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px capitalize ${
              tab === t ? 'border-primaryGreen text-body' : 'border-transparent text-muted hover:text-body'
            }`}
          >
            {t === 'upload' ? 'Upload new' : 'Library'}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <UploadPanel slot={slot} onUploaded={choose} />
      ) : (
        <>
          <SearchBar value={q} onChange={setQ} placeholder="Search by alt text or file name" className="mb-4 sm:max-w-sm" />
          {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={ImageOff}
              title={q ? 'No images match your search' : 'No images for this slot yet'}
              action={
                <button type="button" className="admin-btn-secondary" onClick={() => setTab('upload')}>
                  Upload one
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((m) => {
                  const active = selected?.id === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m)}
                      onDoubleClick={() => choose(m)}
                      className={`group relative overflow-hidden rounded-lg border-2 text-left ${active ? 'border-primaryGreen' : 'border-transparent'}`}
                    >
                      <img src={m.thumbUrl} alt={m.alt} loading="lazy" className={`w-full bg-soft object-cover ${slot === 'avatar' ? 'aspect-square' : 'aspect-video'}`} />
                      <span className="block truncate px-1.5 py-1 text-xs text-muted">{m.alt}</span>
                      {active && (
                        <span className="absolute top-1.5 right-1.5 rounded-full bg-primaryGreen p-1 text-white">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {nextCursor && (
                <div className="flex justify-center mt-4">
                  <button type="button" className="admin-btn-secondary" disabled={loadingMore} onClick={() => load(nextCursor)}>
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </Modal>
  );
}
