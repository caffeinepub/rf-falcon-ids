import { useEffect, useState } from 'react';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSecurityConfig } from '@/hooks/security/useSecurityConfig';

const STORAGE_KEY = 'trey-c-security-banner-dismissed';

export default function TreyCSecurityProtectionModal() {
  const [isVisible, setIsVisible] = useState(false);
  const { data: securityConfig, isLoading } = useSecurityConfig();

  useEffect(() => {
    // Check if banner was already dismissed in this session
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    
    // Show banner if security is enabled and not dismissed
    if (!dismissed && !isLoading && securityConfig?.enabled) {
      setIsVisible(true);
    }
  }, [securityConfig, isLoading]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm animate-fade-in">
      <Card className="border-primary/40 shadow-glow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-lg">Protected by TREY-C Security</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-6 w-6 -mt-1 -mr-1"
              aria-label="Dismiss security notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            This application is protected by TREY-C Security monitoring system. All requests are monitored for security and rate limiting.
          </p>
          <Button
            onClick={handleDismiss}
            size="sm"
            className="w-full"
          >
            Got it
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
