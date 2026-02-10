import { type ReactNode, useEffect, useState } from 'react';
import { useBackendConnectivity } from '../hooks/useBackendConnectivity';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Terminal } from 'lucide-react';
import BackendConnectionErrorScreen from './BackendConnectionErrorScreen';
import { getRuntimeConfigDiagnostics, type RuntimeConfigDiagnostics } from '../utils/runtimeConfig';

interface BackendGateProps {
  children: ReactNode;
  loadingMessage?: string;
}

export default function BackendGate({ children, loadingMessage }: BackendGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const connectivity = useBackendConnectivity();
  const isAuthenticated = !!identity;
  const [diagnostics, setDiagnostics] = useState<RuntimeConfigDiagnostics | null>(null);

  // Load diagnostics asynchronously
  useEffect(() => {
    getRuntimeConfigDiagnostics(isAuthenticated).then(setDiagnostics);
  }, [isAuthenticated, connectivity.state]);

  // Wait for identity initialization to complete
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Terminal className="w-12 h-12 mx-auto text-primary animate-pulse" />
          <div className="text-primary font-mono text-sm tracking-wider">
            [INITIALIZING AUTHENTICATION...]
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while connecting
  if (connectivity.state === 'connecting') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Terminal className="w-12 h-12 mx-auto text-primary animate-pulse" />
          <div className="text-primary font-mono text-sm tracking-wider">
            {loadingMessage || '[INITIALIZING BACKEND CONNECTION...]'}
          </div>
        </div>
      </div>
    );
  }

  // Show error state for misconfigured, unreachable, or unhealthy
  if (connectivity.state !== 'connected') {
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
        connectivityState={connectivity.state}
        connectivityMessage={connectivity.message}
        onRetry={connectivity.retry}
        isRetrying={connectivity.isRetrying}
        canRetry={connectivity.canRetry}
      />
    );
  }

  return <>{children}</>;
}

