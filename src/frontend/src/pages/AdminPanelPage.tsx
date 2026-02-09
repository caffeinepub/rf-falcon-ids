import { useState, useMemo, lazy, Suspense } from 'react';
import { useAllOrders } from '../hooks/orders/useAllOrders';
import { useArchivedOrders } from '../hooks/orders/useArchivedOrders';
import { useUpdateOrderStatus } from '../hooks/orders/useUpdateOrderStatus';
import { useSetTrackingNumber } from '../hooks/orders/useSetTrackingNumber';
import { useDeleteOrder } from '../hooks/orders/useDeleteOrder';
import { useArchiveOrder } from '../hooks/orders/useArchiveOrder';
import { useAdminResetAllData } from '../hooks/admin/useAdminResetAllData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { LayoutDashboard, Loader2, Trash2, Package, Search, Filter, TrendingUp, CheckCircle2, Clock, Truck, Database, Download, Shield, FileText, Users, Tag, Archive, Edit, Image as ImageIcon, FileSignature } from 'lucide-react';
import { formatOrderStatus, formatTimestamp } from '../utils/formatters';
import { OrderStatus, type Order } from '../backend';
import { toast } from 'sonner';
import { exportOrdersToCSV } from '../utils/exportOrdersCsv';
import BulkOrderActionsBar from '../components/admin/BulkOrderActionsBar';
import AdminOrderOwnerAccountControls from '../components/admin/AdminOrderOwnerAccountControls';
import AdminEditOrderDialog from '../components/orders/AdminEditOrderDialog';
import CopyableMonospaceText from '../components/common/CopyableMonospaceText';

// Lazy load heavy admin sections
const TreyCSecuritySection = lazy(() => import('../components/admin/TreyCSecuritySection'));
const AuditLogSection = lazy(() => import('../components/admin/AuditLogSection'));
const AdminAccessSection = lazy(() => import('../components/admin/AdminAccessSection'));
const PromoCodesSection = lazy(() => import('../components/admin/PromoCodesSection'));

type SortOption = 'newest' | 'oldest';
type FilterStatus = 'all' | OrderStatus;

// Tab loading fallback
function TabLoadingFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full bg-admin-card" />
      <Skeleton className="h-32 w-full bg-admin-card" />
      <Skeleton className="h-32 w-full bg-admin-card" />
    </div>
  );
}

export default function AdminPanelPage() {
  const { data: orders, isLoading } = useAllOrders();
  const { data: archivedOrders, isLoading: archivedLoading } = useArchivedOrders();
  const updateStatus = useUpdateOrderStatus();
  const setTrackingNumber = useSetTrackingNumber();
  const deleteOrder = useDeleteOrder();
  const archiveOrder = useArchiveOrder();
  const resetAllData = useAdminResetAllData();
  
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [savingTrackingId, setSavingTrackingId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [archivingOrderId, setArchivingOrderId] = useState<string | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
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
    if (!orders) return { total: 0, pending: 0, approved: 0, shipped: 0, completed: 0 };
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      completed: orders.filter(o => o.status === 'completed').length,
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

  const handleArchiveOrder = async (orderId: string) => {
    setArchivingOrderId(orderId);
    try {
      await archiveOrder.mutateAsync(orderId);
      toast.success('Order marked as completed and archived');
      setSelectedOrderIds((prev) => {
        const updated = new Set(prev);
        updated.delete(orderId);
        return updated;
      });
    } catch (error: any) {
      console.error('Archive error:', error);
      toast.error(error.message || 'Failed to archive order');
    } finally {
      setArchivingOrderId(null);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setEditDialogOpen(true);
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
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const renderOrderCard = (order: Order) => {
    const isUpdating = updatingOrderId === order.id;
    const isSavingTracking = savingTrackingId === order.id;
    const isDeleting = deletingOrderId === order.id;
    const isArchiving = archivingOrderId === order.id;
    const isSelected = selectedOrderIds.has(order.id);

    return (
      <Card key={order.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggleOrderSelection(order.id)}
                aria-label={`Select order ${order.id}`}
              />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {order.details.first_name} {order.details.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-mono truncate">
                  ID: {order.details.id_number}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(order.creationTime)}
                </p>
              </div>
            </div>
            <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'}>
              {formatOrderStatus(order.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Admin metadata */}
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-mono text-xs break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider mb-1">Promo Used</p>
                <Badge variant={order.promoUsed ? 'default' : 'outline'} className="text-xs">
                  {order.promoUsed ? 'VIP 10%' : 'None'}
                </Badge>
              </div>
              {order.promoCode && (
                <div className="col-span-2">
                  <p className="text-muted-foreground uppercase tracking-wider mb-1">Promo Code</p>
                  <p className="font-mono text-xs bg-background p-2 rounded border">{order.promoCode}</p>
                </div>
              )}
              {order.owner && (
                <div className="col-span-2">
                  <p className="text-muted-foreground uppercase tracking-wider mb-1">Owner Principal</p>
                  <p className="font-mono text-xs bg-background p-2 rounded border break-all">
                    {order.owner.toString()}
                  </p>
                </div>
              )}
              {order.trackingNumber && (
                <div className="col-span-2">
                  <p className="text-muted-foreground uppercase tracking-wider mb-1">Tracking Number</p>
                  <p className="font-mono text-xs bg-background p-2 rounded border break-all">
                    {order.trackingNumber}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground uppercase tracking-wider mb-1">Archived</p>
                <Badge variant={order.archived ? 'secondary' : 'outline'} className="text-xs">
                  {order.archived ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            {/* Photo and Signature access */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(order.photo.getDirectURL(), '_blank')}
              >
                <ImageIcon className="w-3 h-3 mr-1" />
                Photo
              </Button>
              {order.signature && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (order.signature) {
                      window.open(order.signature.getDirectURL(), '_blank');
                    }
                  }}
                >
                  <FileSignature className="w-3 h-3 mr-1" />
                  Signature
                </Button>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</p>
            <div className="space-y-1">
              <p className="font-medium">
                {order.address.first_name} {order.address.last_name}
              </p>
              <p className="break-words">{order.address.address}</p>
              <p>
                {order.address.city}, {order.address.state} {order.address.zip}
              </p>
            </div>
          </div>

          {/* Account Controls */}
          {order.owner && (
            <AdminOrderOwnerAccountControls order={order} />
          )}

          {/* Status Update */}
          <div className="space-y-2">
            <Label htmlFor={`status-${order.id}`} className="text-xs">Update Status</Label>
            <div className="flex gap-2">
              <Select
                value={order.status}
                onValueChange={(value) => handleStatusChange(order.id, value)}
                disabled={isUpdating}
              >
                <SelectTrigger id={`status-${order.id}`} className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction(order.id, 'approve')}
                disabled={isUpdating}
                className="flex-1"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Approve
              </Button>
            )}
            {order.status === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickAction(order.id, 'ship')}
                disabled={isUpdating}
                className="flex-1"
              >
                <Truck className="w-3 h-3 mr-1" />
                Ship
              </Button>
            )}
          </div>

          {/* Tracking Number */}
          {!order.trackingNumber && (
            <div className="space-y-2">
              <Label htmlFor={`tracking-${order.id}`} className="text-xs">Add Tracking Number</Label>
              <div className="flex gap-2">
                <Input
                  id={`tracking-${order.id}`}
                  placeholder="Enter tracking number"
                  value={trackingInputs[order.id] || ''}
                  onChange={(e) => handleTrackingNumberChange(order.id, e.target.value)}
                  disabled={isSavingTracking}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={() => handleSaveTrackingNumber(order.id)}
                  disabled={isSavingTracking || !trackingInputs[order.id]?.trim()}
                >
                  {isSavingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditOrder(order)}
              className="flex-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isArchiving}
                  className="flex-1"
                >
                  {isArchiving ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Archive className="w-3 h-3 mr-1" />
                  )}
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark the order as completed and move it to the archived orders list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleArchiveOrder(order.id)}>
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the order.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteOrder(order.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage orders and system settings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-bold mt-1">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Shipped</p>
                <p className="text-2xl font-bold mt-1">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold mt-1">{stats.completed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="orders">
            <Package className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="w-4 h-4 mr-2" />
            Archived
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Users className="w-4 h-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="promo">
            <Tag className="w-4 h-4 mr-2" />
            Promo Codes
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-xs">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Name, ID number, Order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-xs">Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                    <SelectTrigger id="status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort" className="text-xs">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger id="sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSelectAll}
                  >
                    {selectedOrderIds.size === filteredOrders.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  {selectedOrderIds.size > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedOrderIds.size} selected
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={!filteredOrders || filteredOrders.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        {/* Archived Tab */}
        <TabsContent value="archived" className="space-y-6">
          {archivedLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : !archivedOrders || archivedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No archived orders</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {archivedOrders.map(renderOrderCard)}
            </div>
          )}
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Suspense fallback={<TabLoadingFallback />}>
            <AdminAccessSection />
          </Suspense>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promo">
          <Suspense fallback={<TabLoadingFallback />}>
            <PromoCodesSection />
          </Suspense>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Suspense fallback={<TabLoadingFallback />}>
            <TreyCSecuritySection />
          </Suspense>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Suspense fallback={<TabLoadingFallback />}>
            <AuditLogSection />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Bar */}
      <BulkOrderActionsBar
        selectedCount={selectedOrderIds.size}
        onClearSelection={() => setSelectedOrderIds(new Set())}
      />

      {/* Edit Order Dialog */}
      {editingOrder && (
        <AdminEditOrderDialog
          order={editingOrder}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditingOrder(null);
            }
          }}
        />
      )}
    </div>
  );
}
