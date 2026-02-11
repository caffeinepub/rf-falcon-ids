import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Settings, WifiOff } from 'lucide-react';
import { type RuntimeConfigDiagnostics } from '../utils/runtimeConfig';
import type { ConnectivityState } from '../utils/backendConnectivity';

interface BackendConnectionErrorScreenProps {
  diagnostics: RuntimeConfigDiagnostics;
  connectivityState: ConnectivityState;
  connectivityMessage: string;
  onRetry: () => void;
  isRetrying?: boolean;
  canRetry?: boolean;
}

export default function BackendConnectionErrorScreen({
  diagnostics,
  connectivityState,
  connectivityMessage,
  onRetry,
  isRetrying = false,
  canRetry = true,
}: BackendConnectionErrorScreenProps) {
  const isMisconfigured = connectivityState === 'misconfigured';
  const isUnreachable = connectivityState === 'unreachable';
  const isUnhealthy = connectivityState === 'unhealthy';

  // Determine icon and title based on state
  const getIcon = () => {
    if (isMisconfigured) return <Settings className="w-10 h-10 text-destructive" aria-hidden="true" />;
    if (isUnreachable) return <WifiOff className="w-10 h-10 text-destructive" aria-hidden="true" />;
    return <AlertTriangle className="w-10 h-10 text-destructive" aria-hidden="true" />;
  };

  const getTitle = () => {
    if (isMisconfigured) return 'Configuration Error';
    if (isUnreachable) return 'Connection Error';
    if (isUnhealthy) return 'Service Unavailable';
    return 'Backend Error';
  };

  const getDescription = () => {
    if (diagnostics.isBackendCanisterIdMissing) {
      return 'The backend canister ID is not configured. The deployment must inject this value before the application can connect to the backend service.';
    }
    if (diagnostics.isBackendCanisterIdInvalid) {
      return 'The backend canister ID format is invalid. It must be a valid Internet Computer principal ID.';
    }
    if (isUnreachable) {
      return 'Unable to connect to the backend service. Please check your connection and try again.';
    }
    if (isUnhealthy) {
      return 'The backend service is not responding correctly. Please try again in a moment.';
    }
    return connectivityMessage;
  };

  // Defensively ensure retry is not shown for misconfigured state
  const shouldShowRetry = canRetry && !isMisconfigured;

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-2xl bg-card/90 backdrop-blur border-border shadow-glow">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/30">
            {getIcon()}
          </div>
          <CardTitle className="text-3xl font-display text-foreground">{getTitle()}</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {getDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {shouldShowRetry && (
            <div className="flex justify-center">
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="default"
                size="lg"
                className="gap-2 min-w-[200px]"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Connection'}
              </Button>
            </div>
          )}

          <details className="p-4 bg-muted/50 rounded-lg border border-border">
            <summary className="cursor-pointer font-semibold text-sm text-foreground mb-3">
              Diagnostics
            </summary>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Environment:</span>
                <span className="font-mono text-foreground">{diagnostics.environment}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Authentication Status:</span>
                <span className="font-mono text-foreground">
                  {diagnostics.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Connectivity State:</span>
                <span className="font-mono text-foreground">{connectivityState}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Configuration Source:</span>
                <span className="font-mono text-foreground">
                  {diagnostics.source === 'build-time' && 'Build-time environment'}
                  {diagnostics.source === 'runtime-file' && 'Runtime config file (/runtime-config.json)'}
                  {diagnostics.source === 'none' && 'Not configured'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Runtime Config Attempted:</span>
                <span className="font-mono text-foreground">
                  {diagnostics.runtimeConfigAttempted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Runtime Config Loaded:</span>
                <span className="font-mono text-foreground">
                  {diagnostics.runtimeConfigLoaded ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex flex-col gap-1 py-1">
                <span className="text-muted-foreground">Backend Canister ID:</span>
                <span className="font-mono text-xs text-foreground break-all bg-background/50 p-2 rounded border border-border">
                  {diagnostics.backendCanisterId || '(not set)'}
                </span>
              </div>
              {diagnostics.validationError && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-foreground">
                  <p className="font-semibold mb-1">Validation Error:</p>
                  <p>{diagnostics.validationError}</p>
                </div>
              )}
              {isMisconfigured && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-foreground">
                  <p className="font-semibold mb-2">How to Fix:</p>
                  {diagnostics.source === 'none' && (
                    <>
                      <p className="mb-2 font-semibold">For Static Hosting (cPanel, etc.):</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2 mb-3">
                        <li>
                          Locate the file <code className="bg-background/50 px-1 rounded">/runtime-config.json</code> in your deployed site
                        </li>
                        <li>
                          Edit the file and set <code className="bg-background/50 px-1 rounded">backendCanisterId</code> to your backend canister principal ID
                        </li>
                        <li>Save the file and reload this page</li>
                      </ol>
                      <p className="mb-2 font-semibold">For IC Deployment:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          Set <code className="bg-background/50 px-1 rounded">VITE_BACKEND_CANISTER_ID</code> environment variable to a valid backend canister principal ID
                        </li>
                        <li>Rebuild the frontend with the correct configuration</li>
                        <li>Redeploy the application</li>
                      </ol>
                    </>
                  )}
                  {diagnostics.source === 'build-time' && diagnostics.isBackendCanisterIdInvalid && (
                    <>
                      <p className="mb-2">The build-time environment variable contains an invalid principal ID.</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Verify your backend canister ID is correct</li>
                        <li>
                          Set <code className="bg-background/50 px-1 rounded">VITE_BACKEND_CANISTER_ID</code> to a valid IC principal (format: xxxxx-xxxxx-xxxxx-xxxxx-xxx)
                        </li>
                        <li>Rebuild and redeploy the application</li>
                      </ol>
                    </>
                  )}
                  {diagnostics.source === 'runtime-file' && diagnostics.isBackendCanisterIdInvalid && (
                    <>
                      <p className="mb-2">The runtime configuration file contains an invalid principal ID.</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>
                          Edit <code className="bg-background/50 px-1 rounded">/runtime-config.json</code> in your deployed site
                        </li>
                        <li>
                          Set <code className="bg-background/50 px-1 rounded">backendCanisterId</code> to a valid IC principal (format: xxxxx-xxxxx-xxxxx-xxxxx-xxx)
                        </li>
                        <li>Save the file and reload this page</li>
                      </ol>
                    </>
                  )}
                </div>
              )}
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
