import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/orders/useGetOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import IdCardPreview from '../components/IdCardPreview';
import IdCardActions from '../components/IdCardActions';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { formatOrderStatus } from '../utils/formatters';
import { useState, useEffect } from 'react';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrder(orderId);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    if (order?.photo) {
      const url = order.photo.getDirectURL();
      setPhotoUrl(url);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate({ to: '/dashboard' })}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/dashboard' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {order.details.first_name} {order.details.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">Order #{order.id}</p>
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

      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <p className="text-sm text-purple-200">
          This is a roleplay identification card. It is not valid for official use or real-world identification purposes.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-card/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle>ID Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">First Name</div>
                  <div className="font-medium">{order.details.first_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Last Name</div>
                  <div className="font-medium">{order.details.last_name}</div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Date of Birth</div>
                  <div className="font-medium">{order.details.dob}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Gender</div>
                  <div className="font-medium">{order.details.gender}</div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Height</div>
                  <div className="font-medium">{order.details.height}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Eye Color</div>
                  <div className="font-medium">{order.details.eye_color}</div>
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground">Address</div>
                <div className="font-medium">{order.details.address}</div>
                <div className="font-medium">
                  {order.details.city}, {order.details.state_name} {order.details.zip}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground">ID Number</div>
                <div className="font-medium font-mono">{order.details.id_number}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Name</div>
                <div className="font-medium">
                  {order.address.first_name} {order.address.last_name}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground">Address</div>
                <div className="font-medium">{order.address.address}</div>
                <div className="font-medium">
                  {order.address.city}, {order.address.state} {order.address.zip}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="bg-card/50 border-cyan-500/20">
            <CardHeader>
              <CardTitle>ID Card</CardTitle>
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
