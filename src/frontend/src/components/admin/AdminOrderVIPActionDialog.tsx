import { useState } from 'react';
import { Principal } from '@dfinity/principal';
import { useSetVIPStatus } from '../../hooks/admin/useAdminAccounts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Crown, Loader2 } from 'lucide-react';

interface AdminOrderVIPActionDialogProps {
  owner: Principal | null;
  isVIP: boolean;
  ownerName?: string;
}

export default function AdminOrderVIPActionDialog({
  owner,
  isVIP,
  ownerName = 'this user',
}: AdminOrderVIPActionDialogProps) {
  const setVIPStatus = useSetVIPStatus();
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    if (!owner) return;
    
    try {
      await setVIPStatus.mutateAsync({ principal: owner, isVIP: !isVIP });
      setIsOpen(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  if (!owner) {
    return (
      <Button disabled size="sm" variant="outline" className="text-admin-muted">
        <Crown className="w-4 h-4 mr-2" />
        No Account
      </Button>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant={isVIP ? 'outline' : 'default'}
          className={
            isVIP
              ? 'border-admin-border text-admin-foreground hover:bg-admin-primary/10'
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }
        >
          <Crown className="w-4 h-4 mr-2" />
          {isVIP ? 'Revoke VIP' : 'Grant VIP'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isVIP ? 'Revoke VIP Status' : 'Grant VIP Status'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isVIP
              ? `Are you sure you want to revoke VIP status for ${ownerName}? They will no longer receive the 10% discount on future orders.`
              : `Are you sure you want to grant VIP status to ${ownerName}? They will receive a 10% discount on all future orders.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={setVIPStatus.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={setVIPStatus.isPending}
            className={isVIP ? 'bg-destructive hover:bg-destructive/90' : 'bg-yellow-500 hover:bg-yellow-600'}
          >
            {setVIPStatus.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : isVIP ? (
              'Revoke VIP'
            ) : (
              'Grant VIP'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
