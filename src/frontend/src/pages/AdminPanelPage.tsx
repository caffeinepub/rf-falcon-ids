import { useState } from 'react';
import { useAllOrders } from '../hooks/orders/useAllOrders';
import { useUpdateOrderStatus } from '../hooks/orders/useUpdateOrderStatus';
import { useSetTrackingNumber } from '../hooks/orders/useSetTrackingNumber';
import { useAdminResetAllData } from '../hooks/admin/useAdminResetAllData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Loader2, Trash2, Package } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';
import { OrderStatus } from '../backend';
import { toast } from 'sonner';

export default function AdminPanelPage() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const setTrackingNumber = useSetTrackingNumber();
  const resetAllData = useAdminResetAllData();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateStatus.mutateAsync({
        orderId,
        status: newStatus as OrderStatus,
      });
      toast.success('Order status updated');
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleTrackingNumberChange = (orderId: string, value: string) => {
    setTrackingInputs((prev) => ({ ...prev, [orderId]: value }));
  };

  const handleSaveTrackingNumber = async (orderId: string) => {
    const trackingNumber = trackingInputs[orderId]?.trim();
    if (!trackingNumber) {
      toast.error('Please enter a tracking number');
      return;
    }

    setSavingTrackingId(orderId);
    try {
      await setTrackingNumber.mutateAsync({ orderId, trackingNumber });
      toast.success('Tracking number saved');
      // Clear the input after successful save
      setTrackingInputs((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (error) {
      console.error('Tracking number save error:', error);
      toast.error('Failed to save tracking number');
    } finally {
      setSavingTrackingId(null);
    }
  };

  const handleResetAllData = async () => {
    try {
      await resetAllData.mutateAsync();
      toast.success('All data has been reset');
    } catch (error) {
      console.error('Reset error:', error);
      toast.error('Failed to reset data');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-chrome-300" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-chrome-900/50 rounded-full flex items-center justify-center border border-chrome-300/20">
            <Shield className="w-6 h-6 text-chrome-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wider">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Manage all orders and system data</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-chrome-300/20">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all orders and reset the system to its initial state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-chrome-300/30">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAllData}
                disabled={resetAllData.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {resetAllData.isPending ? 'Resetting...' : 'Reset All Data'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="bg-card/80 border-chrome-300/20">
          <CardContent className="pt-12 pb-12 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 tracking-wide">No Orders</h3>
            <p className="text-muted-foreground">
              No orders have been created yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const isPending = order.status === 'pending';
            const currentTrackingInput = trackingInputs[order.id] ?? order.trackingNumber ?? '';
            const isSaving = savingTrackingId === order.id;

            return (
              <Card key={order.id} className="bg-card/80 border-chrome-300/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg tracking-wide">
                        {order.details.first_name} {order.details.last_name}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {order.details.state_name} • ID #{order.details.id_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Order ID: {order.id}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          order.status === 'shipped'
                            ? 'default'
                            : order.status === 'approved'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          order.status === 'shipped'
                            ? 'bg-green-900/30 text-green-400 border-green-500/30'
                            : order.status === 'approved'
                            ? 'bg-chrome-900/30 text-chrome-300 border-chrome-300/30'
                            : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                        }
                      >
                        {formatOrderStatus(order.status)}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        disabled={updatingOrderId === order.id}
                      >
                        <SelectTrigger className="w-[140px] border-chrome-300/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isPending ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Tracking number available after order is approved or shipped</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor={`tracking-${order.id}`} className="text-sm">
                        Tracking Number
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`tracking-${order.id}`}
                          value={currentTrackingInput}
                          onChange={(e) => handleTrackingNumberChange(order.id, e.target.value)}
                          placeholder="Enter tracking number"
                          className="bg-background/50 border-chrome-300/30"
                          disabled={isSaving}
                        />
                        <Button
                          onClick={() => handleSaveTrackingNumber(order.id)}
                          disabled={isSaving || !currentTrackingInput.trim()}
                          className="bg-chrome-900/50 hover:bg-chrome-900/70 border border-chrome-300/30"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
