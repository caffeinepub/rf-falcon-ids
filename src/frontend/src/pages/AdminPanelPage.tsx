import { useState, useMemo, lazy, Suspense } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { LayoutDashboard, Loader2, Trash2, Package, Search, Filter, TrendingUp, CheckCircle2, Clock, Truck, Database, Download, Shield, FileText, Users, Tag } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';
import { OrderStatus, type Order } from '../backend';
import { toast } from 'sonner';
import { exportOrdersToCSV } from '../utils/exportOrdersCsv';
import BulkOrderActionsBar from '../components/admin/BulkOrderActionsBar';

// Lazy load heavy admin sections
const TreyCSecuritySection = lazy(() => import('../components/admin/TreyCSecuritySection'));
const AuditLogSection = lazy(() => import('../components/admin/AuditLogSection'));
const AdminAccessSection = lazy(() => import('../components/admin/AdminAccessSection'));
const AdminAccountsSection = lazy(() => import('../components/admin/AdminAccountsSection'));
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
          <LayoutDashboard className="w-12 h-12 mx-auto text-admin-primary animate-pulse" />
          <div className="text-admin-primary text-sm">
            Loading admin panel...
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
          <div className="w-14 h-14 bg-admin-card rounded-lg flex items-center justify-center border border-admin-border shadow-lg">
            <LayoutDashboard className="w-7 h-7 text-admin-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-admin-foreground">
              Admin Dashboard
            </h1>
            <p className="text-admin-muted mt-1 text-sm">
              Manage orders, accounts, and system settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Database className="w-4 h-4 mr-2" />
                Reset System
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-admin-card border-admin-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-admin-foreground">
                  Reset System Data
                </AlertDialogTitle>
                <AlertDialogDescription className="text-admin-muted">
                  This action cannot be undone. All orders will be permanently deleted and the system will be reset to initial state.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetAllData}
                  disabled={resetAllData.isPending}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {resetAllData.isPending ? 'Resetting...' : 'Confirm Reset'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="bg-admin-card border border-admin-border">
          <TabsTrigger value="orders" className="text-admin-foreground data-[state=active]:bg-admin-primary data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="accounts" className="text-admin-foreground data-[state=active]:bg-admin-primary data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="promo" className="text-admin-foreground data-[state=active]:bg-admin-primary data-[state=active]:text-white">
            <Tag className="w-4 h-4 mr-2" />
            Promo Codes
          </TabsTrigger>
          <TabsTrigger value="security" className="text-admin-foreground data-[state=active]:bg-admin-primary data-[state=active]:text-white">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-admin-foreground data-[state=active]:bg-admin-primary data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="access" className="text-admin-foreground data-[state=active]:bg-admin-primary data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Admin Access
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-admin-card border-admin-border shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-admin-muted text-xs uppercase tracking-wider">Total Orders</p>
                    <p className="text-3xl font-bold text-admin-foreground mt-1">{stats.total}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-admin-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-admin-card border-yellow-500/30 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-admin-muted text-xs uppercase tracking-wider">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-admin-card border-blue-500/30 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-admin-muted text-xs uppercase tracking-wider">Approved</p>
                    <p className="text-3xl font-bold text-blue-400 mt-1">{stats.approved}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-admin-card border-green-500/30 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-admin-muted text-xs uppercase tracking-wider">Shipped</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">{stats.shipped}</p>
                  </div>
                  <Truck className="w-8 h-8 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-admin-card border-admin-border shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-admin-muted text-xs uppercase tracking-wider">
                    <Search className="w-3 h-3 inline mr-1" />
                    Search
                  </Label>
                  <Input
                    placeholder="Search orders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-admin-bg border-admin-border text-admin-foreground focus:ring-admin-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-admin-muted text-xs uppercase tracking-wider">
                    <Filter className="w-3 h-3 inline mr-1" />
                    Status Filter
                  </Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as FilterStatus)}>
                    <SelectTrigger className="bg-admin-bg border-admin-border text-admin-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-admin-card border-admin-border">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-admin-muted text-xs uppercase tracking-wider">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger className="bg-admin-bg border-admin-border text-admin-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-admin-card border-admin-border">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-admin-border">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSelectAll}
                    className="border-admin-border text-admin-foreground hover:bg-admin-primary/10"
                  >
                    <Checkbox
                      checked={selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0}
                      className="mr-2"
                    />
                    Select All ({filteredOrders.length})
                  </Button>
                  {selectedOrderIds.size > 0 && (
                    <span className="text-admin-muted text-sm">
                      {selectedOrderIds.size} selected
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={filteredOrders.length === 0}
                  className="border-admin-border text-admin-foreground hover:bg-admin-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card className="bg-admin-card border-admin-border shadow-lg">
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-admin-muted opacity-50 mb-4" />
                  <p className="text-admin-muted">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="bg-admin-card border-admin-border shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedOrderIds.has(order.id)}
                        onCheckedChange={() => handleToggleOrderSelection(order.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-admin-foreground">
                              {order.details.first_name} {order.details.last_name}
                            </h3>
                            <p className="text-sm text-admin-muted">ID: {order.details.id_number}</p>
                            <p className="text-xs text-admin-muted mt-1">Order: {order.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
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
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : order.status === 'approved'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }
                            >
                              {formatOrderStatus(order.status)}
                            </Badge>
                            {order.promoUsed && order.promoCode && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                                <Tag className="w-3 h-3 mr-1" />
                                {order.promoCode}
                              </Badge>
                            )}
                            {!order.promoUsed && (
                              <span className="text-xs text-admin-muted">No promo</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-admin-muted text-xs">Status</Label>
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                              disabled={updatingOrderId === order.id}
                            >
                              <SelectTrigger className="bg-admin-bg border-admin-border text-admin-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-admin-card border-admin-border">
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-admin-muted text-xs">Tracking Number</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder={order.trackingNumber || 'Enter tracking number'}
                                value={trackingInputs[order.id] || ''}
                                onChange={(e) => handleTrackingNumberChange(order.id, e.target.value)}
                                disabled={order.status === 'pending' || savingTrackingId === order.id}
                                className="bg-admin-bg border-admin-border text-admin-foreground"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveTrackingNumber(order.id)}
                                disabled={
                                  order.status === 'pending' ||
                                  !trackingInputs[order.id] ||
                                  savingTrackingId === order.id
                                }
                                className="bg-admin-primary hover:bg-admin-primary/90"
                              >
                                {savingTrackingId === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Save'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-admin-border">
                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleQuickAction(order.id, 'approve')}
                                disabled={updatingOrderId === order.id}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {order.status === 'approved' && (
                              <Button
                                size="sm"
                                onClick={() => handleQuickAction(order.id, 'ship')}
                                disabled={updatingOrderId === order.id}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Truck className="w-4 h-4 mr-1" />
                                Ship
                              </Button>
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deletingOrderId === order.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                {deletingOrderId === order.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-admin-card border-admin-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-admin-foreground">Delete Order</AlertDialogTitle>
                                <AlertDialogDescription className="text-admin-muted">
                                  Are you sure you want to delete this order? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">
                                  Cancel
                                </AlertDialogCancel>
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Suspense fallback={<TabLoadingFallback />}>
            <AdminAccountsSection />
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

        {/* Admin Access Tab */}
        <TabsContent value="access">
          <Suspense fallback={<TabLoadingFallback />}>
            <AdminAccessSection />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Bulk Actions Bar */}
      {selectedOrderIds.size > 0 && (
        <BulkOrderActionsBar
          selectedOrderIds={Array.from(selectedOrderIds)}
          onClearSelection={handleClearSelection}
        />
      )}
    </div>
  );
}
