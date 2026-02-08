import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ErrorPageProps {
  error?: Error;
  reset?: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    } else {
      navigate({ to: '/' });
    }
  };

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  // Don't show sensitive error details in production
  const isDevelopment = import.meta.env.DEV;
  const errorMessage = error?.message || 'An unexpected error occurred';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-card/80 border-chrome-300/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-wide mb-2">
              Something Went Wrong
            </CardTitle>
            <CardDescription className="text-base">
              We encountered an unexpected error while processing your request.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDevelopment && error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-xs font-mono text-red-300 break-words">
                {errorMessage}
              </p>
            </div>
          )}
          <p className="text-sm text-chrome-300 text-center">
            Please try again or return to the home page. If the problem persists, contact support.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
