import { useState } from 'react';
import { useAccountInfo, useSetVIPStatus, useBanUser, useUnbanUser } from '../../hooks/admin/useAdminAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Crown, Ban, ShieldCheck, Loader2, User, AlertTriangle } from 'lucide-react';
import type { Order } from '../../backend';

interface AdminOrderOwnerAccountControlsProps {
  order: Order;
}

export default function AdminOrderOwnerAccountControls({ order }: AdminOrderOwnerAccountControlsProps) {
  const { data: accountInfo, isLoading, error } = useAccountInfo(order.owner || null);
  const setVIPStatus = useSetVIPStatus();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const [processingAction, setProcessingAction] = useState<'vip' | 'ban' | null>(null);

  // If order has no owner, show unavailable state
  if (!order.owner) {
    return (
      <Card className="bg-admin-bg/50 border-admin-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-admin-muted flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-admin-muted text-sm">
            No owner on this order; account management unavailable
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggleVIP = async () => {
    if (!accountInfo || !order.owner) return;
    
    setProcessingAction('vip');
    try {
      await setVIPStatus.mutateAsync({ 
        principal: order.owner, 
        isVIP: !accountInfo.isVIP 
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleToggleBan = async () => {
    if (!accountInfo || !order.owner) return;
    
    setProcessingAction('ban');
    try {
      if (accountInfo.isBanned) {
        await unbanUser.mutateAsync(order.owner);
      } else {
        await banUser.mutateAsync(order.owner);
      }
    } finally {
      setProcessingAction(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-admin-bg/50 border-admin-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-admin-muted flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-admin-card" />
            <Skeleton className="h-4 w-3/4 bg-admin-card" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-admin-bg/50 border-red-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-admin-muted flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Failed to load account info</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!accountInfo) {
    return (
      <Card className="bg-admin-bg/50 border-admin-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-admin-muted flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-admin-muted text-sm">
            Account information not available
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayName = accountInfo.profile?.name || 'Unknown User';
  const isProcessingVIP = processingAction === 'vip';
  const isProcessingBan = processingAction === 'ban';

  return (
    <Card className="bg-admin-bg/50 border-admin-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-admin-muted flex items-center gap-2">
          <User className="w-4 h-4" />
          Account Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Account Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-admin-foreground font-medium text-sm">{displayName}</span>
            {accountInfo.isVIP && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                <Crown className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            )}
            {accountInfo.isBanned && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                <Ban className="w-3 h-3 mr-1" />
                Banned
              </Badge>
            )}
            <Badge variant="outline" className="text-admin-muted border-admin-border text-xs">
              {Number(accountInfo.orderCount)} {Number(accountInfo.orderCount) === 1 ? 'order' : 'orders'}
            </Badge>
          </div>
          {accountInfo.profile?.email && (
            <p className="text-admin-muted text-xs">{accountInfo.profile.email}</p>
          )}
          <p className="text-admin-muted text-xs truncate" title={order.owner.toText()}>
            {order.owner.toText()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isProcessingVIP || isProcessingBan || accountInfo.isBanned}
                variant={accountInfo.isVIP ? 'outline' : 'default'}
                size="sm"
                className={
                  accountInfo.isVIP
                    ? 'border-admin-border text-admin-foreground hover:bg-admin-primary/10'
                    : 'bg-admin-primary hover:bg-admin-primary/90 text-white'
                }
              >
                {isProcessingVIP ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : accountInfo.isVIP ? (
                  'Revoke VIP'
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Grant VIP
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-admin-card border-admin-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-admin-foreground">
                  {accountInfo.isVIP ? 'Revoke VIP Status' : 'Grant VIP Status'}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-admin-muted">
                  {accountInfo.isVIP 
                    ? `Are you sure you want to revoke VIP status for ${displayName}? They will no longer receive the 10% discount on future orders.`
                    : `Are you sure you want to grant VIP status to ${displayName}? They will receive a 10% discount on all future orders.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleToggleVIP}
                  className={accountInfo.isVIP ? 'bg-destructive hover:bg-destructive/90' : 'bg-admin-primary hover:bg-admin-primary/90'}
                >
                  {accountInfo.isVIP ? 'Revoke VIP' : 'Grant VIP'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={isProcessingVIP || isProcessingBan}
                variant={accountInfo.isBanned ? 'default' : 'destructive'}
                size="sm"
              >
                {isProcessingBan ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : accountInfo.isBanned ? (
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
            <AlertDialogContent className="bg-admin-card border-admin-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-admin-foreground">
                  {accountInfo.isBanned ? 'Unban User' : 'Ban User'}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-admin-muted">
                  {accountInfo.isBanned 
                    ? `Are you sure you want to unban ${displayName}? They will be able to place orders again.`
                    : `Are you sure you want to ban ${displayName}? They will not be able to place new orders.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleToggleBan}
                  className={accountInfo.isBanned ? 'bg-admin-primary hover:bg-admin-primary/90' : 'bg-destructive hover:bg-destructive/90'}
                >
                  {accountInfo.isBanned ? 'Unban User' : 'Ban User'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
