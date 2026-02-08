import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useUserOrders } from '../hooks/orders/useUserOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Package, X } from 'lucide-react';
import { formatDOB } from '../utils/dob';
import { normalizeStateName } from '../utils/stateFormat';
import PageHeader from '../components/dashboard/PageHeader';
import OrderSuccessModal from '../components/OrderSuccessModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/dashboard' }) as { orderCreated?: string };
  const { data: orders, isLoading } = useUserOrders();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (search.orderCreated === 'true') {
      setShowSuccessModal(true);
    }
  }, [search.orderCreated]);

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Clear the search param
    navigate({ to: '/dashboard', search: {} });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'shipped':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <OrderSuccessModal open={showSuccessModal} onClose={handleCloseModal} />

      <PageHeader
        title="Dashboard"
        description="Track your ID orders"
        action={
          <Button
            onClick={() => navigate({ to: '/orders/new' })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full sm:w-auto h-11 text-base shadow-glow"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Order
          </Button>
        }
      />

      {!orders || orders.length === 0 ? (
        <Card className="bg-card/90 backdrop-blur border-border">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center mb-6 text-sm sm:text-base px-4">
              Create your first ID order to get started
            </p>
            <Button
              onClick={() => navigate({ to: '/orders/new' })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="bg-card/90 backdrop-blur border-border hover:shadow-glow hover:border-primary/50 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-primary/50 min-w-0 group"
              onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id } })}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate({ to: '/orders/$orderId', params: { orderId: order.id } });
                }
              }}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="tracking-wide text-lg sm:text-xl break-words min-w-0 text-foreground">
                    {order.details.first_name} {order.details.last_name}
                  </CardTitle>
                  <Badge className={`${getStatusColor(order.status)} shrink-0 font-medium`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm min-w-0">
                  <div className="min-w-0">
                    <span className="text-muted-foreground block mb-1">Order ID</span>
                    <span className="text-foreground font-mono text-xs sm:text-sm break-all">{order.id}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground block mb-1">Date of Birth</span>
                    <span className="text-foreground">{formatDOB(order.details.dob)}</span>
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground block mb-1">State</span>
                    <span className="text-foreground break-words">{normalizeStateName(order.details.state_name)}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="min-w-0">
                      <span className="text-muted-foreground block mb-1">Tracking</span>
                      <span className="text-green-600 dark:text-green-400 font-mono text-xs sm:text-sm break-all">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
