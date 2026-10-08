import React, { useEffect, useState } from 'react';
import { GitMerge, Loader2, Pencil, Plus, Tags as TagsIcon, Trash2 } from 'lucide-react';
import { cmsApi, errorMessage } from '../api/client';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { useToast } from '../components/ui/toastContext';
import DataTable from '../components/ui/DataTable';
import LoadMore from '../components/ui/LoadMore';
import InfoTip from '../components/ui/InfoTip';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SearchBar from '../components/ui/SearchBar';
import { EmptyState, ErrorBanner, PageHeader } from '../components/ui/States';

const LIMIT = 30;

export default function Tags() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [merging, setMerging] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const list = useInfiniteList((cursor) => cmsApi.listTags({ q, limit: LIMIT, cursor }), (d) => d.tags, q);
  const { reload: load } = list;

  const create = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await cmsApi.createTag({ name: newName.trim() });
      setNewName('');
      toast.success('Tag created');
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Tag', render: (t) => <div><p className="font-medium">{t.name}</p><p className="text-xs text-muted">/tag/{t.slug}</p></div> },
    { key: 'posts', header: 'Posts', className: 'text-right', render: (t) => <span className="tabular-nums text-muted">{t.posts.published}<span className="text-xs"> / {t.posts.total}</span></span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right w-32',
      render: (t) => (
        <div className="flex justify-end gap-1">
          <button type="button" className="admin-btn-ghost px-2" title="Rename" onClick={() => setRenaming(t)} aria-label={`Rename ${t.name}`}><Pencil className="w-4 h-4" /></button>
          <button type="button" className="admin-btn-ghost px-2" title="Merge into another tag" onClick={() => setMerging(t)} aria-label={`Merge ${t.name}`}><GitMerge className="w-4 h-4" /></button>
          <button type="button" className="admin-btn-ghost px-2 hover:text-red-600" title="Delete" onClick={() => setDeleting(t)} aria-label={`Delete ${t.name}`}><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Tags"
        info={<InfoTip side="bottom">Tags group related posts across categories. Merge duplicates (like “APA” and “apa-7”) to keep them tidy. Posts column shows published / total.</InfoTip>}
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search tags" className="sm:max-w-xs sm:flex-1" />
        <form onSubmit={create} className="flex gap-2 sm:ml-auto">
          <input className="admin-input sm:w-52" value={newName} maxLength={40} placeholder="New tag name" onChange={(e) => setNewName(e.target.value)} aria-label="New tag name" />
          <button type="submit" className="admin-btn-primary shrink-0" disabled={creating || !newName.trim()}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
          </button>
        </form>
      </div>
      <ErrorBanner message={list.items.length ? '' : list.error} onRetry={load} />
      <DataTable columns={columns} rows={list.items} loading={list.loading} empty={<EmptyState icon={TagsIcon} title={q ? 'No tags match' : 'No tags yet'} />} />
      <LoadMore list={list} noun="tags" />

      {renaming && (
        <RenameTag
          tag={renaming}
          onClose={() => setRenaming(null)}
          onSaved={() => {
            setRenaming(null);
            toast.success('Tag renamed');
            load();
          }}
        />
      )}
      {merging && (
        <MergeTag
          tag={merging}
          onClose={() => setMerging(null)}
          onMerged={(into) => {
            setMerging(null);
            toast.success(`Merged into “${into.name}”`);
            load();
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await cmsApi.deleteTag(deleting.id);
          toast.success('Tag deleted');
          load();
        }}
        title={`Delete “${deleting?.name}”?`}
        message={deleting?.posts.total ? `It is removed from ${deleting.posts.total} post${deleting.posts.total > 1 ? 's' : ''}.` : 'This cannot be undone.'}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function RenameTag({ tag, onClose, onSaved }) {
  const [name, setName] = useState(tag.name);
  const [slug, setSlug] = useState(tag.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await cmsApi.updateTag(tag.id, { name: name.trim(), slug: slug.trim() });
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Rename tag" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="admin-label" htmlFor="tag-name">Name</label>
          <input id="tag-name" className="admin-input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <label className="admin-label" htmlFor="tag-slug">
            URL slug
            <InfoTip>Changing it changes the tag page URL on the blog.</InfoTip>
          </label>
          <input id="tag-slug" className="admin-input" maxLength={40} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn-primary" disabled={saving || !name.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MergeTag({ tag, onClose, onMerged }) {
  const [into, setInto] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const options = tags.filter((t) => t.id !== tag.id);

  useEffect(() => {
    cmsApi.listTags().then((d) => setTags(d.tags)).catch((err) => setError(errorMessage(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { tag: target } = await cmsApi.mergeTag(tag.id, into);
      onMerged(target);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Merge “${tag.name}”`} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-muted">Posts tagged “{tag.name}” get the tag you pick, then “{tag.name}” is deleted.</p>
        <select className="admin-input" value={into} onChange={(e) => setInto(e.target.value)} required aria-label="Merge into">
          <option value="">Merge into…</option>
          {options.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.posts.total})</option>)}
        </select>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn-primary" disabled={saving || !into}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Merge
          </button>
        </div>
      </form>
    </Modal>
  );
}
