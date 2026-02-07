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
      <div className="bg-cyber-card border border-cyber-primary/50 rounded-lg shadow-cyber p-4 flex items-center gap-4">
        <div className="text-cyber-primary font-mono text-sm">
          <span className="font-bold">{selectedOrderIds.length}</span> order{selectedOrderIds.length !== 1 ? 's' : ''} selected
        </div>
        <div className="h-6 w-px bg-cyber-primary/30" />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleBulkApprove}
            disabled={isApproving || isShipping || isDeleting}
            className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 font-mono text-xs"
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
            className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 font-mono text-xs"
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
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 font-mono text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-cyber-card border-cyber-primary/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-cyber-primary font-mono">
                  Delete {selectedOrderIds.length} Order{selectedOrderIds.length !== 1 ? 's' : ''}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-cyber-muted font-mono">
                  This action cannot be undone. All selected orders will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-cyber-primary/30 font-mono">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90 font-mono"
                >
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="h-6 w-px bg-cyber-primary/30" />
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          className="text-cyber-muted hover:text-cyber-primary font-mono text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  );
}
