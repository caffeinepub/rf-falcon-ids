import { useEffect, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/orders/useGetOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Package } from 'lucide-react';
import IdCardPreview from '../components/IdCardPreview';
import IdCardActions from '../components/IdCardActions';
import { formatDOB } from '../utils/dob';
import { normalizeStateName } from '../utils/stateFormat';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    if (order?.photo) {
      order.photo
        .getBytes()
        .then((bytes) => {
          if (!mounted) return;
          const blob = new Blob([bytes], { type: 'image/jpeg' });
          objectUrl = URL.createObjectURL(blob);
          setPhotoUrl(objectUrl);
        })
        .catch((error) => {
          console.error('Failed to load photo:', error);
        });
    }

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [order?.photo]);

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

  if (!order) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/dashboard' })}
          className="text-chrome-300 hover:text-chrome-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Card className="bg-card/80 border-chrome-300/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-chrome-400/30 mb-4" />
            <h3 className="text-xl font-semibold text-chrome-300 mb-2">Order not found</h3>
            <p className="text-muted-foreground text-center px-4">
              The order you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/dashboard' })}
          className="text-chrome-300 hover:text-chrome-200 w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Badge className={getStatusColor(order.status)}>
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ID Preview */}
        <Card className="bg-card/80 border-chrome-300/20">
          <CardHeader>
            <CardTitle className="tracking-wide text-lg sm:text-xl">ID Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <IdCardPreview
                firstName={order.details.first_name}
                lastName={order.details.last_name}
                dob={order.details.dob}
                gender={order.details.gender}
                height={order.details.height}
                eyeColor={order.details.eye_color}
                idNumber={order.details.id_number}
                state={order.details.state_name}
                photoUrl={photoUrl}
              />
            </div>
            <IdCardActions
              firstName={order.details.first_name}
              lastName={order.details.last_name}
              dob={order.details.dob}
              gender={order.details.gender}
              height={order.details.height}
              eyeColor={order.details.eye_color}
              idNumber={order.details.id_number}
              state={order.details.state_name}
              photoUrl={photoUrl}
            />
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="space-y-6">
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">ID Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Name:</span>
                <span className="text-chrome-300 font-semibold text-right break-words">
                  {order.details.first_name} {order.details.last_name}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="text-chrome-300">{formatDOB(order.details.dob)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Gender:</span>
                <span className="text-chrome-300">{order.details.gender}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Height:</span>
                <span className="text-chrome-300">{order.details.height}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Eye Color:</span>
                <span className="text-chrome-300">{order.details.eye_color}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">ID Number:</span>
                <span className="text-chrome-300 font-mono break-all">{order.details.id_number}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">State:</span>
                <span className="text-chrome-300">{normalizeStateName(order.details.state_name)}</span>
              </div>
              <div className="pt-2 border-t border-chrome-300/10">
                <div className="text-muted-foreground mb-1">Address:</div>
                <div className="text-chrome-300 break-words">
                  {order.details.address}
                  <br />
                  {order.details.city}, {normalizeStateName(order.details.state_name)} {order.details.zip}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Name:</span>
                <span className="text-chrome-300 font-semibold text-right break-words">
                  {order.address.first_name} {order.address.last_name}
                </span>
              </div>
              <div className="pt-2 border-t border-chrome-300/10">
                <div className="text-muted-foreground mb-1">Shipping Address:</div>
                <div className="text-chrome-300 break-words">
                  {order.address.address}
                  <br />
                  {order.address.city}, {normalizeStateName(order.address.state)} {order.address.zip}
                </div>
              </div>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="tracking-wide text-green-300 text-lg sm:text-xl">Tracking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-sm text-green-200/80">Tracking Number:</span>
                  <span className="text-green-300 font-mono font-semibold break-all">{order.trackingNumber}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
