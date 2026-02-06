import { type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useSessionAuth } from '../hooks/auth/useSessionAuth';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useSessionAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse text-cyan-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="w-20 h-20 text-cyan-400" />
              <Lock className="w-8 h-8 text-purple-400 absolute bottom-0 right-0" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">
            You must be signed in to access this area. Please sign in with your username and password.
          </p>
          <Button
            onClick={() => navigate({ to: '/signin' })}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
