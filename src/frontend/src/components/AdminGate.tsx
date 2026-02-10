import { type ReactNode, useEffect, useState } from 'react';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { ShieldAlert, Terminal } from 'lucide-react';
import BackendConnectionErrorScreen from './BackendConnectionErrorScreen';
import { getRuntimeConfigDiagnostics, type RuntimeConfigDiagnostics } from '../utils/runtimeConfig';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin, isLoading, isFetched, isError, error, isActorUnavailable, retryActor } = useIsAdmin();
  const [diagnostics, setDiagnostics] = useState<RuntimeConfigDiagnostics | null>(null);

  // Load diagnostics asynchronously
  useEffect(() => {
    getRuntimeConfigDiagnostics(isAuthenticated).then(setDiagnostics);
  }, [isAuthenticated]);

  // Show error state when actor is unavailable or there's a connection error
  if (isActorUnavailable || (isError && !isLoading)) {
    if (!diagnostics) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Terminal className="w-12 h-12 mx-auto text-primary animate-pulse" />
            <div className="text-primary font-mono text-sm tracking-wider">
              [LOADING DIAGNOSTICS...]
            </div>
          </div>
        </div>
      );
    }

    return (
      <BackendConnectionErrorScreen
        diagnostics={diagnostics}
        connectivityState="unreachable"
        connectivityMessage="Unable to verify admin credentials. Backend connection is unavailable."
        onRetry={retryActor}
        isRetrying={isLoading}
        canRetry={true}
      />
    );
  }

  // Show loading state
  if (isLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Terminal className="w-12 h-12 mx-auto text-primary animate-pulse" />
          <div className="text-primary font-mono text-sm tracking-wider">
            [VERIFYING ADMIN CREDENTIALS...]
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admins (only after successful check)
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md space-y-6">
          <div className="flex justify-center">
            <ShieldAlert className="w-20 h-20 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have administrator privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

