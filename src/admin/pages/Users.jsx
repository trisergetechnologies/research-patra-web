import React, { useEffect, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { adminApi } from '../api/client';
import { useAuth } from '../context/useAuth';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { ROLES, ROLE_LABELS } from '../roles';
import InfoTip from '../components/ui/InfoTip';
import LoadMore from '../components/ui/LoadMore';

const EMPTY_FORM = { name: '', email: '', role: ROLES.STAFF };

const LIMIT = 30;

export default function Users() {
  const { user: me } = useAuth();
  const [actionError, setActionError] = useState('');
  const [filters, setFilters] = useState({ q: '', role: '' });
  const [query, setQuery] = useState(filters);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const list = useInfiniteList((cursor) => adminApi.listUsers({ ...query, limit: LIMIT, cursor }), (d) => d.users, JSON.stringify(query));
  const { items: users, setItems: setUsers, loading, reload: load } = list;
  const error = actionError || (users.length ? '' : list.error);

  useEffect(() => {
    const t = setTimeout(() => setQuery(filters), 250);
    return () => clearTimeout(t);
  }, [filters]);

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await adminApi.createUser(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.data?.details?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = async (id, patch) => {
    setActionError('');
    try {
      const { user } = await adminApi.updateUser(id, patch);
      setUsers((rows) => rows.map((u) => (u.id === id ? user : u)));
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button className="admin-btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New user'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="bg-surface border border-theme rounded-xl p-5 mb-6 grid gap-4 md:grid-cols-3">
          <input className="admin-input" placeholder="Name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="admin-input" placeholder="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value={ROLES.STAFF}>Staff</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
          {formError && <p className="text-sm text-red-600 dark:text-red-400 md:col-span-3">{formError}</p>}
          <div className="md:col-span-3 flex items-center gap-2">
            <button type="submit" className="admin-btn-primary" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create user
            </button>
            <InfoTip>No password needed. They sign in with a one-time code sent to this email.</InfoTip>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input className="admin-input sm:max-w-xs" placeholder="Search name or email" value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <select className="admin-input sm:max-w-[10rem]" value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All roles</option>
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <div className="bg-surface border border-theme rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted border-b border-theme">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last login</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted"><Loader2 className="w-5 h-5 animate-spin inline" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No users found</td></tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === me.id;
                return (
                  <tr key={u.id} className="border-b border-theme last:border-0">
                    <td className="px-4 py-3">{u.name}{isSelf && <span className="text-muted"> (you)</span>}</td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <select className="admin-input py-1" value={u.role} disabled={isSelf}
                        onChange={(e) => update(u.id, { role: e.target.value })}>
                        {Object.values(ROLES).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button disabled={isSelf} onClick={() => update(u.id, { isActive: !u.isActive })}
                        className={`text-xs font-medium px-2 py-1 rounded-full disabled:opacity-60 ${
                          u.isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <LoadMore list={list} total={list.meta?.total} noun="users" />
    </div>
  );
}
