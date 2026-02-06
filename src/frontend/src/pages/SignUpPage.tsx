import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, Lock, Smartphone } from 'lucide-react';

export default function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-cyan-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Get Started with Internet Identity</CardTitle>
          <CardDescription className="text-center">
            Secure, anonymous authentication without passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What is Internet Identity?</h3>
            <p className="text-sm text-muted-foreground">
              Internet Identity is a blockchain-based authentication system that lets you sign in securely without passwords. Your identity is cryptographically secured and never shared with applications.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Key Features</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">No Passwords</p>
                  <p className="text-xs text-muted-foreground">Use biometrics or security keys instead</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Privacy First</p>
                  <p className="text-xs text-muted-foreground">Your identity is anonymous and secure</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Multi-Device</p>
                  <p className="text-xs text-muted-foreground">Access from any device you register</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate({ to: '/signin' })}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Continue to Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You'll be guided through creating your Internet Identity if you don't have one yet
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
