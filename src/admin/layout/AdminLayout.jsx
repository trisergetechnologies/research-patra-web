import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCircle, LogOut, Menu, X, FileText, Inbox, Images, FolderTree, Tags, PenSquare, Mail,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { ROLES, ROLE_LABELS } from '../roles';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { group: 'Blog' },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/review', label: 'Review queue', icon: Inbox, roles: [ROLES.ADMIN] },
  { to: '/admin/media', label: 'Media', icon: Images },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree, roles: [ROLES.ADMIN] },
  { to: '/admin/tags', label: 'Tags', icon: Tags, roles: [ROLES.ADMIN] },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Mail, roles: [ROLES.ADMIN] },
  { to: '/admin/author', label: 'Author profile', icon: PenSquare },
  { group: 'Account' },
  { to: '/admin/users', label: 'Users', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
];

export default function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const items = NAV.filter((n) => !n.roles || hasRole(...n.roles));

  return (
    <div className="min-h-screen bg-soft text-body flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-surface border-r border-theme flex flex-col transition-transform md:translate-x-0 md:sticky md:top-0 md:h-screen ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-theme">
          <span className="font-semibold">
            Research <span className="text-primaryGreen">Patra</span>
          </span>
          <button className="md:hidden text-muted" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) =>
            item.group ? (
              <p key={item.group} className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/80">
                {item.group}
              </p>
            ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-primaryGreen/10 text-primaryGreen font-medium' : 'text-muted hover:bg-soft hover:text-body'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
            )
          )}
        </nav>
        <div className="p-3 border-t border-theme">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:bg-soft hover:text-body"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-surface border-b border-theme flex items-center justify-between px-4 md:px-8">
          <button className="md:hidden text-muted" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-xs text-muted leading-tight">{user?.email}</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primaryGreen/10 text-primaryGreen">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
