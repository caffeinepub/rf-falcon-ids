import { useNavigate } from '@tanstack/react-router';
import AuthStatusButton from './AuthStatusButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { Shield } from 'lucide-react';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/rf-falcon-ids-logo.dim_1200x300.png"
            alt="RF-FALCON-IDS"
            className="h-10 w-auto"
          />
        </button>
        <nav className="flex items-center gap-4">
          {identity && (
            <>
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate({ to: '/admin' })}
                  className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              )}
            </>
          )}
          <AuthStatusButton />
        </nav>
      </div>
    </header>
  );
}
