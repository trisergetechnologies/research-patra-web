import React, { useState } from 'react';
import { FolderTree, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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

const EMPTY = { name: '', slug: '', description: '', color: { from: '#EA580C', to: '#7C2D12' } };

const LIMIT = 30;

export default function Categories() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const list = useInfiniteList((cursor) => cmsApi.listCategories({ q, limit: LIMIT, cursor }), (d) => d.categories, q);
  const { reload: load } = list;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-md shrink-0" style={{ background: `linear-gradient(135deg, ${c.color.from}, ${c.color.to})` }} />
          <div className="min-w-0">
            <p className="font-medium">{c.name}</p>
            <p className="text-xs text-muted">/category/{c.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'description', header: 'Description', className: 'hidden xl:table-cell', render: (c) => <span className="text-muted line-clamp-2 max-w-md">{c.description || '—'}</span> },
    { key: 'posts', header: 'Posts', className: 'text-right', render: (c) => <span className="tabular-nums text-muted">{c.posts.published}<span className="text-xs"> / {c.posts.total}</span></span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right w-24',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button type="button" className="admin-btn-ghost px-2" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil className="w-4 h-4" /></button>
          <button type="button" className="admin-btn-ghost px-2 hover:text-red-600" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Categories"
        info={<InfoTip side="bottom">Each post belongs to one category. Categories get their own page on the blog. Posts column shows published / total.</InfoTip>}
        actions={<button type="button" className="admin-btn-primary" onClick={() => setEditing(EMPTY)}><Plus className="w-4 h-4" /> New category</button>}
      />
      <SearchBar value={q} onChange={setQ} placeholder="Search categories" className="mb-4 sm:max-w-xs" />
      <ErrorBanner message={list.items.length ? '' : list.error} onRetry={load} />
      <DataTable
        columns={columns}
        rows={list.items}
        loading={list.loading}
        empty={<EmptyState icon={FolderTree} title={q ? 'No categories match' : 'No categories yet'} />}
      />
      <LoadMore list={list} noun="categories" />

      {editing && (
        <CategoryForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved, isNew) => {
            setEditing(null);
            toast.success(isNew ? 'Category created' : 'Category saved');
            load();
            return saved;
          }}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await cmsApi.deleteCategory(deleting.id);
          toast.success('Category deleted');
          load();
        }}
        title={`Delete “${deleting?.name}”?`}
        message={deleting?.posts.total ? 'Posts still use this category. Move them to another one first.' : 'This cannot be undone.'}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}

function CategoryForm({ initial, onClose, onSaved }) {
  const isNew = !initial.id;
  const [form, setForm] = useState({ ...EMPTY, ...initial, color: { ...EMPTY.color, ...initial.color } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = { name: form.name.trim(), description: form.description.trim(), color: form.color, ...(form.slug.trim() ? { slug: form.slug.trim() } : {}) };
    try {
      const { category } = isNew ? await cmsApi.createCategory(body) : await cmsApi.updateCategory(initial.id, body);
      onSaved(category, isNew);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={isNew ? 'New category' : 'Edit category'} size="sm">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="admin-label" htmlFor="cat-name">Name</label>
          <input id="cat-name" className="admin-input" required maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </div>
        <div>
          <label className="admin-label" htmlFor="cat-slug">
            URL slug
            <InfoTip>Leave empty to generate from the name. Changing it changes the category page URL.</InfoTip>
          </label>
          <input id="cat-slug" className="admin-input" maxLength={60} value={form.slug} placeholder="auto" onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div>
          <label className="admin-label" htmlFor="cat-desc">Description</label>
          <textarea id="cat-desc" rows={3} className="admin-input" maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <span className="admin-label">
            Colour
            <InfoTip>Gradient used for the category's cover placeholder and chips on the blog.</InfoTip>
          </span>
          <div className="flex items-center gap-3">
            {['from', 'to'].map((k) => (
              <input key={k} type="color" value={form.color[k]} onChange={(e) => setForm({ ...form, color: { ...form.color, [k]: e.target.value } })} className="w-10 h-10 rounded-lg border border-theme bg-transparent cursor-pointer" aria-label={`Colour ${k}`} />
            ))}
            <span className="flex-1 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${form.color.from}, ${form.color.to})` }} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn-primary" disabled={saving || !form.name.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
