import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AuthStatusButton from './AuthStatusButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { Shield, Terminal, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const isAuthenticated = !!identity;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-chrome-300/20 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        <button
          onClick={() => handleNavigation('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0"
        >
          <img
            src="/assets/generated/falcon-ids-wordmark-gothic-transparent.dim_1200x300.png"
            alt="Falcon IDs"
            className="h-10 sm:h-12 w-auto"
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNavigation('/dashboard')}
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
                  onClick={() => handleNavigation('/admin')}
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <AuthStatusButton />
          {isAuthenticated && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-chrome-300">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-chrome-300/20 w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={() => handleNavigation('/dashboard')}
                    className="text-left text-base text-muted-foreground hover:text-chrome-200 transition-colors font-medium tracking-wide py-2"
                  >
                    Dashboard
                  </button>
                  {adminLoading ? (
                    <div className="text-sm text-cyber-primary/50 flex items-center gap-2 font-mono py-2">
                      <Terminal className="w-4 h-4 animate-pulse" />
                      <span>Loading...</span>
                    </div>
                  ) : isAdmin ? (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="text-left text-base text-cyber-primary hover:text-cyber-accent transition-colors flex items-center gap-2 font-mono tracking-wider py-2"
                    >
                      <Shield className="w-5 h-5" />
                      ADMIN
                    </button>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
