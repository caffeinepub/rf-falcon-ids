import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { getRuntimeConfigDiagnostics, type RuntimeConfigDiagnostics } from '../utils/runtimeConfig';
import { useEffect, useState } from 'react';
import BackendConnectionErrorScreen from '../components/BackendConnectionErrorScreen';

export default function ErrorPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const isAuthenticated = !!identity;
  const [diagnostics, setDiagnostics] = useState<RuntimeConfigDiagnostics | null>(null);

  const error = routerState.matches.find((match) => match.error)?.error;
  const isDev = import.meta.env.DEV;

  // Load diagnostics asynchronously
  useEffect(() => {
    getRuntimeConfigDiagnostics(isAuthenticated).then(setDiagnostics);
  }, [isAuthenticated]);

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    } else {
      navigate({ to: '/' });
    }
  };

  const handleRetry = () => {
    // Invalidate all queries to retry
    queryClient.invalidateQueries();
    // Reload the page as a fallback
    window.location.reload();
  };

  // Extract error details while preserving context
  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errorCause = error instanceof Error ? (error as any).cause : undefined;

  // Log full error context to console for debugging
  if (error) {
    console.error('[ErrorPage] Rendering error boundary:', {
      error,
      message: errorMessage,
      stack: errorStack,
      cause: errorCause,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if this is a configuration error - if so, show the dedicated screen
  if (diagnostics && (diagnostics.isBackendCanisterIdMissing || diagnostics.isBackendCanisterIdInvalid)) {
    return (
      <BackendConnectionErrorScreen
        diagnostics={diagnostics}
        connectivityState="misconfigured"
        connectivityMessage="Backend configuration error"
        onRetry={handleRetry}
        isRetrying={false}
        canRetry={false}
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-card/90 backdrop-blur border-border shadow-glow">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/30">
            <AlertTriangle className="w-10 h-10 text-destructive" aria-hidden="true" />
          </div>
          <CardTitle className="text-3xl font-display text-foreground">Something Went Wrong</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            We encountered an unexpected error. Please try again or return home.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1 h-12 border-border hover:bg-accent hover:text-accent-foreground font-semibold"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
              Try Again
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" aria-hidden="true" />
              {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
            </Button>
          </div>

          {diagnostics && (
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
                  <span className="text-muted-foreground">Configuration Source:</span>
                  <span className="font-mono text-foreground">
                    {diagnostics.source === 'build-time' && 'Build-time environment'}
                    {diagnostics.source === 'runtime-file' && 'Runtime config file'}
                    {diagnostics.source === 'none' && 'Not configured'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-muted-foreground">Backend Canister ID:</span>
                  <span className="font-mono text-xs text-foreground break-all bg-background/50 p-2 rounded border border-border">
                    {diagnostics.backendCanisterId || '(not set)'}
                  </span>
                </div>
              </div>
            </details>
          )}

          {isDev && error ? (
            <details className="p-4 bg-muted/50 rounded-lg border border-border">
              <summary className="cursor-pointer font-semibold text-sm text-foreground mb-2">
                Error Details (Development Only)
              </summary>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Message:</p>
                  <pre className="text-xs text-foreground overflow-auto max-h-24 whitespace-pre-wrap break-words bg-background/50 p-2 rounded">
                    {errorMessage}
                  </pre>
                </div>
                {errorStack && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Stack:</p>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap break-words bg-background/50 p-2 rounded">
                      {errorStack}
                    </pre>
                  </div>
                )}
                {errorCause && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Cause:</p>
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-24 whitespace-pre-wrap break-words bg-background/50 p-2 rounded">
                      {errorCause instanceof Error ? errorCause.message : String(errorCause)}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
