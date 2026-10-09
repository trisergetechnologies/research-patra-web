import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Archive, CheckCircle2, ExternalLink, Eye, History, Loader2, MessageSquareWarning, MoreHorizontal,
  RotateCcw, Save, Send, Trash2, Undo2, EyeOff, AlertTriangle, GitPullRequestArrow, MessageSquarePlus, MessagesSquare,
} from 'lucide-react';
import { cmsApi, errorMessage } from '../api/client';
import { useAuth } from '../context/useAuth';
import { ROLES } from '../roles';
import { useToast } from '../components/ui/toastContext';
import RichEditor from '../components/editor/RichEditor';
import { Counter, KeyTakeaways, Section, SeoPanel, TagInput } from '../components/editor/parts';
import ImagePicker from '../components/media/ImagePicker';
import StatusBadge from '../components/ui/StatusBadge';
import PlagiarismChip from '../components/PlagiarismChip';
import PublishConfirm from '../components/PublishConfirm';
import { hasPlagiarismReport } from '../lib/plagiarism';
import InfoTip from '../components/ui/InfoTip';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import LoadMore from '../components/ui/LoadMore';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { Skeleton } from '../components/ui/States';
import CommentRail from '../components/review/CommentRail';
import ChangesView from '../components/review/ChangesView';
import SelectionBubble from '../components/review/SelectionBubble';
import { FIELD_IDS, useReviewWorkspace } from '../components/review/useReviewWorkspace';
import { ACTION_LABELS, formatDate, timeAgo } from '../lib/format';

const SITE_BASE = 'researchpatra.com/blog';
const BLOG_URL = '/blog';
const AUTOSAVE_DELAY = 3000;
const CONTENT_FIELDS = ['title', 'excerpt', 'contentHtml', 'keyTakeaways', 'coverImage', 'ogImage', 'category', 'tags', 'seo', 'series', 'seriesOrder'];
const FIELD_LABELS = { title: 'Title', excerpt: 'Excerpt', contentHtml: 'Content', keyTakeaways: 'Takeaways', coverImage: 'Cover', ogImage: 'Share image', category: 'Category', tags: 'Tags', seo: 'SEO', series: 'Series', seriesOrder: 'Series part' };

const EMPTY_SEO = { metaTitle: '', metaDescription: '', canonical: '', noindex: false };
const blankForm = () => ({
  title: '', excerpt: '', contentHtml: '', keyTakeaways: [], coverImage: null, ogImage: null, category: null, tags: [],
  seo: { ...EMPTY_SEO }, series: '', seriesOrder: null, slug: '', featured: false, author: null, reviewedBy: null,
});

const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');

const wordCount = (html) => (html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

function viewTarget(post, choice, isAdmin) {
  if (!post) return 'live';
  if (isAdmin && choice === 'live') return 'live';
  return post.permissions.editTarget ?? (post.pendingRevision ? 'revision' : 'live');
}

function formFrom(post, target) {
  const src = target === 'revision' && post.pendingRevision ? post.pendingRevision : post;
  return {
    title: src.title || '', excerpt: src.excerpt || '', contentHtml: src.contentHtml || '', keyTakeaways: src.keyTakeaways || [],
    coverImage: src.coverImage, ogImage: src.ogImage, category: src.category, tags: src.tags || [], seo: { ...EMPTY_SEO, ...src.seo },
    series: src.series || '', seriesOrder: src.seriesOrder ?? null,
    slug: post.slug, featured: post.featured, author: post.author, reviewedBy: post.reviewedBy ?? null,
  };
}

function payloadOf(f) {
  return {
    title: f.title.trim(), excerpt: f.excerpt.trim(), contentHtml: f.contentHtml, keyTakeaways: f.keyTakeaways.map((t) => t.trim()).filter(Boolean),
    coverImage: f.coverImage?.id ?? null, ogImage: f.ogImage?.id ?? null, category: f.category?.id ?? null, tags: f.tags.map((t) => t.id),
    seo: { ...f.seo, canonical: f.seo.canonical.trim() }, series: f.series.trim(), seriesOrder: f.series.trim() ? f.seriesOrder : null,
    slug: f.slug, featured: f.featured, author: f.author?.id, reviewedBy: f.reviewedBy?.id ?? null,
  };
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const diff = (next, base) => Object.fromEntries(Object.entries(next).filter(([k, v]) => v !== undefined && !same(v, base[k])));

const AUTHOR_NOT_APPROVED = 'Your author profile is not approved, so this article cannot be sent for review.';
const AUTHOR_REMOVED = 'This author profile is removed. Restore and approve it before publishing this article.';

function authorGate(author) {
  if (!author || author.deletedAt || !author.eligible) {
    return {
      submit: AUTHOR_NOT_APPROVED,
      approve: author?.deletedAt ? AUTHOR_REMOVED : AUTHOR_NOT_APPROVED,
    };
  }
  return null;
}

const ACTION_DONE = {
  submit: 'Sent for review',
  approve: 'Published',
  'request-changes': 'Feedback sent to the writer',
  'discard-revision': 'Pending edits discarded',
  unpublish: 'Unpublished',
  archive: 'Archived',
  restore: 'Restored as draft',
};

export default function PostEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole(ROLES.ADMIN);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState('');
  const [targetChoice, setTargetChoice] = useState(null);
  const [baseline, setBaseline] = useState(blankForm);
  const [form, setForm] = useState(blankForm);
  const [resetKey, setResetKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(null);
  const [conflict, setConflict] = useState(false);
  const [errors, setErrors] = useState({});
  const [dialog, setDialog] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [mine, setMine] = useState(undefined);
  const [seriesNames, setSeriesNames] = useState([]);
  const [editor, setEditor] = useState(null);
  const [viewState, setViewState] = useState({ id, view: 'review' });
  const [asideTab, setAsideTab] = useState('comments');
  const skipLoad = useRef(null);
  const menuRef = useRef(null);
  const titleRef = useRef(null);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [form.title, loading]);

  const target = isNew ? 'live' : viewTarget(post, targetChoice, isAdmin);
  const perms = useMemo(
    () =>
      isNew
        ? { edit: true, editTarget: 'live', changeSlug: true, changeAuthor: isAdmin, feature: isAdmin, submit: !isAdmin, approve: isAdmin }
        : post?.permissions || {},
    [isNew, isAdmin, post]
  );
  // Admins reviewing a submission read and comment by default ("review"), can compare ("changes"), or edit directly.
  const canComment = !!perms.requestChanges;
  const view = viewState.id === id ? viewState.view : 'review';
  const setView = (v) => setViewState({ id, view: v });
  const mode = canComment ? view : 'edit';
  const readOnly = !perms.edit || mode !== 'edit';
  const dirty = !same(payloadOf(form), payloadOf(baseline));
  const set = useCallback((patch) => setForm((f) => ({ ...f, ...patch })), []);
  const ws = useReviewWorkspace({ postId: isNew ? null : post?.id, editor, form, set, toast });
  const reloadReview = ws.review.reload;

  useEffect(() => {
    cmsApi.listCategories().then((d) => setCategories(d.categories)).catch(() => {});
    cmsApi.listSeries().then((d) => setSeriesNames(d.items)).catch(() => {});
    if (isAdmin) cmsApi.listAuthors().then((d) => setAuthors(d.authors)).catch(() => {});
    cmsApi.myAuthor().then((d) => setMine(d.author)).catch(() => setMine(null));
  }, [isAdmin]);

  const applyPost = useCallback(
    (p, { choice = targetChoice, keepEditsFrom } = {}) => {
      const next = formFrom(p, viewTarget(p, choice, isAdmin));
      setPost(p);
      setBaseline(next);
      setForm((cur) => {
        if (!keepEditsFrom) return next;
        // Keep anything typed while the save was in flight.
        const merged = { ...next };
        for (const k of Object.keys(next)) if (!same(cur[k], keepEditsFrom[k])) merged[k] = cur[k];
        return merged;
      });
      return next;
    },
    [targetChoice, isAdmin]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { post: p } = await cmsApi.getPost(id);
      applyPost(p, { choice: null });
      setTargetChoice(null);
      setConflict(false);
      setResetKey((k) => k + 1);
    } catch (err) {
      setLoadError(err.status === 404 ? 'This post does not exist or you do not have access to it.' : errorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isNew) {
      const f = blankForm();
      setPost(null);
      setBaseline(f);
      setForm(f);
      setSlugTouched(false);
      setResetKey((k) => k + 1);
      setLoading(false);
      return;
    }
    if (skipLoad.current === id) {
      skipLoad.current = null;
      return;
    }
    load();
  }, [id, isNew, load]);

  const handleError = useCallback(
    (err) => {
      if (err.status === 409 && err.data?.code === 'VERSION_CONFLICT') {
        setConflict(true);
        return;
      }
      const details = err.data?.details;
      if (Array.isArray(details)) setErrors(Object.fromEntries(details.filter((d) => d.path).map((d) => [d.path, d.message])));
      toast.error(errorMessage(err));
    },
    [toast]
  );

  const save = useCallback(
    async ({ quiet = false } = {}) => {
      if (!form.title.trim()) {
        setErrors({ title: 'Add a title first' });
        const e = new Error('Add a title first');
        e.handled = true;
        throw e;
      }
      const snapshot = form;
      setSaving(true);
      try {
        let p;
        if (isNew) {
          const body = payloadOf(form);
          if (!isAdmin || !body.author) delete body.author;
          if (!isAdmin || !body.reviewedBy) delete body.reviewedBy;
          if (!isAdmin) delete body.featured;
          if (!body.slug) delete body.slug;
          p = (await cmsApi.createPost(body)).post;
          skipLoad.current = p.id;
          navigate(`/admin/posts/${p.id}`, { replace: true });
        } else {
          const changes = diff(payloadOf(form), payloadOf(baseline));
          if (!Object.keys(changes).length) return post;
          const body = { ...changes, version: post.version };
          if (isAdmin && targetChoice === 'live' && post.pendingRevision) body.target = 'live';
          p = (await cmsApi.updatePost(post.id, body)).post;
        }
        const next = applyPost(p, { keepEditsFrom: snapshot });
        // The server strips anything not allowed on the blog; show the editor what was actually stored.
        if (next.contentHtml !== snapshot.contentHtml) setResetKey((k) => k + 1);
        setErrors({});
        if (!quiet) toast.success('Saved');
        return p;
      } catch (err) {
        handleError(err);
        err.handled = true;
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [form, baseline, post, isNew, isAdmin, targetChoice, navigate, applyPost, handleError, toast]
  );

  const runAction = useCallback(
    async (action, note) => {
      setBusy(action);
      setMenuOpen(false);
      try {
        let p = post;
        if (isNew || (dirty && perms.edit)) p = await save({ quiet: true });
        const { post: updated } = await cmsApi.postAction(p.id, action, { version: p.version, ...(note ? { note } : {}) });
        setTargetChoice(null);
        applyPost(updated, { choice: null });
        setResetKey((k) => k + 1);
        reloadReview();
        toast.success(ACTION_DONE[action] || 'Done');
      } catch (err) {
        if (!err.handled) handleError(err);
        throw err;
      } finally {
        setBusy(null);
      }
    },
    [post, isNew, dirty, perms.edit, save, applyPost, handleError, toast, reloadReview]
  );

  const fire = (action) => runAction(action).catch(() => {});

  const requestReport = useCallback(async () => {
    const summary = post?.plagiarism;
    const inFlight = summary?.status === 'queued' || summary?.status === 'running';
    if (post && (hasPlagiarismReport(summary) || inFlight)) {
      navigate(`/admin/posts/${post.id}/plagiarism`);
      return;
    }
    let current = post;
    if (isNew || (dirty && perms.edit)) current = await save({ quiet: true });
    const data = await cmsApi.startPlagiarism(current.id);
    setPost((prev) => (prev && prev.id === current.id ? { ...prev, plagiarism: data.summary } : prev));
  }, [post, isNew, dirty, perms.edit, save, navigate]);

  const remove = async () => {
    await cmsApi.deletePost(post.id, post.version);
    toast.success('Moved to trash');
    navigate('/admin/posts');
  };

  // Ctrl/Cmd+S saves; leaving with unsaved edits asks first.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!readOnly && dirty && !saving) save().catch(() => {});
      }
    };
    const onUnload = (e) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [dirty, readOnly, saving, save]);

  // Drafts and pending edits save themselves; edits to a live article stay manual so nothing goes public mid-sentence.
  const autoSave = !readOnly && !(post?.status === 'published' && target === 'live');
  const autoSaveFailed = useRef(null);
  useEffect(() => {
    if (!autoSave || !dirty || saving || busy || conflict || !form.title.trim() || autoSaveFailed.current === form) return undefined;
    const t = setTimeout(() => {
      save({ quiet: true }).catch(() => {
        autoSaveFailed.current = form;
      });
    }, AUTOSAVE_DELAY);
    return () => clearTimeout(t);
  }, [autoSave, dirty, saving, busy, conflict, form, save]);

  // Opens the post on the real blog layout through a private, short-lived link.
  const openPreview = async () => {
    if (isNew && !form.title.trim()) {
      setErrors({ title: 'Add a title first' });
      return;
    }
    // Opened before any await so pop-up blockers treat it as part of the click.
    const win = window.open('about:blank', '_blank');
    setBusy('preview');
    try {
      let p = post;
      if (isNew || (dirty && perms.edit)) p = await save({ quiet: true });
      const { path } = await cmsApi.previewTicket(p.id, isAdmin && targetChoice === 'live' ? 'live' : 'revision');
      const url = new URL(path, window.location.origin).href;
      if (win) {
        win.opener = null;
        win.location.replace(url);
      } else {
        window.location.assign(url);
      }
    } catch (err) {
      win?.close();
      if (!err.handled) handleError(err);
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => !menuRef.current?.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const switchTarget = (choice) => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    setTargetChoice(choice);
    applyPost(post, { choice });
    setResetKey((k) => k + 1);
  };

  const onTitle = (title) => {
    const patch = { title };
    if (!slugTouched && perms.changeSlug && !post?.publishedAt) patch.slug = slugify(title);
    set(patch);
    if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
  };

  const changedInRevision = useMemo(() => {
    if (!post?.pendingRevision) return [];
    const live = payloadOf(formFrom(post, 'live'));
    const rev = payloadOf(formFrom(post, 'revision'));
    return CONTENT_FIELDS.filter((k) => !same(live[k], rev[k])).map((k) => FIELD_LABELS[k]);
  }, [post]);

  const previousReview = ws.review.previous;
  const baselines = useMemo(() => {
    if (!post) return [];
    const list = [];
    if (previousReview) list.push({ id: 'previous', label: 'Since last review', at: previousReview.at, content: previousReview.content });
    if (post.pendingRevision) list.push({ id: 'live', label: 'Compared to live', content: post });
    return list;
  }, [post, previousReview]);

  if (loading) {
    return (
      <div className="max-w-6xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="max-w-xl admin-card p-8 text-center space-y-4">
        <p className="text-muted">{loadError}</p>
        <Link to="/admin/posts" className="admin-btn-secondary">Back to posts</Link>
      </div>
    );
  }

  const status = post?.status || 'draft';
  const rev = post?.pendingRevision;
  const note = rev?.state === 'changes_requested' ? rev.reviewNote : status === 'changes_requested' ? post?.reviewNote : '';
  const publishLabel = status === 'published' && rev ? 'Publish changes' : status === 'in_review' || rev?.state === 'in_review' ? 'Approve & publish' : 'Publish';
  const words = wordCount(form.contentHtml);
  const inReviewNow = status === 'in_review' || rev?.state === 'in_review';
  const { counts } = ws;
  const hasThread = !isNew && (canComment || ws.review.comments.length > 0);
  const showRail = hasThread && asideTab === 'comments';
  const writer = post?.createdBy?.name?.split(' ')[0] || 'the writer';
  const reviewer = ws.review.comments.find((c) => c.status !== 'draft')?.author?.name || 'The reviewer';
  const showFeedback = !canComment && counts.sent > 0 && !inReviewNow;
  const submitBlocked = perms.submit && counts.mustLeft > 0;
  const gateAuthor = form.author || (mine === undefined ? undefined : mine);
  const waitingForAuthor = !form.author && mine === undefined;
  const profileBlock = waitingForAuthor ? null : authorGate(gateAuthor);
  const profileMessage = profileBlock ? (perms.approve && !perms.submit ? profileBlock.approve : profileBlock.submit) : '';
  const showComments = () => {
    setAsideTab('comments');
    requestAnimationFrame(() => document.getElementById('review-comments')?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };
  const fieldComment = (field) => {
    ws.startFieldComment(field);
    setAsideTab('comments');
  };
  const railPerms = { resolve: isAdmin || post?.createdBy?.id === user?.id, accept: !readOnly };

  const menuItems = [
    { show: !post?.deletedAt, label: 'Preview', icon: Eye, on: openPreview },
    { show: status === 'published' && !post?.deletedAt, label: 'View on blog', icon: ExternalLink, on: () => window.open(`${BLOG_URL}/${post.slug}`, '_blank', 'noopener') },
    { show: !isNew, label: 'History', icon: History, on: () => setDialog('history') },
    { show: perms.discardRevision, label: 'Discard pending edits', icon: Undo2, on: () => setDialog('discard') },
    { show: perms.unpublish, label: 'Unpublish', icon: EyeOff, on: () => setDialog('unpublish') },
    { show: perms.archive, label: 'Archive', icon: Archive, on: () => setDialog('archive') },
    { show: perms.restore, label: 'Restore as draft', icon: RotateCcw, on: () => fire('restore') },
    { show: perms.delete && !isNew, label: 'Move to trash', icon: Trash2, danger: true, on: () => setDialog('delete') },
  ].filter((i) => i.show);

  return (
    <div className="max-w-6xl">
      {/* Top bar */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 -mt-4 md:-mt-8 mb-6 px-4 md:px-8 py-3 bg-soft/90 backdrop-blur border-b border-theme flex flex-wrap items-center gap-3">
        <Link to="/admin/posts" className="admin-btn-ghost px-2" aria-label="Back to posts">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <StatusBadge status={isNew ? 'draft' : status} revisionState={rev?.state} deleted={!!post?.deletedAt} />
          {isAdmin && !isNew && post && (
            <PlagiarismChip
              postId={post.id}
              summary={post.plagiarism}
              dirty={dirty}
              poll
              onChange={(summary) => setPost((current) => (current ? { ...current, plagiarism: summary } : current))}
            />
          )}
          <span className="hidden sm:inline text-xs text-muted truncate">
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : post ? `Saved ${timeAgo(target === 'revision' && rev ? rev.updatedAt : post.updatedAt)}` : 'New post'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button type="button" className="admin-btn-secondary" disabled={!dirty || saving || !!busy} onClick={() => save().catch(() => {})}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
          {submitBlocked && (
            <button
              type="button"
              onClick={showComments}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {counts.mustLeft} must-fix left
            </button>
          )}
          {perms.submit && (
            <button
              type="button"
              className="admin-btn-primary"
              disabled={!!busy || saving || submitBlocked || waitingForAuthor || !!profileBlock}
              title={profileBlock?.submit || (submitBlocked ? `Resolve ${counts.mustLeft} must-fix comment${counts.mustLeft === 1 ? '' : 's'} first` : undefined)}
              onClick={() => fire('submit')}
            >
              {busy === 'submit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {counts.sent ? 'Resubmit' : rev ? 'Submit edits' : 'Submit for review'}
            </button>
          )}
          {perms.approve && !canComment && (
            <button
              type="button"
              className="admin-btn-primary"
              disabled={!!busy || saving || waitingForAuthor || !!profileBlock}
              title={profileBlock?.approve || undefined}
              onClick={() => setDialog('approve')}
            >
              {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {publishLabel}
            </button>
          )}
          {menuItems.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button type="button" className="admin-btn-secondary px-2.5" onClick={() => setMenuOpen((o) => !o)} aria-label="More actions" aria-expanded={menuOpen}>
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-theme bg-surface py-1 shadow-lg z-40">
                  {menuItems.map((i) => (
                    <button
                      key={i.label}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        i.on();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-soft ${i.danger ? 'text-red-600 dark:text-red-400' : ''}`}
                    >
                      <i.icon className="w-4 h-4" /> {i.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banners */}
      <div className="space-y-3 mb-5">
        {profileMessage && (perms.submit || perms.approve) && (
          <Banner tone="amber" icon={AlertTriangle}>{profileMessage}</Banner>
        )}
        {conflict && (
          <Banner tone="red" icon={AlertTriangle}>
            Someone else saved this post while you were editing.
            <button type="button" className="ml-2 font-semibold underline" onClick={() => (!dirty || window.confirm('Your unsaved changes will be lost. Reload?')) && load()}>
              Reload latest
            </button>
          </Banner>
        )}
        {post?.deletedAt && <Banner tone="red" icon={Trash2}>This post is in the trash. Restore it to edit.</Banner>}
        {showFeedback ? (
          <FeedbackBanner
            reviewer={reviewer}
            total={counts.sent}
            resolved={counts.resolved}
            mustLeft={counts.mustLeft}
            note={(rev ? rev.reviewNote : post?.reviewNote) || ''}
            onShow={showComments}
          />
        ) : (
          note && !canComment && (
            <Banner tone="rose" icon={MessageSquareWarning}>
              <span className="font-semibold">Editor feedback: </span>
              <span className="whitespace-pre-line">{note}</span>
            </Banner>
          )
        )}
        {!isAdmin && readOnly && !post?.deletedAt && (status === 'in_review' || rev?.state === 'in_review') && (
          <Banner tone="amber" icon={Send}>Waiting for an admin to review. You can edit again once they respond.</Banner>
        )}
        {!isAdmin && readOnly && status === 'archived' && !post?.deletedAt && (
          <Banner tone="amber" icon={Archive}>Archived. Only an admin can restore it.</Banner>
        )}
        {rev && target === 'revision' && (
          <Banner tone="sky" icon={GitPullRequestArrow}>
            {isAdmin ? 'Pending edits to the live post' : 'You are editing a copy. The live article stays unchanged until an admin approves your edits.'}
            {changedInRevision.length > 0 && <span className="text-xs opacity-80"> · Changed: {changedInRevision.join(', ')}</span>}
          </Banner>
        )}
        {canComment && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-lg border border-theme bg-surface p-0.5 text-xs font-medium" role="tablist" aria-label="Review mode">
              {[
                ['review', 'Review'],
                ['changes', 'Changes'],
                ['edit', 'Edit'],
              ].map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${view === v ? 'bg-primaryGreen text-white' : 'text-muted hover:text-body'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted">
              {view === 'review' ? 'Select any text to comment on it.' : view === 'changes' ? 'What changed since you last looked.' : 'Edit the post directly.'}
            </span>
          </div>
        )}
        {isAdmin && rev && mode === 'edit' && (
          <div className="inline-flex rounded-lg border border-theme bg-surface p-0.5 text-xs font-medium">
            {[
              [null, 'Pending edits'],
              ['live', 'Live post'],
            ].map(([choice, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => targetChoice !== choice && switchTarget(choice)}
                className={`px-3 py-1.5 rounded-md ${targetChoice === choice ? 'bg-primaryGreen text-white' : 'text-muted hover:text-body'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className={`space-y-5 min-w-0 ${mode === 'changes' ? 'hidden' : ''}`}>
          <div className="group relative">
            <textarea
              id={FIELD_IDS.title}
              ref={titleRef}
              rows={1}
              value={form.title}
              maxLength={160}
              disabled={readOnly && !canComment}
              readOnly={readOnly}
              onChange={(e) => onTitle(e.target.value)}
              placeholder="Post title"
              aria-label="Title"
              className="w-full resize-none overflow-hidden bg-transparent pr-16 text-3xl font-bold leading-tight placeholder:text-muted/60 focus:outline-none"
            />
            {(canComment && mode === 'review') || counts.byField.title ? (
              <FieldCommentButton count={counts.byField.title} canAdd={canComment && mode === 'review'} onAdd={() => fieldComment('title')} onShow={() => ws.activate(ws.comments.find((c) => c.field === 'title')?.id, true)} className="absolute -right-2 top-1" />
            ) : null}
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div className="group">
            <label className="admin-label" htmlFor="excerpt">
              Excerpt
              <InfoTip>One or two sentences shown on cards and under the title. Also the default search snippet.</InfoTip>
              {(canComment && mode === 'review') || counts.byField.excerpt ? (
                <FieldCommentButton count={counts.byField.excerpt} canAdd={canComment && mode === 'review'} onAdd={() => fieldComment('excerpt')} onShow={() => ws.activate(ws.comments.find((c) => c.field === 'excerpt')?.id, true)} />
              ) : null}
              <Counter value={form.excerpt} max={320} warnAt={200} />
            </label>
            <textarea
              id={FIELD_IDS.excerpt}
              rows={2}
              className={`admin-input ${counts.byField.excerpt ? 'border-amber-400/60' : ''}`}
              value={form.excerpt}
              maxLength={320}
              disabled={readOnly && !canComment}
              readOnly={readOnly}
              onChange={(e) => set({ excerpt: e.target.value })}
              placeholder="What will readers learn?"
            />
            {errors.excerpt && <p className="text-xs text-red-500 mt-1">{errors.excerpt}</p>}
          </div>
          <div>
            <RichEditor value={form.contentHtml} onChange={(contentHtml) => set({ contentHtml })} editable={!readOnly} resetKey={`${id}:${target}:${resetKey}`} onReady={setEditor} />
            {errors.contentHtml && <p className="text-xs text-red-500 mt-1">{errors.contentHtml}</p>}
          </div>
          <Section title="Key takeaways" info="Up to 8 short points shown in a box at the top of the article.">
            <KeyTakeaways value={form.keyTakeaways} onChange={(keyTakeaways) => set({ keyTakeaways })} disabled={readOnly} />
          </Section>
        </div>
        {mode === 'changes' && post && (
          <div className="min-w-0">
            <ChangesView current={target === 'revision' && rev ? rev : post} baselines={baselines} onReview={() => setView('review')} />
          </div>
        )}
        {canComment && mode === 'review' && <SelectionBubble editor={editor} onComment={(a) => (ws.startTextComment(a), setAsideTab('comments'))} />}

        {/* Side panel */}
        <aside className="space-y-4">
          {hasThread && (
            <div className="grid grid-cols-2 rounded-lg border border-theme bg-surface p-0.5 text-xs font-medium" role="tablist" aria-label="Side panel">
              {[
                ['comments', `Comments${ws.review.comments.length > counts.resolved ? ` (${ws.review.comments.length - counts.resolved})` : ''}`],
                ['details', 'Details'],
              ].map(([t, label]) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={asideTab === t}
                  onClick={() => setAsideTab(t)}
                  className={`rounded-md px-3 py-1.5 transition-colors ${asideTab === t ? 'bg-soft text-body' : 'text-muted hover:text-body'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {showRail ? (
            <div id="review-comments" className="scroll-mt-20 lg:sticky lg:top-[4.75rem] lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto lg:-mr-2 lg:pr-2 pb-2">
              <CommentRail
                comments={ws.comments}
                outdated={ws.outdated}
                me={user}
                pending={ws.pending}
                canComment={canComment}
                perms={railPerms}
                active={ws.active}
                actions={ws.actions}
                onCancelPending={() => ws.setPending(null)}
                onCreate={ws.create}
                onGeneral={() => ws.startFieldComment('general')}
              />
            </div>
          ) : (
          <>
          {canComment && mode !== 'edit' && (
            <p className="text-xs text-muted">Shown as submitted. Switch to Edit to change anything.</p>
          )}
          <div className="admin-card p-4 text-sm space-y-2">
            <Row label="Author">{post?.author?.displayName || 'You'}</Row>
            {post?.publishedAt && <Row label="Published">{formatDate(post.publishedAt)}</Row>}
            {post?.contentUpdatedAt && <Row label="Updated">{formatDate(post.contentUpdatedAt)}</Row>}
            <Row label="Length">
              {words} words · {Math.max(1, Math.round(words / 220))} min
            </Row>
            {post && <Row label="Views">{post.views.toLocaleString()}</Row>}
            {post && post.helpful.yes + post.helpful.no > 0 && (
              <Row label="Helpful">
                {Math.round((post.helpful.yes / (post.helpful.yes + post.helpful.no)) * 100)}% · {post.helpful.yes + post.helpful.no} votes
              </Row>
            )}
          </div>

          <Section title="Cover image">
            <ImagePicker slot="cover" value={form.coverImage} onChange={(coverImage) => set({ coverImage })} disabled={readOnly} info="Shown at the top of the article and on cards." />
          </Section>

          <Section title="Organize">
            <div>
              <label className="admin-label" htmlFor="category">Category</label>
              <select
                id="category"
                className="admin-input"
                value={form.category?.id || ''}
                disabled={readOnly}
                onChange={(e) => set({ category: categories.find((c) => c.id === e.target.value) || null })}
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <span className="admin-label">
                Tags
                <InfoTip>{isAdmin ? 'Pick existing tags or type a new one and press Enter.' : 'Pick from existing tags. Ask an admin to add new ones.'}</InfoTip>
              </span>
              <TagInput value={form.tags} onChange={(tags) => set({ tags })} canCreate={isAdmin} disabled={readOnly} />
            </div>
            <div>
              <label className="admin-label" htmlFor="series">
                Series
                <InfoTip>Optional. Posts with the same series name are linked as “Part 1, 2, 3…” on the blog.</InfoTip>
              </label>
              <div className="flex gap-2">
                <input
                  id="series"
                  className="admin-input flex-1 min-w-0"
                  list="series-names"
                  maxLength={80}
                  placeholder="e.g. Thesis writing from scratch"
                  value={form.series}
                  disabled={readOnly}
                  onChange={(e) => set({ series: e.target.value })}
                />
                <input
                  type="number"
                  className="admin-input w-20"
                  aria-label="Part number"
                  placeholder="Part"
                  min={1}
                  max={99}
                  value={form.seriesOrder ?? ''}
                  disabled={readOnly || !form.series.trim()}
                  onChange={(e) => set({ seriesOrder: e.target.value ? Math.min(99, Math.max(1, Number.parseInt(e.target.value, 10) || 1)) : null })}
                />
              </div>
              <datalist id="series-names">
                {seriesNames.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </Section>

          <Section title="URL & visibility">
            <div>
              <label className="admin-label" htmlFor="slug">
                URL slug
                <InfoTip>
                  {perms.changeSlug
                    ? post?.publishedAt
                      ? 'Changing a live URL keeps the old one working as a redirect.'
                      : 'Generated from the title until you edit it.'
                    : 'Only an admin can change the URL of a published post.'}
                </InfoTip>
              </label>
              <div className="flex items-center rounded-lg border border-theme bg-page focus-within:ring-2 focus-within:ring-primaryGreen/40">
                <span className="pl-3 text-xs text-muted whitespace-nowrap">/blog/</span>
                <input
                  id="slug"
                  className="w-full bg-transparent px-1 py-2 text-sm outline-none disabled:opacity-60"
                  value={form.slug}
                  disabled={readOnly || !perms.changeSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') });
                  }}
                  onBlur={() => set({ slug: slugify(form.slug) || slugify(form.title) })}
                />
              </div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>
            {perms.changeAuthor && (
              <div>
                <label className="admin-label" htmlFor="author">Author</label>
                <select id="author" className="admin-input" value={form.author?.id || ''} disabled={readOnly} onChange={(e) => set({ author: authors.find((a) => a.id === e.target.value) || null })}>
                  {!form.author && <option value="">You</option>}
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>{a?.displayName}{a?.deletedAt ? ' · Removed' : ''}</option>
                  ))}
                </select>
              </div>
            )}
            {perms.changeAuthor && (
              <div>
                <label className="admin-label" htmlFor="reviewed-by">
                  Reviewed by
                  <InfoTip>Subject expert who checked this article. Shown to readers as “Reviewed by …” and builds trust.</InfoTip>
                </label>
                <select id="reviewed-by" className="admin-input" value={form.reviewedBy?.id || ''} disabled={readOnly} onChange={(e) => set({ reviewedBy: authors.find((a) => a.id === e.target.value) || null })}>
                  <option value="">Nobody</option>
                  {authors
                    .filter((a) => a.id !== form.author?.id)
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a?.displayName}{a?.roleTitle ? ` · ${a.roleTitle}` : ''}</option>
                    ))}
                </select>
              </div>
            )}
            {perms.feature && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-primaryGreen" checked={form.featured} disabled={readOnly} onChange={(e) => set({ featured: e.target.checked })} />
                Featured on blog home
                <InfoTip>Only one post can be featured; choosing this one replaces the current pick.</InfoTip>
              </label>
            )}
          </Section>

          <Section title="SEO" defaultOpen={false} info="Optional. Sensible defaults come from the title, excerpt and cover.">
            <SeoPanel form={form} set={set} disabled={readOnly} siteBase={SITE_BASE} />
          </Section>
          </>
          )}
        </aside>
      </div>

      {canComment && (
        <ReviewBar
          writer={writer}
          isEdit={rev?.state === 'in_review'}
          round={ws.review.round}
          drafts={counts.drafts}
          busy={busy}
          publishLabel={publishLabel}
          approveTitle={profileBlock?.approve}
          onRequest={() => setDialog('request')}
          onApprove={() => setDialog('approve')}
          plagiarism={
            <PlagiarismChip
              postId={post.id}
              summary={post.plagiarism}
              dirty={dirty}
              onChange={(summary) => setPost((current) => (current ? { ...current, plagiarism: summary } : current))}
            />
          }
        />
      )}

      {/* Dialogs */}
      <PublishConfirm
        open={dialog === 'approve'}
        onClose={() => setDialog(null)}
        onPublish={() => runAction('approve')}
        onReport={requestReport}
        title={publishLabel}
        summary={post?.plagiarism}
        message={`${rev ? 'The pending edits replace the live article.' : 'The post goes live on the blog right away.'}${
          counts.drafts ? ` Your ${counts.drafts} unsent comment${counts.drafts === 1 ? '' : 's'} will be discarded.` : ''
        }`}
      />
      <ConfirmDialog
        open={dialog === 'request'}
        onClose={() => setDialog(null)}
        onConfirm={(text) => runAction('request-changes', text)}
        title="Request changes"
        message={
          counts.drafts
            ? `${counts.drafts} comment${counts.drafts === 1 ? '' : 's'} will be sent to ${writer}.`
            : 'You have no comments yet. Tell the writer what to change, or close this and select text to comment.'
        }
        confirmLabel="Send to writer"
        input={{ placeholder: counts.drafts ? 'Add an overall note (optional)' : 'What should the writer change?', required: !counts.drafts, minLength: 3 }}
      />
      <ConfirmDialog open={dialog === 'discard'} onClose={() => setDialog(null)} onConfirm={() => runAction('discard-revision')} title="Discard pending edits?" message="The live article stays as it is. This cannot be undone." confirmLabel="Discard" danger />
      <ConfirmDialog open={dialog === 'unpublish'} onClose={() => setDialog(null)} onConfirm={() => runAction('unpublish')} title="Unpublish post?" message="It disappears from the blog and returns to drafts." confirmLabel="Unpublish" danger />
      <ConfirmDialog open={dialog === 'archive'} onClose={() => setDialog(null)} onConfirm={() => runAction('archive')} title="Archive post?" message="Archived posts are hidden from the blog and can be restored later." confirmLabel="Archive" />
      <ConfirmDialog open={dialog === 'delete'} onClose={() => setDialog(null)} onConfirm={remove} title="Move to trash?" message="An admin can restore it from the trash." confirmLabel="Move to trash" danger />

      {dialog === 'history' && <HistoryModal postId={post.id} onClose={() => setDialog(null)} />}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium truncate">{children}</span>
    </div>
  );
}

const TONES = {
  red: 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300',
  rose: 'border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300',
  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300',
  sky: 'border-sky-500/30 bg-sky-500/5 text-sky-800 dark:text-sky-300',
};

function Banner({ tone, icon, children }) {
  const Icon = icon;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-2.5 text-sm ${TONES[tone]}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

/** Writer's view of returned feedback: who asked, how far along they are, and the overall note. */
function FeedbackBanner({ reviewer, total, resolved, mustLeft, note, onShow }) {
  const done = mustLeft === 0;
  return (
    <div className={`rounded-xl border px-4 py-3 ${done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <MessagesSquare className={`w-4 h-4 shrink-0 ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
        <p className="text-sm font-medium">
          {done ? 'All required changes are resolved. Resubmit when you are ready.' : `${reviewer} requested ${total} change${total === 1 ? '' : 's'}.`}
        </p>
        <span className="text-xs text-muted">
          {resolved} of {total} resolved
        </span>
        <span className="flex-1" />
        <button type="button" className="text-xs font-semibold text-primaryGreen hover:underline lg:hidden" onClick={onShow}>
          Show comments
        </button>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div className={`h-full rounded-full transition-[width] duration-300 ${done ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${total ? (resolved / total) * 100 : 0}%` }} />
      </div>
      {note && <p className="mt-2.5 text-sm whitespace-pre-line text-body/90">“{note}”</p>}
    </div>
  );
}

function FieldCommentButton({ count, canAdd, onAdd, onShow, className = '' }) {
  if (count) {
    return (
      <button type="button" onClick={onShow} className={`inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 ${className}`} title="Show comments">
        <MessagesSquare className="w-3 h-3" /> {count}
      </button>
    );
  }
  if (!canAdd) return null;
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAdd}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-muted opacity-0 transition-opacity hover:bg-soft hover:text-body focus:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 ${className}`}
      title="Comment (selected words or the whole field)"
    >
      <MessageSquarePlus className="w-3.5 h-3.5" /> Comment
    </button>
  );
}

/** Sticky footer while reviewing: what will be sent, and the two decisions. */
function ReviewBar({ writer, isEdit, round, drafts, busy, publishLabel, approveTitle, onRequest, onApprove, plagiarism }) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 md:-mx-8 -mb-4 md:-mb-8 mt-8 flex flex-wrap items-center gap-3 border-t border-theme bg-soft/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1">
        {plagiarism}
      <p className="min-w-0 text-sm">
        <span className="font-medium">Reviewing {writer}&rsquo;s {isEdit ? 'edits' : 'post'}</span>
        <span className="text-muted">
          {round > 1 ? ` · Round ${round}` : ''}
          {drafts ? ` · ${drafts} comment${drafts === 1 ? '' : 's'} ready to send` : ''}
        </span>
      </p>
      </div>
      <button type="button" className="admin-btn-secondary" disabled={!!busy} onClick={onRequest}>
        {busy === 'request-changes' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareWarning className="w-4 h-4" />}
        Request changes
      </button>
      <button type="button" className="admin-btn-primary" disabled={!!busy || !!approveTitle} title={approveTitle || undefined} onClick={onApprove}>
        {busy === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {publishLabel}
      </button>
    </div>
  );
}

function HistoryModal({ postId, onClose }) {
  const list = useInfiniteList((cursor) => cmsApi.postHistory(postId, { cursor }), (d) => d.history, postId);
  const items = list.loading ? null : list.items;

  return (
    <Modal open onClose={onClose} title="History" size="sm">
      {list.error && !list.items.length ? (
        <p className="text-sm text-red-500">{list.error}</p>
      ) : !items ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No activity yet.</p>
      ) : (
        <ol className="relative border-l border-theme ml-2 space-y-4">
          {items.map((h) => (
            <li key={h.id} className="ml-4">
              <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-surface bg-primaryGreen" />
              <p className="text-sm">
                <span className="font-medium">{h.actor?.name || 'Someone'}</span> {ACTION_LABELS[h.action] || h.action} this post
                {h.meta?.target === 'revision' && <span className="text-muted"> (pending edits)</span>}
                {h.meta?.comments > 0 && <span className="text-muted"> with {h.meta.comments} comment{h.meta.comments === 1 ? '' : 's'}</span>}
                {h.meta?.round > 1 && <span className="text-muted"> (round {h.meta.round})</span>}
              </p>
              {h.meta?.note && <p className="text-xs text-muted mt-0.5 whitespace-pre-line">“{h.meta.note}”</p>}
              <p className="text-xs text-muted">{new Date(h.at).toLocaleString()}</p>
            </li>
          ))}
        </ol>
      )}
      <LoadMore list={list} noun="events" />
    </Modal>
  );
}
