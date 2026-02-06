import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

export default function AuthRequiredScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const handleSignIn = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full bg-card/80 border-chrome-300/20 shadow-glow">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20">
            <Lock className="w-8 h-8 text-chrome-300" />
          </div>
          <CardTitle className="text-2xl">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 text-center text-muted-foreground">
            <p>
              This page requires authentication with Internet Identity.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-chrome-400" />
              <span>Secure, private, and decentralized authentication</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
