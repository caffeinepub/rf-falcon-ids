import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Lock, Key, Globe } from 'lucide-react';

export default function SignInPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  const handleSignIn = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="max-w-lg w-full bg-card/80 border-chrome-300/20 shadow-glow">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20 shadow-chrome-glow">
            <Shield className="w-10 h-10 text-chrome-300" />
          </div>
          <CardTitle className="text-3xl">Sign In</CardTitle>
          <CardDescription className="text-base">
            Authenticate securely with Internet Identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-chrome-900/30 rounded border border-chrome-300/10">
              <Lock className="w-5 h-5 text-chrome-400 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">Private & Secure:</strong> No passwords to remember or store
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-chrome-900/30 rounded border border-chrome-300/10">
              <Key className="w-5 h-5 text-chrome-400 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">Decentralized:</strong> You control your identity, not us
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-chrome-900/30 rounded border border-chrome-300/10">
              <Globe className="w-5 h-5 text-chrome-400 shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">Universal:</strong> One identity across all Internet Computer apps
              </div>
            </div>
          </div>

          <Button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="w-full bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
            size="lg"
          >
            {isLoggingIn ? 'Connecting...' : 'Sign In with Internet Identity'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            New to Internet Identity? The sign-in process will guide you through creating your identity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
