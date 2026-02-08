import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import AuthStatusButton from './AuthStatusButton';

export default function BrandHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  const navItems = [
    { label: 'Home', path: '/', show: true },
    { label: 'About', path: '/about', show: true },
    { label: 'Features', path: '/features', show: true },
    { label: 'Contact', path: '/contact', show: true },
    { label: 'Dashboard', path: '/dashboard', show: isAuthenticated },
    { label: 'Admin', path: '/admin', show: isAdmin },
  ];

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 shadow-sm" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('/')}
            className="text-xl sm:text-2xl font-display font-bold tracking-tight text-foreground hover:text-primary transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md px-2 py-1"
            aria-label="Falcon IDs home"
          >
            Falcon IDs
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3" aria-label="Main navigation">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  variant={location.pathname === item.path ? 'default' : 'ghost'}
                  className={
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }
                  size="sm"
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  {item.label}
                </Button>
              ))}
            <AuthStatusButton />
          </nav>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <AuthStatusButton />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary hover:bg-accent h-10 w-10"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-card">
                <SheetHeader>
                  <SheetTitle className="text-left font-display text-xl text-foreground">
                    Navigation
                  </SheetTitle>
                </SheetHeader>
                <nav id="mobile-navigation" className="flex flex-col gap-2 mt-6" aria-label="Mobile navigation">
                  {navItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <Button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        variant={location.pathname === item.path ? 'default' : 'ghost'}
                        className={`justify-start h-12 text-base ${
                          location.pathname === item.path
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                        aria-current={location.pathname === item.path ? 'page' : undefined}
                      >
                        {item.label}
                      </Button>
                    ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
