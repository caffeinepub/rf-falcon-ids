import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export default function AuthStatusButton() {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';
  const disabled = isLoggingIn;

  return (
    <Button
      onClick={handleAuth}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      disabled={disabled}
      className={isAuthenticated ? 'border-border hover:bg-accent hover:text-accent-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow'}
    >
      {isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
          Sign Out
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
          {isLoggingIn ? 'Connecting...' : 'Sign In'}
        </>
      )}
    </Button>
  );
}
