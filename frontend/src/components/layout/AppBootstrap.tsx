import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

/**
 * Root element rendered by the router. Restores the user's session once on
 * load (silent refresh) before the rest of the app renders route content.
 */
export function AppBootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'idle') void bootstrap();
  }, [status, bootstrap]);

  return <Outlet />;
}
