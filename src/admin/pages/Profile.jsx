import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { userApi } from '../api/client';

function Message({ msg }) {
  if (!msg) return null;
  return (
    <p className={`text-sm ${msg.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
      {msg.text}
    </p>
  );
}

export default function Profile() {
  const { user, setUser, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [profileMsg, setProfileMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const errorText = (err) => err.data?.details?.[0]?.message || err.message;

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const data = await userApi.updateMe({ name: name.trim() });
      setUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: errorText(err) });
    } finally {
      setSavingProfile(false);
    }
  };

  const onLogoutAll = async () => {
    await logoutAll();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      <form onSubmit={saveProfile} className="bg-surface border border-theme rounded-xl p-5 space-y-4">
        <h2 className="font-medium">Details</h2>
        <label className="block">
          <span className="text-sm text-muted">Name</span>
          <input className="admin-input mt-1" required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm text-muted">Email</span>
          <input className="admin-input mt-1" value={user.email} disabled />
        </label>
        <Message msg={profileMsg} />
        <button className="admin-btn-primary" disabled={savingProfile || !name.trim() || name.trim() === user.name}>
          {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </button>
      </form>

      <div className="bg-surface border border-theme rounded-xl p-5 space-y-3">
        <h2 className="font-medium">Sessions</h2>
        <p className="text-sm text-muted">Sign out of every device, including this one.</p>
        <button className="admin-btn-secondary" onClick={onLogoutAll}>Sign out everywhere</button>
      </div>
    </div>
  );
}
