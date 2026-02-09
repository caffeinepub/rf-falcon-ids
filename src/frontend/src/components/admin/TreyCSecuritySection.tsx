import { useState } from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle, XCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSecurityConfig } from '@/hooks/security/useSecurityConfig';
import { useSecurityStats } from '@/hooks/security/useSecurityStats';
import { useSecurityEvents } from '@/hooks/security/useSecurityEvents';
import { useToggleSecurity, useClearSecurityEvents, useResetSecurityStats } from '@/hooks/security/useSecurityMutations';
import { toast } from 'sonner';

export default function TreyCSecuritySection() {
  const [eventLimit] = useState(50);
  
  const { data: config, isLoading: configLoading, error: configError } = useSecurityConfig();
  const { data: stats, isLoading: statsLoading } = useSecurityStats();
  const { data: events, isLoading: eventsLoading } = useSecurityEvents(eventLimit);
  
  const toggleSecurity = useToggleSecurity();
  const clearEvents = useClearSecurityEvents();
  const resetStats = useResetSecurityStats();

  const handleToggleSecurity = async () => {
    try {
      await toggleSecurity.mutateAsync(!config?.enabled);
      toast.success(config?.enabled ? 'Security disabled' : 'Security enabled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle security');
    }
  };

  const handleClearEvents = async () => {
    try {
      await clearEvents.mutateAsync();
      toast.success('Security events cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear events');
    }
  };

  const handleResetStats = async () => {
    try {
      await resetStats.mutateAsync();
      toast.success('Security statistics reset');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset statistics');
    }
  };

  if (configLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-admin-primary" />
          <span className="text-admin-foreground">Loading security dashboard...</span>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load security configuration. This feature may not be available or you may not have permission to access it.
        </AlertDescription>
      </Alert>
    );
  }

  const isEnabled = config?.enabled ?? false;
  const totalCalls = Number(stats?.allowedCalls ?? 0) + Number(stats?.deniedCalls ?? 0) + Number(stats?.throttledCalls ?? 0);

  return (
    <div className="space-y-6">
      {/* Security Status Card */}
      <Card className="border-admin-border bg-admin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-admin-primary" />
              <CardTitle className="text-admin-foreground">Security Status</CardTitle>
            </div>
            <Badge variant={isEnabled ? "default" : "outline"} className={isEnabled ? "bg-green-500/10 text-green-500 border-green-500/30" : ""}>
              {isEnabled ? 'Active' : 'Disabled'}
            </Badge>
          </div>
          <CardDescription className="text-admin-muted-foreground">
            Monitor and control TREY-C Security system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-toggle" className="text-admin-foreground">Enable Security Monitoring</Label>
              <p className="text-sm text-admin-muted-foreground">
                Activate rate limiting and security event logging
              </p>
            </div>
            <Switch
              id="security-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggleSecurity}
              disabled={toggleSecurity.isPending}
            />
          </div>

          {config && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-admin-border">
              <div>
                <p className="text-sm text-admin-muted-foreground">Rate Limit Window</p>
                <p className="text-lg font-semibold text-admin-foreground">
                  {Number(config.rateLimitWindow) / 1_000_000_000}s
                </p>
              </div>
              <div>
                <p className="text-sm text-admin-muted-foreground">Max Calls per Window</p>
                <p className="text-lg font-semibold text-admin-foreground">
                  {Number(config.maxCallsPerWindow)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="border-admin-border bg-admin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-admin-primary" />
              <CardTitle className="text-admin-foreground">Security Statistics</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetStats}
              disabled={resetStats.isPending}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              {resetStats.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-2">Reset</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center gap-2 text-admin-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading statistics...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-admin-muted-foreground">Allowed</p>
                </div>
                <p className="text-2xl font-bold text-admin-foreground">{Number(stats?.allowedCalls ?? 0)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-admin-muted-foreground">Denied</p>
                </div>
                <p className="text-2xl font-bold text-admin-foreground">{Number(stats?.deniedCalls ?? 0)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <p className="text-sm text-admin-muted-foreground">Throttled</p>
                </div>
                <p className="text-2xl font-bold text-admin-foreground">{Number(stats?.throttledCalls ?? 0)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Events Card */}
      <Card className="border-admin-border bg-admin-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-admin-primary" />
              <CardTitle className="text-admin-foreground">Recent Security Events</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearEvents}
              disabled={clearEvents.isPending || !events || events.length === 0}
              className="border-admin-border text-admin-foreground hover:bg-admin-muted"
            >
              {clearEvents.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="ml-2">Clear</span>
            </Button>
          </div>
          <CardDescription className="text-admin-muted-foreground">
            Showing last {eventLimit} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex items-center gap-2 text-admin-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading events...</span>
            </div>
          ) : !events || events.length === 0 ? (
            <p className="text-sm text-admin-muted-foreground text-center py-8">
              No security events recorded yet
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event, index) => {
                const resultColor = 
                  event.result === 'allowed' ? 'text-green-500' :
                  event.result === 'denied' ? 'text-red-500' :
                  'text-yellow-500';
                
                const ResultIcon = 
                  event.result === 'allowed' ? CheckCircle :
                  event.result === 'denied' ? XCircle :
                  AlertTriangle;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-admin-border bg-admin-muted/30 hover:bg-admin-muted/50 transition-colors"
                  >
                    <ResultIcon className={`w-4 h-4 mt-0.5 ${resultColor}`} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-admin-foreground">{event.action}</span>
                        <Badge variant="outline" className={`${resultColor} border-current`}>
                          {event.result}
                        </Badge>
                      </div>
                      <p className="text-xs text-admin-muted-foreground truncate">
                        {event.principal.toString()}
                      </p>
                      <p className="text-xs text-admin-muted-foreground">{event.reason}</p>
                      <p className="text-xs text-admin-muted-foreground">
                        {new Date(Number(event.timestamp) / 1_000_000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
