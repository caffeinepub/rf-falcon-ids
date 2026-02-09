import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { useCart } from '../hooks/cart/useCart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingCart, Shield, Loader2 } from 'lucide-react';
import AuthStatusButton from './AuthStatusButton';

export default function BrandHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsAdmin();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/features', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  const authenticatedLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
      ]
    : [];

  const allLinks = [...publicLinks, ...authenticatedLinks];

  const handleLinkClick = (to: string) => {
    setMobileMenuOpen(false);
    navigate({ to });
  };

  // Show admin link when authenticated and either admin check is loading or user is admin
  const showAdminLink = isAuthenticated && (adminCheckLoading || isAdmin);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          RF FALCON IDS
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {authenticatedLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {showAdminLink && (
            <Link
              to="/admin"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              {adminCheckLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Admin</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Admin</span>
                </>
              )}
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/cart' })}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          )}
          <AuthStatusButton />
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center space-x-2">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/cart' })}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {allLinks.map((link) => (
                  <button
                    key={link.to}
                    onClick={() => handleLinkClick(link.to)}
                    className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
                {showAdminLink && (
                  <button
                    onClick={() => handleLinkClick('/admin')}
                    className="text-left text-lg font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    {adminCheckLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" aria-hidden="true" />
                        <span>Admin</span>
                      </>
                    )}
                  </button>
                )}
                <div className="pt-4 border-t border-border">
                  <AuthStatusButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
