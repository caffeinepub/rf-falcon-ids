import { useNavigate } from '@tanstack/react-router';
import { useUserOrders } from '../hooks/orders/useUserOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Package } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useUserOrders();

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
        <div>
          <h1 className="text-3xl font-bold tracking-wider">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your novelty ID orders</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/orders/new' })}
          className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="bg-card/80 border-chrome-300/20">
          <CardContent className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-chrome-900/50 rounded-full flex items-center justify-center mx-auto border border-chrome-300/20">
              <Package className="w-8 h-8 text-chrome-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first novelty ID order to get started
              </p>
              <Button
                onClick={() => navigate({ to: '/orders/new' })}
                className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="bg-card/80 border-chrome-300/20 hover:shadow-chrome-glow transition-shadow cursor-pointer"
              onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id } })}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg tracking-wide">
                    {order.details.first_name} {order.details.last_name}
                  </CardTitle>
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">ID Number</div>
                    <div className="font-mono text-chrome-300">{order.details.id_number}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">State</div>
                    <div>{order.details.state_name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">DOB</div>
                    <div>{order.details.dob}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Order ID</div>
                    <div className="font-mono text-xs">{order.id}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
