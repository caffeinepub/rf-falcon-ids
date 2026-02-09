import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

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
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur border-border shadow-glow">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
            <Search className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-3xl font-display text-foreground">Page Not Found</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoHome}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-glow"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" aria-hidden="true" />
            {isAuthenticated ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
