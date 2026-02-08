import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Globe, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wider">Sign In</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Secure authentication with Internet Identity
          </p>
        </div>

        <Card className="bg-card/80 border-chrome-300/20 shadow-chrome-glow">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border-2 border-chrome-300/30 shadow-chrome-glow">
              <Shield className="w-8 h-8 text-chrome-300" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl tracking-wide">Internet Identity</CardTitle>
            <CardDescription className="text-base">
              Decentralized authentication for secure access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 bg-chrome-300 hover:bg-chrome-200 text-black font-semibold text-base shadow-chrome-glow"
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
              <Card className="bg-card/60 border-chrome-300/10">
                <CardContent className="pt-4 space-y-2">
                  <Lock className="w-6 h-6 text-chrome-300 mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm text-center">Secure</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    No passwords to remember or manage
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-chrome-300/10">
                <CardContent className="pt-4 space-y-2">
                  <Globe className="w-6 h-6 text-chrome-300 mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm text-center">Decentralized</h3>
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
