import { useState } from 'react';
import { useSecurityStats } from '../../hooks/security/useSecurityStats';
import { useSecurityEvents } from '../../hooks/security/useSecurityEvents';
import { useSecurityConfig } from '../../hooks/security/useSecurityConfig';
import {
  useToggleSecurity,
  useUpdateRateLimits,
  useClearSecurityCounters,
  useAddToBlocklist,
  useRemoveFromBlocklist,
  useAddToAllowlist,
  useRemoveFromAllowlist,
} from '../../hooks/security/useSecurityMutations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Activity, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, Trash2, Ban, CheckSquare } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export default function TreyCSecuritySection() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useSecurityStats();
  const { data: events, isLoading: eventsLoading, error: eventsError, refetch: refetchEvents } = useSecurityEvents(50);
  const { data: config, isLoading: configLoading, error: configError, refetch: refetchConfig } = useSecurityConfig();
  
  const setSecurityEnabled = useToggleSecurity();
  const updateRateLimits = useUpdateRateLimits();
  const clearSecurityCounters = useClearSecurityCounters();
  const addToBlocklist = useAddToBlocklist();
  const removeFromBlocklist = useRemoveFromBlocklist();
  const addToAllowlist = useAddToAllowlist();
  const removeFromAllowlist = useRemoveFromAllowlist();

  const [rateLimitWindow, setRateLimitWindow] = useState('60');
  const [maxCallsPerWindow, setMaxCallsPerWindow] = useState('100');
  const [blocklistPrincipal, setBlocklistPrincipal] = useState('');
  const [allowlistPrincipal, setAllowlistPrincipal] = useState('');

  const handleToggleSecurity = async (enabled: boolean) => {
    try {
      await setSecurityEnabled.mutateAsync(enabled);
      toast.success(`Security ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update security status');
    }
  };

  const handleUpdateRateLimits = async () => {
    const window = parseInt(rateLimitWindow, 10);
    const maxCalls = parseInt(maxCallsPerWindow, 10);

    if (isNaN(window) || window <= 0 || isNaN(maxCalls) || maxCalls <= 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }

    try {
      await updateRateLimits.mutateAsync({
        window: window * 1_000_000_000,
        maxCalls: maxCalls,
      });
      toast.success('Rate limits updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update rate limits');
    }
  };

  const handleClearCounters = async () => {
    try {
      await clearSecurityCounters.mutateAsync();
      toast.success('Security counters cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear counters');
    }
  };

  const handleAddToBlocklist = async () => {
    if (!blocklistPrincipal.trim()) {
      toast.error('Please enter a principal');
      return;
    }

    try {
      await addToBlocklist.mutateAsync(blocklistPrincipal.trim());
      toast.success('Principal added to blocklist');
      setBlocklistPrincipal('');
    } catch (error: any) {
      toast.error(error.message || 'Invalid principal or operation failed');
    }
  };

  const handleRemoveFromBlocklist = async () => {
    if (!blocklistPrincipal.trim()) {
      toast.error('Please enter a principal');
      return;
    }

    try {
      await removeFromBlocklist.mutateAsync(blocklistPrincipal.trim());
      toast.success('Principal removed from blocklist');
      setBlocklistPrincipal('');
    } catch (error: any) {
      toast.error(error.message || 'Invalid principal or operation failed');
    }
  };

  const handleAddToAllowlist = async () => {
    if (!allowlistPrincipal.trim()) {
      toast.error('Please enter a principal');
      return;
    }

    try {
      await addToAllowlist.mutateAsync(allowlistPrincipal.trim());
      toast.success('Principal added to allowlist');
      setAllowlistPrincipal('');
    } catch (error: any) {
      toast.error(error.message || 'Invalid principal or operation failed');
    }
  };

  const handleRemoveFromAllowlist = async () => {
    if (!allowlistPrincipal.trim()) {
      toast.error('Please enter a principal');
      return;
    }

    try {
      await removeFromAllowlist.mutateAsync(allowlistPrincipal.trim());
      toast.success('Principal removed from allowlist');
      setAllowlistPrincipal('');
    } catch (error: any) {
      toast.error(error.message || 'Invalid principal or operation failed');
    }
  };

  if (statsLoading || eventsLoading || configLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full bg-admin-card" />
        <Skeleton className="h-32 w-full bg-admin-card" />
        <Skeleton className="h-32 w-full bg-admin-card" />
      </div>
    );
  }

  if (statsError || eventsError || configError) {
    return (
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">Error loading security data</p>
            <p className="text-admin-muted text-sm mt-2">
              {(statsError || eventsError || configError)?.message}
            </p>
            <Button
              onClick={() => {
                refetchStats();
                refetchEvents();
                refetchConfig();
              }}
              className="mt-4 bg-admin-primary hover:bg-admin-primary/90"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-admin-primary" />
                Security Dashboard
              </CardTitle>
              <CardDescription className="text-admin-muted mt-1">
                Monitor and manage system security settings
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-admin-muted text-sm">Security System</Label>
              <Switch
                checked={config?.enabled || false}
                onCheckedChange={handleToggleSecurity}
                disabled={setSecurityEnabled.isPending}
              />
              <Badge variant={config?.enabled ? 'default' : 'secondary'} className={config?.enabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>
                {config?.enabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-admin-card border-green-500/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-xs uppercase tracking-wider">Allowed Calls</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{stats?.allowedCalls.toString() || '0'}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-red-500/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-xs uppercase tracking-wider">Denied Calls</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{stats?.deniedCalls.toString() || '0'}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-yellow-500/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-xs uppercase tracking-wider">Throttled Calls</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{stats?.throttledCalls.toString() || '0'}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-admin-foreground">Rate Limit Configuration</CardTitle>
          <CardDescription className="text-admin-muted">
            Configure rate limiting parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-admin-muted text-xs uppercase tracking-wider">Window (seconds)</Label>
              <Input
                type="number"
                value={rateLimitWindow}
                onChange={(e) => setRateLimitWindow(e.target.value)}
                className="bg-admin-bg border-admin-border text-admin-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-admin-muted text-xs uppercase tracking-wider">Max Calls per Window</Label>
              <Input
                type="number"
                value={maxCallsPerWindow}
                onChange={(e) => setMaxCallsPerWindow(e.target.value)}
                className="bg-admin-bg border-admin-border text-admin-foreground"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-admin-border">
            <div className="text-admin-muted text-sm">
              Current: {config?.rateLimitWindow ? Number(config.rateLimitWindow) / 1_000_000_000 : 0}s window, {config?.maxCallsPerWindow?.toString() || 0} max calls
            </div>
            <Button
              onClick={handleUpdateRateLimits}
              disabled={updateRateLimits.isPending}
              className="bg-admin-primary hover:bg-admin-primary/90"
            >
              {updateRateLimits.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Update Limits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blocklist & Allowlist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-admin-card border-admin-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-admin-foreground flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              Blocklist
            </CardTitle>
            <CardDescription className="text-admin-muted">
              {config?.blocklistSize?.toString() || 0} principals blocked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-admin-muted text-xs uppercase tracking-wider">Principal ID</Label>
              <Input
                placeholder="Enter principal to block..."
                value={blocklistPrincipal}
                onChange={(e) => setBlocklistPrincipal(e.target.value)}
                className="bg-admin-bg border-admin-border text-admin-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddToBlocklist}
                disabled={addToBlocklist.isPending || !blocklistPrincipal.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {addToBlocklist.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                Block
              </Button>
              <Button
                onClick={handleRemoveFromBlocklist}
                disabled={removeFromBlocklist.isPending || !blocklistPrincipal.trim()}
                variant="outline"
                className="flex-1 border-admin-border text-admin-foreground hover:bg-admin-primary/10"
              >
                {removeFromBlocklist.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Unblock
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-admin-card border-admin-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-admin-foreground flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-400" />
              Allowlist
            </CardTitle>
            <CardDescription className="text-admin-muted">
              {config?.allowlistSize?.toString() || 0} principals allowed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-admin-muted text-xs uppercase tracking-wider">Principal ID</Label>
              <Input
                placeholder="Enter principal to allow..."
                value={allowlistPrincipal}
                onChange={(e) => setAllowlistPrincipal(e.target.value)}
                className="bg-admin-bg border-admin-border text-admin-foreground"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddToAllowlist}
                disabled={addToAllowlist.isPending || !allowlistPrincipal.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {addToAllowlist.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
                Allow
              </Button>
              <Button
                onClick={handleRemoveFromAllowlist}
                disabled={removeFromAllowlist.isPending || !allowlistPrincipal.trim()}
                variant="outline"
                className="flex-1 border-admin-border text-admin-foreground hover:bg-admin-primary/10"
              >
                {removeFromAllowlist.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-admin-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-admin-primary" />
                Recent Security Events
              </CardTitle>
              <CardDescription className="text-admin-muted mt-1">
                Last 50 security events
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-admin-border text-admin-foreground hover:bg-admin-primary/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Counters
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-admin-card border-admin-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-admin-foreground">Clear Security Counters</AlertDialogTitle>
                  <AlertDialogDescription className="text-admin-muted">
                    This will reset all security statistics and clear the event log. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearCounters}
                    disabled={clearSecurityCounters.isPending}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {clearSecurityCounters.isPending ? 'Clearing...' : 'Clear Counters'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          {!events || events.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-admin-muted mb-4" />
              <p className="text-admin-muted">No security events recorded</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-admin-bg border border-admin-border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {event.result === 'allowed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : event.result === 'denied' ? (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-admin-foreground text-sm truncate">{event.action}</p>
                      <p className="text-admin-muted text-xs truncate">{event.principal.toText()}</p>
                    </div>
                  </div>
                  <Badge
                    variant={event.result === 'allowed' ? 'default' : 'secondary'}
                    className={
                      event.result === 'allowed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      event.result === 'denied' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }
                  >
                    {event.result}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
