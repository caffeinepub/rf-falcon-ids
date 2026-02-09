import { useState, useMemo } from 'react';
import { useAllAccounts, useGrantVIPStatus, useRevokeVIPStatus, useBanUser, useUnbanUser } from '../../hooks/admin/useAdminAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Users, Crown, Loader2, AlertTriangle, Ban, ShieldCheck } from 'lucide-react';
import { Principal } from '@dfinity/principal';

export default function AdminAccountsSection() {
  const { data: accounts, isLoading, error, refetch } = useAllAccounts();
  const grantVIP = useGrantVIPStatus();
  const revokeVIP = useRevokeVIPStatus();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [processingPrincipal, setProcessingPrincipal] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'vip' | 'ban' | null>(null);

  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];

    if (!searchQuery.trim()) return accounts;

    const query = searchQuery.toLowerCase();
    return accounts.filter((account) => {
      const principalText = account.principal.toText().toLowerCase();
      const email = account.profile?.email?.toLowerCase() || '';
      const name = account.profile?.name.toLowerCase() || '';
      return principalText.includes(query) || email.includes(query) || name.includes(query);
    });
  }, [accounts, searchQuery]);

  const handleToggleVIP = async (principal: Principal, currentVIPStatus: boolean) => {
    const principalText = principal.toText();
    setProcessingPrincipal(principalText);
    setProcessingAction('vip');
    
    try {
      if (currentVIPStatus) {
        await revokeVIP.mutateAsync(principal);
      } else {
        await grantVIP.mutateAsync(principal);
      }
    } finally {
      setProcessingPrincipal(null);
      setProcessingAction(null);
    }
  };

  const handleToggleBan = async (principal: Principal, currentBanStatus: boolean) => {
    const principalText = principal.toText();
    setProcessingPrincipal(principalText);
    setProcessingAction('ban');
    
    try {
      if (currentBanStatus) {
        await unbanUser.mutateAsync(principal);
      } else {
        await banUser.mutateAsync(principal);
      }
    } finally {
      setProcessingPrincipal(null);
      setProcessingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full bg-admin-card" />
        <Skeleton className="h-32 w-full bg-admin-card" />
        <Skeleton className="h-32 w-full bg-admin-card" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive">Error loading accounts</p>
            <p className="text-admin-muted text-sm mt-2">{(error as Error).message}</p>
            <Button
              onClick={() => refetch()}
              className="mt-4 bg-admin-primary hover:bg-admin-primary/90"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const vipCount = accounts?.filter((account) => account.isVIP).length || 0;
  const bannedCount = accounts?.filter((account) => account.isBanned).length || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-admin-card border-admin-border shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-xs uppercase tracking-wider">Total Accounts</p>
                <p className="text-3xl font-bold text-admin-foreground mt-1">{accounts?.length || 0}</p>
              </div>
              <Users className="w-8 h-8 text-admin-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-yellow-500/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-xs uppercase tracking-wider">VIP Accounts</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{vipCount}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-admin-card border-red-500/30 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-admin-muted text-xs uppercase tracking-wider">Banned Accounts</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{bannedCount}</p>
              </div>
              <Ban className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label className="text-admin-muted text-xs uppercase tracking-wider">
              <Search className="w-3 h-3 inline mr-1" />
              Search Accounts
            </Label>
            <Input
              placeholder="Search by email, name, or principal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-admin-bg border-admin-border text-admin-foreground focus:ring-admin-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-admin-foreground">
            User Accounts ({filteredAccounts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-admin-muted mb-4" />
              <p className="text-admin-muted">
                {searchQuery ? 'No accounts match your search' : 'No accounts with orders found'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccounts.map((account) => {
                const principalText = account.principal.toText();
                const isProcessingVIP = processingPrincipal === principalText && processingAction === 'vip';
                const isProcessingBan = processingPrincipal === principalText && processingAction === 'ban';
                const displayName = account.profile?.name || 'Unknown User';
                
                return (
                  <div
                    key={principalText}
                    className={`flex items-center justify-between p-4 bg-admin-bg border rounded-lg transition-colors ${
                      account.isBanned 
                        ? 'border-red-500/50 bg-red-500/5' 
                        : 'border-admin-border hover:border-admin-primary/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-admin-foreground font-semibold">{displayName}</p>
                        {account.isVIP && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </Badge>
                        )}
                        {account.isBanned && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            <Ban className="w-3 h-3 mr-1" />
                            Banned
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-admin-muted border-admin-border">
                          {Number(account.orderCount)} {Number(account.orderCount) === 1 ? 'order' : 'orders'}
                        </Badge>
                      </div>
                      {account.profile?.email && (
                        <p className="text-admin-muted text-sm">{account.profile.email}</p>
                      )}
                      <p className="text-admin-muted text-xs truncate" title={principalText}>
                        {principalText}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button
                        onClick={() => handleToggleVIP(account.principal, account.isVIP)}
                        disabled={isProcessingVIP || isProcessingBan || account.isBanned}
                        variant={account.isVIP ? 'outline' : 'default'}
                        size="sm"
                        className={
                          account.isVIP
                            ? 'border-admin-border text-admin-foreground hover:bg-admin-primary/10'
                            : 'bg-admin-primary hover:bg-admin-primary/90 text-white'
                        }
                      >
                        {isProcessingVIP ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : account.isVIP ? (
                          'Revoke VIP'
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-2" />
                            Grant VIP
                          </>
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            disabled={isProcessingVIP || isProcessingBan}
                            variant={account.isBanned ? 'default' : 'destructive'}
                            size="sm"
                          >
                            {isProcessingBan ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : account.isBanned ? (
                              <>
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Unban
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Ban
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {account.isBanned ? 'Unban User' : 'Ban User'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {account.isBanned 
                                ? `Are you sure you want to unban ${displayName}? They will be able to place orders again.`
                                : `Are you sure you want to ban ${displayName}? They will not be able to place new orders.`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleToggleBan(account.principal, account.isBanned)}
                              className={account.isBanned ? 'bg-admin-primary hover:bg-admin-primary/90' : 'bg-destructive hover:bg-destructive/90'}
                            >
                              {account.isBanned ? 'Unban User' : 'Ban User'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
