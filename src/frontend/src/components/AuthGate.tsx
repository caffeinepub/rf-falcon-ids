import { type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';

interface AuthGateProps {
  children: ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
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
            You must be signed in to access this area. Please authenticate using Internet Identity.
          </p>
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {loginStatus === 'logging-in' ? 'Connecting...' : 'Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
