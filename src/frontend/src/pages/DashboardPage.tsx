import { useNavigate } from '@tanstack/react-router';
import { useUserOrders } from '../hooks/orders/useUserOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useUserOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your roleplay ID orders</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/orders/new' })}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="bg-card/50">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first roleplay ID order to get started
              </p>
              <Button
                onClick={() => navigate({ to: '/orders/new' })}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
              className="bg-card/50 border-cyan-500/20 hover:border-cyan-500/40 transition-colors cursor-pointer"
              onClick={() => navigate({ to: '/orders/$orderId', params: { orderId: order.id } })}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {order.details.first_name} {order.details.last_name}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {order.details.state_name} • ID #{order.details.id_number}
                    </div>
                  </div>
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
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }
                  >
                    {formatOrderStatus(order.status)}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
