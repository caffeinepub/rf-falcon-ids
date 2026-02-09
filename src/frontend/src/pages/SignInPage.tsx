import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Globe, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminCheckLoading, isFetched: adminCheckFetched } = useIsAdmin();

  useEffect(() => {
    // Wait for both identity and admin check to complete before redirecting
    if (identity && adminCheckFetched && !adminCheckLoading) {
      // Route admins to home, non-admins to dashboard
      if (isAdmin) {
        navigate({ to: '/' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [identity, isAdmin, adminCheckLoading, adminCheckFetched, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Sign In</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Secure authentication with Internet Identity
          </p>
        </div>

        <Card className="bg-card/90 backdrop-blur border-border shadow-glow">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-2 border-primary/30 shadow-glow">
              <Shield className="w-8 h-8 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl tracking-wide text-foreground">Internet Identity</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Decentralized authentication for secure access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-glow"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />
                  Connecting...
                </>
              ) : (
                'Sign In with Internet Identity'
              )}
            </Button>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-4 space-y-2">
                  <Lock className="w-6 h-6 text-primary mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm text-center text-foreground">Secure</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    No passwords to remember or manage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-border/50">
                <CardContent className="pt-4 space-y-2">
                  <Globe className="w-6 h-6 text-primary mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm text-center text-foreground">Decentralized</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Your identity, your control
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
