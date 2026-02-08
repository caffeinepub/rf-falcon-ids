import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const routerState = useRouterState();
  const isAuthenticated = !!identity;

  const error = routerState.matches.find((match) => match.error)?.error;
  const isDev = import.meta.env.DEV;

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    } else {
      navigate({ to: '/' });
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
  const errorStack = error instanceof Error ? error.stack : undefined;

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

          {isDev && error ? (
            <details className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <summary className="cursor-pointer font-semibold text-sm text-foreground mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-words">
                {errorMessage}
                {errorStack && `\n\n${errorStack}`}
              </pre>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
