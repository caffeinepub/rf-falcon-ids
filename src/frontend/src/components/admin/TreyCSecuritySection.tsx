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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Activity, Ban, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

export default function TreyCSecuritySection() {
  const { data: stats, isLoading: statsLoading } = useSecurityStats();
  const { data: events, isLoading: eventsLoading } = useSecurityEvents(50);
  const { data: config, isLoading: configLoading } = useSecurityConfig();

  const toggleSecurity = useToggleSecurity();
  const updateRateLimits = useUpdateRateLimits();
  const clearCounters = useClearSecurityCounters();
  const addToBlocklist = useAddToBlocklist();
  const removeFromBlocklist = useRemoveFromBlocklist();
  const addToAllowlist = useAddToAllowlist();
  const removeFromAllowlist = useRemoveFromAllowlist();

  const [rateLimitWindow, setRateLimitWindow] = useState('60');
  const [maxCallsPerWindow, setMaxCallsPerWindow] = useState('100');
  const [blocklistPrincipal, setBlocklistPrincipal] = useState('');
  const [allowlistPrincipal, setAllowlistPrincipal] = useState('');

  const handleToggleSecurity = async () => {
    try {
      await toggleSecurity.mutateAsync(!config?.enabled);
      toast.success(config?.enabled ? 'TREY C SECURITY disabled' : 'TREY C SECURITY enabled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle security');
    }
  };

  const handleUpdateRateLimits = async () => {
    const window = parseInt(rateLimitWindow);
    const maxCalls = parseInt(maxCallsPerWindow);

    if (isNaN(window) || window <= 0) {
      toast.error('Invalid rate limit window');
      return;
    }
    if (isNaN(maxCalls) || maxCalls <= 0) {
      toast.error('Invalid max calls per window');
      return;
    }

    try {
      await updateRateLimits.mutateAsync({ window: window * 1_000_000_000, maxCalls });
      toast.success('Rate limits updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update rate limits');
    }
  };

  const handleClearCounters = async () => {
    try {
      await clearCounters.mutateAsync();
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
      toast.error(error.message || 'Failed to add to blocklist');
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
      toast.error(error.message || 'Failed to remove from blocklist');
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
      toast.error(error.message || 'Failed to add to allowlist');
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
      toast.error(error.message || 'Failed to remove from allowlist');
    }
  };

  if (statsLoading || configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyber-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-cyber-card rounded-lg flex items-center justify-center border border-cyber-primary/30 shadow-cyber">
          <Shield className="w-7 h-7 text-cyber-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-wider text-cyber-primary font-mono uppercase">
            TREY C SECURITY
          </h2>
          <p className="text-cyber-muted mt-1 font-mono text-sm">
            [ADVANCED ANTI-DDOS PROTECTION SYSTEM]
          </p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-cyber-card border-green-500/30 shadow-cyber">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Allowed Calls</p>
                <p className="text-3xl font-bold text-green-400 font-mono mt-1">
                  {stats ? Number(stats.allowedCalls).toLocaleString() : '0'}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyber-card border-red-500/30 shadow-cyber">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Denied Calls</p>
                <p className="text-3xl font-bold text-red-400 font-mono mt-1">
                  {stats ? Number(stats.deniedCalls).toLocaleString() : '0'}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-cyber-card border-yellow-500/30 shadow-cyber">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Throttled Calls</p>
                <p className="text-3xl font-bold text-yellow-400 font-mono mt-1">
                  {stats ? Number(stats.throttledCalls).toLocaleString() : '0'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
        <CardHeader>
          <CardTitle className="text-cyber-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-cyber-bg rounded-lg border border-cyber-primary/20">
            <div className="flex items-center gap-3">
              {config?.enabled ? (
                <Lock className="w-5 h-5 text-green-400" />
              ) : (
                <Unlock className="w-5 h-5 text-red-400" />
              )}
              <div>
                <Label className="text-cyber-primary font-mono text-sm">
                  TREY C SECURITY Status
                </Label>
                <p className="text-cyber-muted text-xs font-mono mt-1">
                  {config?.enabled ? 'Protection active' : 'Protection disabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={config?.enabled || false}
              onCheckedChange={handleToggleSecurity}
              disabled={toggleSecurity.isPending}
            />
          </div>

          {/* Rate Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                Rate Limit Window (seconds)
              </Label>
              <Input
                type="number"
                value={rateLimitWindow}
                onChange={(e) => setRateLimitWindow(e.target.value)}
                className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono"
                placeholder="60"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                Max Calls Per Window
              </Label>
              <Input
                type="number"
                value={maxCallsPerWindow}
                onChange={(e) => setMaxCallsPerWindow(e.target.value)}
                className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono"
                placeholder="100"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateRateLimits}
            disabled={updateRateLimits.isPending}
            className="w-full bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/50 text-cyber-primary font-mono"
          >
            {updateRateLimits.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Rate Limits'
            )}
          </Button>

          {/* Current Config Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-cyber-bg rounded-lg border border-cyber-primary/20">
            <div>
              <p className="text-cyber-muted text-xs font-mono uppercase">Blocklist Size</p>
              <p className="text-cyber-primary font-mono text-lg font-bold">
                {config ? Number(config.blocklistSize) : 0}
              </p>
            </div>
            <div>
              <p className="text-cyber-muted text-xs font-mono uppercase">Allowlist Size</p>
              <p className="text-cyber-primary font-mono text-lg font-bold">
                {config ? Number(config.allowlistSize) : 0}
              </p>
            </div>
          </div>

          {/* Clear Counters */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 font-mono"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Clear Security Counters
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-cyber-card border-cyber-primary/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-cyber-primary font-mono">
                  Clear Security Counters?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-cyber-muted font-mono">
                  This will reset all security statistics and clear the event log.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-cyber-primary/30 font-mono">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearCounters}
                  disabled={clearCounters.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700 font-mono"
                >
                  {clearCounters.isPending ? 'Clearing...' : 'Clear Counters'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Blocklist/Allowlist Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blocklist */}
        <Card className="bg-cyber-card border-red-500/30 shadow-cyber">
          <CardHeader>
            <CardTitle className="text-red-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <Ban className="w-5 h-5" />
              Blocklist Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                Principal ID
              </Label>
              <Input
                value={blocklistPrincipal}
                onChange={(e) => setBlocklistPrincipal(e.target.value)}
                className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono text-xs"
                placeholder="Enter principal ID..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddToBlocklist}
                disabled={addToBlocklist.isPending}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 font-mono text-xs"
              >
                {addToBlocklist.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
              </Button>
              <Button
                onClick={handleRemoveFromBlocklist}
                disabled={removeFromBlocklist.isPending}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 font-mono text-xs"
              >
                {removeFromBlocklist.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Allowlist */}
        <Card className="bg-cyber-card border-green-500/30 shadow-cyber">
          <CardHeader>
            <CardTitle className="text-green-400 font-mono uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Allowlist Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                Principal ID
              </Label>
              <Input
                value={allowlistPrincipal}
                onChange={(e) => setAllowlistPrincipal(e.target.value)}
                className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono text-xs"
                placeholder="Enter principal ID..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddToAllowlist}
                disabled={addToAllowlist.isPending}
                className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 font-mono text-xs"
              >
                {addToAllowlist.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
              </Button>
              <Button
                onClick={handleRemoveFromAllowlist}
                disabled={removeFromAllowlist.isPending}
                variant="outline"
                className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono text-xs"
              >
                {removeFromAllowlist.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Remove'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
        <CardHeader>
          <CardTitle className="text-cyber-primary font-mono uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-cyber-primary" />
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-8 text-cyber-muted font-mono text-sm">
              No security events recorded
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-cyber-primary/20">
                    <TableHead className="text-cyber-muted font-mono text-xs">Time</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Principal</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Action</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Result</TableHead>
                    <TableHead className="text-cyber-muted font-mono text-xs">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, idx) => (
                    <TableRow key={idx} className="border-cyber-primary/10">
                      <TableCell className="text-cyber-primary font-mono text-xs">
                        {new Date(Number(event.timestamp) / 1000000).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-cyber-primary font-mono text-xs truncate max-w-[150px]">
                        {event.principal.toString().slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-cyber-primary font-mono text-xs">
                        {event.action}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            event.result === 'allowed'
                              ? 'bg-green-900/30 text-green-400 border-green-500/50 font-mono text-xs'
                              : event.result === 'denied'
                              ? 'bg-red-900/30 text-red-400 border-red-500/50 font-mono text-xs'
                              : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50 font-mono text-xs'
                          }
                        >
                          {event.result.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-cyber-muted font-mono text-xs">
                        {event.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
