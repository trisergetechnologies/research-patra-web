import React, { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import './admin.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import AdminLayout from './layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import ReviewQueue from './pages/ReviewQueue';
import PlagiarismReport from './pages/PlagiarismReport';
import Media from './pages/Media';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Subscribers from './pages/Subscribers';
import AuthorProfile from './pages/AuthorProfile';
import { ROLES } from './roles';

// The editor pulls in TipTap/ProseMirror; load it only when someone opens a post.
const PostEditor = lazy(() => import('./pages/PostEditor'));

const Loading = () => (
  <div className="py-20 flex justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-muted" />
  </div>
);

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.STAFF]} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="posts" element={<Posts />} />
              <Route
                path="posts/:id"
                element={
                  <Suspense fallback={<Loading />}>
                    <PostEditor />
                  </Suspense>
                }
              />
              <Route path="media" element={<Media />} />
              <Route path="author" element={<AuthorProfile />} />
              <Route path="profile" element={<Profile />} />
              <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
                <Route path="posts/:id/plagiarism" element={<PlagiarismReport />} />
                <Route path="review" element={<ReviewQueue />} />
                <Route path="categories" element={<Categories />} />
                <Route path="tags" element={<Tags />} />
                <Route path="subscribers" element={<Subscribers />} />
                <Route path="users" element={<Users />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
