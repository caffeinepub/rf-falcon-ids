import { useState } from 'react';
import { useBulkApproveOrders, useBulkShipOrders, useBulkDeleteOrders } from '../../hooks/admin/useBulkOrderActions';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle2, Truck, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface BulkOrderActionsBarProps {
  selectedOrderIds: string[];
  onClearSelection: () => void;
}

export default function BulkOrderActionsBar({ selectedOrderIds, onClearSelection }: BulkOrderActionsBarProps) {
  const bulkApprove = useBulkApproveOrders();
  const bulkShip = useBulkShipOrders();
  const bulkDelete = useBulkDeleteOrders();

  const [isApproving, setIsApproving] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkApprove = async () => {
    setIsApproving(true);
    try {
      await bulkApprove.mutateAsync(selectedOrderIds);
      toast.success(`${selectedOrderIds.length} orders approved`);
      onClearSelection();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve orders');
    } finally {
      setIsApproving(false);
    }
  };

  const handleBulkShip = async () => {
    setIsShipping(true);
    try {
      await bulkShip.mutateAsync(selectedOrderIds);
      toast.success(`${selectedOrderIds.length} orders marked as shipped`);
      onClearSelection();
    } catch (error: any) {
      toast.error(error.message || 'Failed to ship orders');
    } finally {
      setIsShipping(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      await bulkDelete.mutateAsync(selectedOrderIds);
      toast.success(`${selectedOrderIds.length} orders deleted`);
      onClearSelection();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete orders');
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedOrderIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-admin-card border border-admin-border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="text-admin-foreground text-sm">
          <span className="font-bold">{selectedOrderIds.length}</span> order{selectedOrderIds.length !== 1 ? 's' : ''} selected
        </div>
        <div className="h-6 w-px bg-admin-border" />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleBulkApprove}
            disabled={isApproving || isShipping || isDeleting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isApproving ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3 h-3 mr-1" />
            )}
            Approve All
          </Button>
          <Button
            size="sm"
            onClick={handleBulkShip}
            disabled={isApproving || isShipping || isDeleting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isShipping ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <Truck className="w-3 h-3 mr-1" />
            )}
            Ship All
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                disabled={isApproving || isShipping || isDeleting}
                variant="destructive"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-admin-card border-admin-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-admin-foreground">
                  Delete {selectedOrderIds.length} Order{selectedOrderIds.length !== 1 ? 's' : ''}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-admin-muted">
                  This action cannot be undone. All selected orders will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="h-6 w-px bg-admin-border" />
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-admin-muted hover:text-admin-foreground"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
