import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Pencil, UserRound } from 'lucide-react';
import { cmsApi, errorMessage } from '../api/client';
import { useAuth } from '../context/useAuth';
import { ROLES } from '../roles';
import { useToast } from '../components/ui/toastContext';
import ImagePicker from '../components/media/ImagePicker';
import InfoTip from '../components/ui/InfoTip';
import Modal from '../components/ui/Modal';
import DataTable from '../components/ui/DataTable';
import { Counter } from '../components/editor/parts';
import { ErrorBanner, PageHeader, Skeleton } from '../components/ui/States';

const LINKS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
  { key: 'orcid', label: 'ORCID', placeholder: 'https://orcid.org/0000-…' },
  { key: 'scholar', label: 'Google Scholar', placeholder: 'https://scholar.google.com/citations?user=…' },
  { key: 'website', label: 'Website', placeholder: 'https://…' },
];

const fromAuthor = (a) => ({
  displayName: a.displayName,
  roleTitle: a.roleTitle,
  bio: a.bio,
  avatar: a.avatar,
  slug: a.slug,
  credentials: a.credentials ?? '',
  expertise: (a.expertise ?? []).join(', '),
  links: { website: '', linkedin: '', orcid: '', scholar: '', ...a.links },
});

function AuthorFields({ form, setForm, showSlug }) {
  return (
    <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
      <ImagePicker slot="avatar" value={form.avatar} onChange={(avatar) => setForm({ ...form, avatar })} label="Photo" info="Square photo shown next to articles." />
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="a-name">Display name</label>
            <input id="a-name" className="admin-input" maxLength={100} required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="admin-label" htmlFor="a-role">
              Role
              <InfoTip>Short title under your name, e.g. “Statistician”.</InfoTip>
            </label>
            <input id="a-role" className="admin-input" maxLength={80} value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
          </div>
        </div>
        {showSlug && (
          <div>
            <label className="admin-label" htmlFor="a-slug">
              Profile URL
              <InfoTip>Changes the author page address on the blog.</InfoTip>
            </label>
            <input id="a-slug" className="admin-input" maxLength={80} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
        )}
        <div>
          <label className="admin-label" htmlFor="a-bio">
            Bio
            <InfoTip>Shown at the end of each article and on the author page.</InfoTip>
            <Counter value={form.bio} max={600} />
          </label>
          <textarea id="a-bio" rows={4} className="admin-input" maxLength={600} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="admin-label" htmlFor="a-cred">
            Credentials
            <InfoTip>Why readers should trust you, e.g. “PhD, Public Health · 10+ years guiding theses”.</InfoTip>
            <Counter value={form.credentials} max={160} />
          </label>
          <input id="a-cred" className="admin-input" maxLength={160} value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} />
        </div>
        <div>
          <label className="admin-label" htmlFor="a-exp">
            Areas of expertise
            <InfoTip>Comma separated, up to 6. Shown as chips on your author card.</InfoTip>
          </label>
          <input id="a-exp" className="admin-input" placeholder="SPSS, Meta-analysis, Qualitative research" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
        </div>
        <fieldset>
          <legend className="admin-label">
            Profiles
            <InfoTip>Linked from your author card and given to search engines as proof of identity.</InfoTip>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {LINKS.map((l) => (
              <input
                key={l.key}
                type="url"
                className="admin-input"
                aria-label={l.label}
                placeholder={`${l.label} · ${l.placeholder}`}
                value={form.links[l.key]}
                onChange={(e) => setForm({ ...form, links: { ...form.links, [l.key]: e.target.value } })}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

const toBody = (form, withSlug) => ({
  displayName: form.displayName.trim(),
  roleTitle: form.roleTitle.trim(),
  bio: form.bio.trim(),
  avatar: form.avatar?.id ?? null,
  credentials: form.credentials.trim(),
  expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean),
  links: Object.fromEntries(LINKS.map((l) => [l.key, form.links[l.key].trim()])),
  ...(withSlug ? { slug: form.slug.trim() } : {}),
});

export default function AuthorProfile() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cmsApi
      .myAuthor()
      .then(({ author }) => {
        setMe(author);
        setForm(fromAuthor(author));
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const dirty = me && form && JSON.stringify(toBody(form)) !== JSON.stringify(toBody(fromAuthor(me)));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { author } = await cmsApi.updateMyAuthor(toBody(form));
      setMe(author);
      setForm(fromAuthor(author));
      toast.success('Profile saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <PageHeader
          title="Author profile"
          info={<InfoTip side="bottom">How you appear to readers on the blog.</InfoTip>}
          actions={
            me && (
              <a href={`/blog/author/${me.slug}`} target="_blank" rel="noopener noreferrer" className="admin-btn-ghost">
                <ExternalLink className="w-4 h-4" /> View page
              </a>
            )
          }
        />
        <ErrorBanner message={error} />
        {!form ? (
          <div className="admin-card p-6 space-y-3">
            <Skeleton className="h-32 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={save} className="admin-card p-5 space-y-5">
            <AuthorFields form={form} setForm={setForm} />
            <div className="flex justify-end">
              <button type="submit" className="admin-btn-primary" disabled={!dirty || saving || !form.displayName.trim()}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save profile
              </button>
            </div>
          </form>
        )}
      </div>
      {isAdmin && <AllAuthors />}
    </div>
  );
}

function AllAuthors() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await cmsApi.listAuthors()).authors);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    {
      key: 'name',
      header: 'Author',
      render: (a) => (
        <div className="flex items-center gap-3">
          {a.avatar ? (
            <img src={a.avatar.thumbUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-soft flex items-center justify-center text-muted"><UserRound className="w-4 h-4" /></span>
          )}
          <div className="min-w-0">
            <p className="font-medium truncate">{a.displayName}</p>
            <p className="text-xs text-muted truncate">{a.roleTitle || a.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Account', className: 'hidden sm:table-cell', render: (a) => <span className={`text-xs ${a.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>{a.active ? 'Active' : 'No sign-in'}</span> },
    { key: 'posts', header: 'Posts', className: 'text-right', render: (a) => <span className="tabular-nums text-muted">{a.posts}</span> },
    { key: 'edit', header: '', className: 'w-12 text-right', render: (a) => <button type="button" className="admin-btn-ghost px-2" onClick={() => setEditing(a)} aria-label={`Edit ${a.displayName}`}><Pencil className="w-4 h-4" /></button> },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        All authors
        <InfoTip>Profiles are created automatically the first time someone writes a post.</InfoTip>
      </h2>
      <DataTable columns={columns} rows={items} loading={loading} />
      {editing && (
        <EditAuthor
          author={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            toast.success('Author saved');
            load();
          }}
        />
      )}
    </div>
  );
}

function EditAuthor({ author, onClose, onSaved }) {
  const [form, setForm] = useState(fromAuthor(author));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await cmsApi.updateAuthor(author.id, toBody(form, true));
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${author.displayName}`} size="lg">
      <form onSubmit={submit} className="space-y-5">
        <AuthorFields form={form} setForm={setForm} showSlug />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn-primary" disabled={saving || !form.displayName.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
