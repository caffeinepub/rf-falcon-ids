import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/orders/useGetOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import IdCardPreview from '../components/IdCardPreview';
import IdCardActions from '../components/IdCardActions';
import { ArrowLeft, Loader2, AlertCircle, Package } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';
import { useEffect, useState } from 'react';
import { COPY } from '../content/copy';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    if (order?.photo) {
      order.photo.getBytes().then((bytes) => {
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPhotoUrl(url);
        return () => URL.revokeObjectURL(url);
      });
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-chrome-300" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Button
          onClick={() => navigate({ to: '/dashboard' })}
          variant="outline"
          className="mt-4 border-chrome-300/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate({ to: '/dashboard' })}
          variant="outline"
          size="sm"
          className="border-chrome-300/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-wider">Order Details</h1>
          <p className="text-muted-foreground mt-1">ID #{order.details.id_number}</p>
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
              ? 'bg-green-900/30 text-green-400 border-green-500/30'
              : order.status === 'approved'
              ? 'bg-chrome-900/30 text-chrome-300 border-chrome-300/30'
              : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
          }
        >
          {formatOrderStatus(order.status)}
        </Badge>
      </div>

      <div className="bg-card/80 border border-chrome-300/20 rounded p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-chrome-400 shrink-0 mt-0.5" />
        <p className="text-sm text-chrome-300">{COPY.NOVELTY_DISCLAIMER}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide">ID Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">First Name</div>
                  <div className="font-medium">{order.details.first_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Name</div>
                  <div className="font-medium">{order.details.last_name}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Date of Birth</div>
                <div className="font-medium">{order.details.dob}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Gender</div>
                  <div className="font-medium">{order.details.gender}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Height</div>
                  <div className="font-medium">{order.details.height}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Eye Color</div>
                <div className="font-medium">{order.details.eye_color}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Address</div>
                <div className="font-medium">{order.details.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">City</div>
                  <div className="font-medium">{order.details.city}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">ZIP</div>
                  <div className="font-medium">{order.details.zip}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">State</div>
                <div className="font-medium">{order.details.state_name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">ID Number</div>
                <div className="font-medium font-mono">{order.details.id_number}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">First Name</div>
                  <div className="font-medium">{order.address.first_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Last Name</div>
                  <div className="font-medium">{order.address.last_name}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Address</div>
                <div className="font-medium">{order.address.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">City</div>
                  <div className="font-medium">{order.address.city}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">ZIP</div>
                  <div className="font-medium">{order.address.zip}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">State</div>
                <div className="font-medium">{order.address.state}</div>
              </div>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card className="bg-card/80 border-chrome-300/20">
              <CardHeader>
                <CardTitle className="tracking-wide flex items-center gap-2">
                  <Package className="w-5 h-5 text-chrome-300" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Tracking Number</div>
                  <div className="font-medium font-mono text-chrome-300">{order.trackingNumber}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="bg-card/80 border-chrome-300/20 shadow-glow">
            <CardHeader>
              <CardTitle className="tracking-wide">ID Card Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <IdCardActions />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
