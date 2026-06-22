import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="text-center">
        <p className="font-display text-7xl font-extrabold text-brand">404</p>
        <h1 className="mt-3 text-2xl font-extrabold">Page not found</h1>
        <p className="mt-2 max-w-sm text-ink-muted">The page you're looking for may have been moved, sold or never existed.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-primary"><Compass className="h-4 w-4" /> Go home</Link>
          <Link to="/buy" className="btn-outline">Browse bikes</Link>
        </div>
      </div>
    </div>
  );
}
