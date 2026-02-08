import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function NotFoundPage() {
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

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-card/80 border-chrome-300/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-chrome-300/10 flex items-center justify-center">
            <Search className="w-10 h-10 text-chrome-300" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-wide mb-2">
              404 - Page Not Found
            </CardTitle>
            <CardDescription className="text-base">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-chrome-300 text-center">
            You may have mistyped the address or the page may have been removed.
          </p>
          <Button
            onClick={handleGoHome}
            className="w-full"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
