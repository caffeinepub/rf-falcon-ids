import { useNavigate } from '@tanstack/react-router';
import { useSessionAuth } from '../hooks/auth/useSessionAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

export default function AuthStatusButton() {
  const navigate = useNavigate();
  const { isAuthenticated, signOut, username } = useSessionAuth();
  const queryClient = useQueryClient();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await signOut();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      navigate({ to: '/signin' });
    }
  };

  return (
    <Button
      onClick={handleAuth}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="sm"
      className={isAuthenticated ? '' : 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500'}
    >
      {isAuthenticated ? (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out {username && `(${username})`}
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </>
      )}
    </Button>
  );
}
