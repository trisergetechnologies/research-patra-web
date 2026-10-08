import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-muted">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}

export default function ProtectedRoute({ roles }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageLoader />;
  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
