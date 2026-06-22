import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { PageLoader } from '@/components/ui/Spinner';

/** Guards routes that require authentication (and optionally the ADMIN role). */
export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, status } = useAuthStore();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') return <PageLoader label="Checking your session…" />;

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
