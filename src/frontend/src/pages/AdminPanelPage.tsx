import { useState, useMemo } from 'react';
import { useAllOrders } from '../hooks/orders/useAllOrders';
import { useUpdateOrderStatus } from '../hooks/orders/useUpdateOrderStatus';
import { useSetTrackingNumber } from '../hooks/orders/useSetTrackingNumber';
import { useDeleteOrder } from '../hooks/orders/useDeleteOrder';
import { useAdminResetAllData } from '../hooks/admin/useAdminResetAllData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Terminal, Loader2, Trash2, Package, Search, Filter, TrendingUp, CheckCircle2, Clock, Truck, Zap, Database, Download, Shield, FileText } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';
import { OrderStatus, type Order } from '../backend';
import { toast } from 'sonner';
import { exportOrdersToCSV } from '../utils/exportOrdersCsv';
import TreyCSecuritySection from '../components/admin/TreyCSecuritySection';
import AuditLogSection from '../components/admin/AuditLogSection';
import BulkOrderActionsBar from '../components/admin/BulkOrderActionsBar';

type SortOption = 'newest' | 'oldest';
type FilterStatus = 'all' | OrderStatus;

export default function AdminPanelPage() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const setTrackingNumber = useSetTrackingNumber();
  const deleteOrder = useDeleteOrder();
  const resetAllData = useAdminResetAllData();
  
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  
  // Advanced filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.details.first_name.toLowerCase().includes(query) ||
        order.details.last_name.toLowerCase().includes(query) ||
        order.details.id_number.includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const timeA = Number(a.creationTime);
      const timeB = Number(b.creationTime);
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, approved: 0, shipped: 0 };
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
    };
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateStatus.mutateAsync({
        orderId,
        status: newStatus as OrderStatus,
      });
      toast.success('Order status updated');
    } catch (error: any) {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleQuickAction = async (orderId: string, action: 'approve' | 'ship') => {
    const newStatus = action === 'approve' ? 'approved' : 'shipped';
    await handleStatusChange(orderId, newStatus);
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
      setTrackingInputs((prev) => {
        const updated = { ...prev };
        delete updated[orderId];
        return updated;
      });
    } catch (error: any) {
      console.error('Tracking number save error:', error);
      toast.error(error.message || 'Failed to save tracking number');
    } finally {
      setSavingTrackingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    try {
      await deleteOrder.mutateAsync(orderId);
      toast.success('Order deleted successfully');
      setSelectedOrderIds((prev) => {
        const updated = new Set(prev);
        updated.delete(orderId);
        return updated;
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete order');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleResetAllData = async () => {
    try {
      await resetAllData.mutateAsync();
      toast.success('All data has been reset');
      setSelectedOrderIds(new Set());
    } catch (error: any) {
      console.error('Reset error:', error);
      toast.error(error.message || 'Failed to reset data');
    }
  };

  const handleExportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast.error('No orders to export');
      return;
    }

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      exportOrdersToCSV(filteredOrders, `falcon-ids-orders-${timestamp}.csv`);
      toast.success(`Exported ${filteredOrders.length} orders to CSV`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleToggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(orderId)) {
        updated.delete(orderId);
      } else {
        updated.add(orderId);
      }
      return updated;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedOrderIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Terminal className="w-12 h-12 mx-auto text-cyber-primary animate-pulse" />
          <div className="text-cyber-primary font-mono text-sm tracking-wider">
            [LOADING ADMIN INTERFACE...]
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-cyber-card rounded-lg flex items-center justify-center border border-cyber-primary/30 shadow-cyber">
            <Terminal className="w-7 h-7 text-cyber-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-cyber-primary font-mono uppercase">
              Admin Control Panel
            </h1>
            <p className="text-cyber-muted mt-1 font-mono text-sm">
              [SYSTEM ACCESS GRANTED]
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="font-mono">
              <Database className="w-4 h-4 mr-2" />
              RESET SYSTEM
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-cyber-card border-cyber-primary/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-cyber-primary font-mono">
                [WARNING] SYSTEM RESET
              </AlertDialogTitle>
              <AlertDialogDescription className="text-cyber-muted font-mono">
                This action cannot be undone. All orders will be permanently deleted and the system will be reset to initial state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-cyber-primary/30 font-mono">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAllData}
                disabled={resetAllData.isPending}
                className="bg-destructive hover:bg-destructive/90 font-mono"
              >
                {resetAllData.isPending ? '[RESETTING...]' : 'CONFIRM RESET'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-cyber-card border border-cyber-primary/30">
          <TabsTrigger value="orders" className="font-mono data-[state=active]:bg-cyber-primary/20 data-[state=active]:text-cyber-primary">
            <Package className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="security" className="font-mono data-[state=active]:bg-cyber-primary/20 data-[state=active]:text-cyber-primary">
            <Shield className="w-4 h-4 mr-2" />
            TREY C SECURITY
          </TabsTrigger>
          <TabsTrigger value="audit" className="font-mono data-[state=active]:bg-cyber-primary/20 data-[state=active]:text-cyber-primary">
            <FileText className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Total Orders</p>
                    <p className="text-3xl font-bold text-cyber-primary font-mono mt-1">{stats.total}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-cyber-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-cyber-card border-yellow-500/30 shadow-cyber">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400 font-mono mt-1">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-cyber-card border-blue-500/30 shadow-cyber">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Approved</p>
                    <p className="text-3xl font-bold text-blue-400 font-mono mt-1">{stats.approved}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-blue-400/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-cyber-card border-green-500/30 shadow-cyber">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyber-muted text-xs font-mono uppercase tracking-wider">Shipped</p>
                    <p className="text-3xl font-bold text-green-400 font-mono mt-1">{stats.shipped}</p>
                  </div>
                  <Truck className="w-8 h-8 text-green-400/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                    <Search className="w-3 h-3 inline mr-1" />
                    Search
                  </Label>
                  <Input
                    placeholder="Name, ID, Order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                    <Filter className="w-3 h-3 inline mr-1" />
                    Status Filter
                  </Label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
                    <SelectTrigger className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-card border-cyber-primary/30">
                      <SelectItem value="all" className="font-mono">All Orders</SelectItem>
                      <SelectItem value="pending" className="font-mono">Pending</SelectItem>
                      <SelectItem value="approved" className="font-mono">Approved</SelectItem>
                      <SelectItem value="shipped" className="font-mono">Shipped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                    Sort By
                  </Label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cyber-card border-cyber-primary/30">
                      <SelectItem value="newest" className="font-mono">Newest First</SelectItem>
                      <SelectItem value="oldest" className="font-mono">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                    Export
                  </Label>
                  <Button
                    onClick={handleExportCSV}
                    disabled={!filteredOrders || filteredOrders.length === 0}
                    className="w-full bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/50 text-cyber-primary font-mono"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {!filteredOrders || filteredOrders.length === 0 ? (
            <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
              <CardContent className="pt-12 pb-12 text-center">
                <Terminal className="w-16 h-16 mx-auto text-cyber-muted mb-4" />
                <h3 className="text-lg font-semibold mb-2 tracking-wide text-cyber-primary font-mono">
                  {searchQuery || statusFilter !== 'all' ? '[NO MATCHES FOUND]' : '[NO ORDERS]'}
                </h3>
                <p className="text-cyber-muted font-mono text-sm">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No orders have been created yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Select All */}
              <Card className="bg-cyber-card border-cyber-primary/30 shadow-cyber">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={handleToggleSelectAll}
                      className="border-cyber-primary/50"
                    />
                    <Label className="text-cyber-primary font-mono text-sm cursor-pointer" onClick={handleToggleSelectAll}>
                      Select All ({filteredOrders.length} orders)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {filteredOrders.map((order) => {
                  const isPending = order.status === 'pending';
                  const isApproved = order.status === 'approved';
                  const isShipped = order.status === 'shipped';
                  const currentTrackingInput = trackingInputs[order.id] ?? order.trackingNumber ?? '';
                  const isSaving = savingTrackingId === order.id;
                  const isDeleting = deletingOrderId === order.id;
                  const isUpdating = updatingOrderId === order.id;
                  const isSelected = selectedOrderIds.has(order.id);

                  return (
                    <Card key={order.id} className="bg-cyber-card border-cyber-primary/30 shadow-cyber hover:border-cyber-accent/50 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleOrderSelection(order.id)}
                              className="mt-1 border-cyber-primary/50"
                            />
                            <div className="space-y-2 flex-1">
                              <CardTitle className="text-lg tracking-wide text-cyber-primary font-mono">
                                {order.details.first_name} {order.details.last_name}
                              </CardTitle>
                              <div className="text-sm text-cyber-muted font-mono space-y-1">
                                <div>{order.details.state_name} • ID #{order.details.id_number}</div>
                                <div className="text-xs">Order: {order.id}</div>
                                <div className="text-xs">
                                  {new Date(Number(order.creationTime) / 1000000).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <Badge
                              variant="outline"
                              className={
                                isShipped
                                  ? 'bg-green-900/30 text-green-400 border-green-500/50 font-mono'
                                  : isApproved
                                  ? 'bg-blue-900/30 text-blue-400 border-blue-500/50 font-mono'
                                  : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50 font-mono'
                              }
                            >
                              {formatOrderStatus(order.status).toUpperCase()}
                            </Badge>
                            <div className="flex gap-2">
                              {isPending && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickAction(order.id, 'approve')}
                                  disabled={isUpdating || isDeleting}
                                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-400 font-mono text-xs"
                                >
                                  <Zap className="w-3 h-3 mr-1" />
                                  APPROVE
                                </Button>
                              )}
                              {isApproved && (
                                <Button
                                  size="sm"
                                  onClick={() => handleQuickAction(order.id, 'ship')}
                                  disabled={isUpdating || isDeleting}
                                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400 font-mono text-xs"
                                >
                                  <Truck className="w-3 h-3 mr-1" />
                                  SHIP
                                </Button>
                              )}
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                disabled={isUpdating || isDeleting}
                              >
                                <SelectTrigger className="w-[130px] border-cyber-primary/30 bg-cyber-bg font-mono text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-cyber-card border-cyber-primary/30">
                                  <SelectItem value="pending" className="font-mono">Pending</SelectItem>
                                  <SelectItem value="approved" className="font-mono">Approved</SelectItem>
                                  <SelectItem value="shipped" className="font-mono">Shipped</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isPending && (
                          <div className="space-y-2">
                            <Label className="text-cyber-muted font-mono text-xs uppercase tracking-wider">
                              Tracking Number
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                value={currentTrackingInput}
                                onChange={(e) => handleTrackingNumberChange(order.id, e.target.value)}
                                placeholder="Enter tracking number..."
                                disabled={isSaving || isDeleting}
                                className="bg-cyber-bg border-cyber-primary/30 text-cyber-primary font-mono"
                              />
                              <Button
                                onClick={() => handleSaveTrackingNumber(order.id)}
                                disabled={isSaving || isDeleting || !currentTrackingInput.trim()}
                                className="bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/50 text-cyber-primary font-mono"
                              >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isDeleting || isUpdating}
                                className="font-mono"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-cyber-card border-cyber-primary/30">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-cyber-primary font-mono">
                                  Delete Order?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-cyber-muted font-mono">
                                  This action cannot be undone. Order {order.id} will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-cyber-primary/30 font-mono">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id)}
                                  disabled={isDeleting}
                                  className="bg-destructive hover:bg-destructive/90 font-mono"
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* TREY C SECURITY Tab */}
        <TabsContent value="security">
          <TreyCSecuritySection />
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <AuditLogSection />
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Bar */}
      <BulkOrderActionsBar
        selectedOrderIds={Array.from(selectedOrderIds)}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
