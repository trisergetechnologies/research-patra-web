import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Pencil, UserRound } from 'lucide-react';
import { cmsApi, errorMessage } from '../api/client';
import { useAuth } from '../context/useAuth';
import { ROLES } from '../roles';
import { useToast } from '../components/ui/toastContext';
import ImagePicker from '../components/media/ImagePicker';
import InfoTip from '../components/ui/InfoTip';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import DataTable from '../components/ui/DataTable';
import { Counter } from '../components/editor/parts';
import { ErrorBanner, PageHeader, Skeleton } from '../components/ui/States';

const LINKS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/…' },
  { key: 'orcid', label: 'ORCID', placeholder: 'https://orcid.org/0000-…' },
  { key: 'scholar', label: 'Google Scholar', placeholder: 'https://scholar.google.com/citations?user=…' },
  { key: 'website', label: 'Website', placeholder: 'https://…' },
];

const MSG = {
  empty: "You don't have an author profile yet. Fill it in and send it for approval.",
  saved: 'Saved as a draft. Send it for approval when it is ready.',
  sent: 'Sent to an admin. You can keep writing drafts. You can submit an article for review after this profile is approved.',
  live: 'The live profile stays on the site until an admin approves these changes.',
  removed: 'This author profile is removed. Drafts are still yours to edit or delete. An admin must restore it and approve it before an article can be sent for review.',
  matched: 'This matches the live profile.',
  adminSaved: 'Saved. Approve it to publish these changes on the site.',
};

const EMPTY_FORM = {
  displayName: '',
  roleTitle: '',
  bio: '',
  avatar: null,
  slug: '',
  credentials: '',
  expertise: '',
  links: { website: '', linkedin: '', orcid: '', scholar: '' },
};

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

const profileLabel = (a) => {
  if (!a) return 'Draft';
  if (a.deletedAt) return 'Removed';
  if (a.status === 'in_review') return 'In review';
  if (a.status === 'approved') return 'Approved';
  return 'Draft';
};

const saveToast = (author, { admin = false } = {}) => {
  if (author?.status === 'approved') return MSG.matched;
  return admin ? MSG.adminSaved : MSG.saved;
};

function AuthorFields({ form, setForm, showSlug, disabled }) {
  return (
    <div className="grid gap-5 sm:grid-cols-[8rem_1fr]">
      <ImagePicker slot="avatar" value={form.avatar} onChange={(avatar) => setForm({ ...form, avatar })} label="Photo" info="Square photo shown next to articles." disabled={disabled} />
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="a-name">Display name</label>
            <input id="a-name" className="admin-input" maxLength={100} required disabled={disabled} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="admin-label" htmlFor="a-role">
              Role
              <InfoTip>Short title under your name, e.g. “Statistician”.</InfoTip>
            </label>
            <input id="a-role" className="admin-input" maxLength={80} disabled={disabled} value={form.roleTitle} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
          </div>
        </div>
        {showSlug && (
          <div>
            <label className="admin-label" htmlFor="a-slug">
              Profile URL
              <InfoTip>Changes the author page address after an admin approves the profile.</InfoTip>
            </label>
            <input id="a-slug" className="admin-input" maxLength={80} disabled={disabled} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
        )}
        <div>
          <label className="admin-label" htmlFor="a-bio">
            Bio
            <InfoTip>Shown at the end of each article and on the author page.</InfoTip>
            <Counter value={form.bio} max={600} />
          </label>
          <textarea id="a-bio" rows={4} className="admin-input" maxLength={600} disabled={disabled} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <label className="admin-label" htmlFor="a-cred">
            Credentials
            <InfoTip>Why readers should trust you, e.g. “PhD, Public Health · 10+ years guiding theses”.</InfoTip>
            <Counter value={form.credentials} max={160} />
          </label>
          <input id="a-cred" className="admin-input" maxLength={160} disabled={disabled} value={form.credentials} onChange={(e) => setForm({ ...form, credentials: e.target.value })} />
        </div>
        <div>
          <label className="admin-label" htmlFor="a-exp">
            Areas of expertise
            <InfoTip>Comma separated, up to 6. Shown as chips on your author card.</InfoTip>
          </label>
          <input id="a-exp" className="admin-input" placeholder="SPSS, Meta-analysis, Qualitative research" disabled={disabled} value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
        </div>
        <fieldset disabled={disabled}>
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

function ProfileNotice({ me, dirty }) {
  if (!me) return <p className="text-sm text-muted">{MSG.empty}</p>;
  if (me.deletedAt) return <p className="text-sm text-amber-800 dark:text-amber-200">{MSG.removed}</p>;
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">Profile status: {profileLabel(me)}</p>
      {me.eligible && (me.status !== 'approved' || dirty) && <p className="text-sm text-amber-800 dark:text-amber-200">{MSG.live}</p>}
      {me.reviewNote && me.status === 'draft' && (
        <p className="text-sm text-amber-800 dark:text-amber-200">An admin sent this back: {me.reviewNote}</p>
      )}
      {me.status === 'in_review' && <p className="text-sm text-muted">This profile is with an admin for approval.</p>}
    </div>
  );
}

export default function AuthorProfile() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);
  const toast = useToast();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    cmsApi
      .myAuthor()
      .then(({ author }) => {
        setMe(author);
        setForm(author ? fromAuthor(author) : { ...EMPTY_FORM, links: { ...EMPTY_FORM.links } });
      })
      .catch((err) => setError(errorMessage(err)));
  }, []);

  const removed = !!me?.deletedAt;
  const dirty = form && JSON.stringify(toBody(form)) !== JSON.stringify(toBody(me ? fromAuthor(me) : EMPTY_FORM));
  const canSend = me && !removed && !dirty && me.status !== 'in_review' && me.status !== 'approved';

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { author } = await cmsApi.updateMyAuthor(toBody(form));
      setMe(author);
      setForm(fromAuthor(author));
      toast.success(saveToast(author));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const send = async () => {
    setSending(true);
    try {
      const { author } = await cmsApi.submitMyAuthor();
      setMe(author);
      setForm(fromAuthor(author));
      toast.success(MSG.sent);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const remove = async () => {
    const { author } = await cmsApi.removeMyAuthor();
    setMe(author);
    setForm(fromAuthor(author));
    toast.success('Author profile removed.');
  };

  const restore = async () => {
    try {
      const { author } = await cmsApi.restoreAuthor(me.id);
      setMe(author);
      setForm(fromAuthor(author));
      toast.success('Profile restored. Send it for approval before articles can be reviewed.');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <PageHeader
          title="Author profile"
          info={<InfoTip side="bottom">How you appear to readers on the blog, after an admin approves it.</InfoTip>}
          actions={
            me?.publicSlug && (
              <a href={`/blog/author/${me.publicSlug}`} target="_blank" rel="noopener noreferrer" className="admin-btn-ghost">
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
            <ProfileNotice me={me} dirty={dirty} />
            <AuthorFields form={form} setForm={setForm} disabled={removed} />
            {!removed && (
              <div className="flex flex-wrap justify-end gap-2">
                {me && (
                  <button type="button" className="admin-btn-secondary" onClick={() => setConfirmRemove(true)}>
                    Remove profile
                  </button>
                )}
                {canSend && (
                  <button type="button" className="admin-btn-secondary" disabled={sending || saving} onClick={send}>
                    {sending && <Loader2 className="w-4 h-4 animate-spin" />} Send for approval
                  </button>
                )}
                <button type="submit" className="admin-btn-primary" disabled={!dirty || saving || !form.displayName.trim()}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save profile
                </button>
              </div>
            )}
            {removed && isAdmin && (
              <div className="flex justify-end">
                <button type="button" className="admin-btn-primary" onClick={restore}>Restore profile</button>
              </div>
            )}
            {me && !removed && dirty && me.status !== 'approved' && (
              <p className="text-xs text-muted text-right">Save this profile first, then send it for approval.</p>
            )}
          </form>
        )}
      </div>
      {isAdmin && <AllAuthors />}
      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={remove}
        title="Remove author profile"
        message="Your author page comes off the site. Drafts stay yours to edit or delete. An admin must restore and approve the profile before an article can be sent for review."
        confirmLabel="Remove profile"
        danger
      />
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
    { key: 'profile', header: 'Profile', render: (a) => <span className="text-xs">{profileLabel(a)}</span> },
    { key: 'status', header: 'Account', className: 'hidden sm:table-cell', render: (a) => <span className={`text-xs ${a.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`}>{a.active ? 'Active' : 'No sign-in'}</span> },
    { key: 'posts', header: 'Posts', className: 'text-right', render: (a) => <span className="tabular-nums text-muted">{a.posts}</span> },
    { key: 'edit', header: '', className: 'w-12 text-right', render: (a) => <button type="button" className="admin-btn-ghost px-2" onClick={() => setEditing(a)} aria-label={`Edit ${a.displayName}`}><Pencil className="w-4 h-4" /></button> },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        All authors
        <InfoTip>A profile stays off the site until you approve it. Removing one hides the author page and blocks article review.</InfoTip>
      </h2>
      <DataTable columns={columns} rows={items} loading={loading} />
      {editing && (
        <EditAuthor
          author={editing}
          onClose={() => setEditing(null)}
          onSaved={(author, message) => {
            setEditing(null);
            toast.success(message);
            load();
          }}
        />
      )}
    </div>
  );
}

function EditAuthor({ author, onClose, onSaved }) {
  const [form, setForm] = useState(fromAuthor(author));
  const [current, setCurrent] = useState(author);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const removed = !!current.deletedAt;

  const apply = (next, message) => {
    setCurrent(next);
    setForm(fromAuthor(next));
    onSaved(next, message);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { author: next } = await cmsApi.updateAuthor(author.id, toBody(form, true));
      apply(next, saveToast(next, { admin: true }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const run = async (key, action, message) => {
    setBusy(key);
    setError('');
    try {
      const { author: next } = await action();
      apply(next, message);
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    } finally {
      setBusy('');
    }
  };

  return (
    <Modal open onClose={onClose} title={`Edit ${current.displayName}`} size="lg">
      <form onSubmit={submit} className="space-y-5">
        <p className="text-sm text-muted">Profile status: {profileLabel(current)}. Saving here does not publish it. Approve does.</p>
        {current.eligible && current.status !== 'approved' && !removed && <p className="text-sm text-amber-800 dark:text-amber-200">{MSG.live}</p>}
        {current.reviewNote && current.status === 'draft' && !removed && (
          <p className="text-sm text-amber-800 dark:text-amber-200">Last note: {current.reviewNote}</p>
        )}
        <AuthorFields form={form} setForm={setForm} showSlug />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          {removed ? (
            <button type="button" className="admin-btn-primary" disabled={!!busy} onClick={() => run('restore', () => cmsApi.restoreAuthor(author.id), 'Profile restored. Approve it to publish it again.').catch(() => {})}>
              {busy === 'restore' && <Loader2 className="w-4 h-4 animate-spin" />} Restore
            </button>
          ) : (
            <>
              <button type="button" className="admin-btn-secondary" onClick={() => setRemoveOpen(true)}>Remove</button>
              {current.status === 'in_review' && (
                <button type="button" className="admin-btn-secondary" onClick={() => setRejectOpen(true)}>Reject</button>
              )}
              <button type="button" className="admin-btn-secondary" disabled={!!busy || saving} onClick={() => run('approve', () => cmsApi.approveAuthor(author.id), 'Profile approved. It is now on the site.').catch(() => {})}>
                {busy === 'approve' && <Loader2 className="w-4 h-4 animate-spin" />} Approve
              </button>
            </>
          )}
          <button type="button" className="admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="admin-btn-primary" disabled={saving || !form.displayName.trim()}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </form>
      <ConfirmDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(note) => run('reject', () => cmsApi.rejectAuthor(author.id, note), 'Sent back to the author.')}
        title="Send this profile back"
        message="Tell the author what to change. The live page stays as it is."
        confirmLabel="Reject"
        input={{ required: true, minLength: 1, maxLength: 500, placeholder: 'What should they change?' }}
      />
      <ConfirmDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={() => run('remove', () => cmsApi.removeAuthor(author.id), 'Author profile removed.')}
        title="Remove author profile"
        message="The author page comes off the site. Their drafts stay editable. They cannot send an article for review until you restore and approve the profile."
        confirmLabel="Remove profile"
        danger
      />
    </Modal>
  );
}
