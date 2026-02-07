import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useUserOrders } from '../hooks/orders/useUserOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Package, Info, X } from 'lucide-react';
import { formatDOB } from '../utils/dob';
import { normalizeStateName } from '../utils/stateFormat';

export default function DashboardPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/dashboard' }) as { orderCreated?: string };
  const { data: orders, isLoading } = useUserOrders();
  const [showGuidanceBanner, setShowGuidanceBanner] = useState(false);

  useEffect(() => {
    if (search.orderCreated === 'true') {
      setShowGuidanceBanner(true);
    }
  }, [search.orderCreated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'approved':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'shipped':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-chrome-300/20 text-chrome-300 border-chrome-300/30';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-chrome-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {showGuidanceBanner && (
        <div className="bg-green-500/10 border border-green-500/30 rounded p-3 sm:p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-green-300 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-green-200">
            <p className="font-semibold mb-1">Order created successfully!</p>
            <p className="text-green-200/80">
              Your order is now pending. Please contact the owner for payment methods. Once approved and shipped, you'll receive tracking information.
            </p>
          </div>
          <button
            onClick={() => setShowGuidanceBanner(false)}
            className="text-green-300 hover:text-green-200 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Track your ID orders</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/orders/new' })}
          className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="bg-card/80 border-chrome-300/20">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Package className="w-16 h-16 sm:w-20 sm:h-20 text-chrome-400/30 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-chrome-300 mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center mb-6 text-sm sm:text-base px-4">
              Create your first ID order to get started
            </p>
            <Button
              onClick={() => navigate({ to: '/orders/new' })}
              className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="bg-card/80 border-chrome-300/20 hover:shadow-chrome-glow transition-shadow cursor-pointer"
              onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id } })}
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="tracking-wide text-lg sm:text-xl">
                    {order.details.first_name} {order.details.last_name}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Order ID</span>
                    <span className="text-chrome-300 font-mono text-xs sm:text-sm break-all">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Date of Birth</span>
                    <span className="text-chrome-300">{formatDOB(order.details.dob)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">State</span>
                    <span className="text-chrome-300">{normalizeStateName(order.details.state_name)}</span>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <span className="text-muted-foreground block mb-1">Tracking</span>
                      <span className="text-green-300 font-mono text-xs sm:text-sm break-all">{order.trackingNumber}</span>
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
