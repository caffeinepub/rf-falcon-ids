import { useNavigate } from '@tanstack/react-router';
import AuthStatusButton from './AuthStatusButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { Shield, Terminal } from 'lucide-react';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const isAuthenticated = !!identity;

  return (
    <header className="border-b border-chrome-300/20 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/falcon-ids-logo-transparent.dim_1200x300.png"
            alt="Falcon IDs"
            className="h-12 w-auto"
          />
        </button>
        <nav className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <button
                onClick={() => navigate({ to: '/dashboard' })}
                className="text-sm text-muted-foreground hover:text-chrome-200 transition-colors font-medium tracking-wide"
              >
                Dashboard
              </button>
              {adminLoading ? (
                <div className="text-sm text-cyber-primary/50 flex items-center gap-1 font-mono">
                  <Terminal className="w-3 h-3 animate-pulse" />
                  <span className="text-xs">...</span>
                </div>
              ) : isAdmin ? (
                <button
                  onClick={() => navigate({ to: '/admin' })}
                  className="text-sm text-cyber-primary hover:text-cyber-accent transition-colors flex items-center gap-1 font-mono tracking-wider"
                >
                  <Shield className="w-4 h-4" />
                  ADMIN
                </button>
              ) : null}
            </>
          )}
          <AuthStatusButton />
        </nav>
      </div>
    </header>
  );
}
