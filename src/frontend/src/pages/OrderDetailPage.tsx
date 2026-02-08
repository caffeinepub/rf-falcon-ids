import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/orders/useGetOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import IdCardPreview from '../components/IdCardPreview';
import IdCardActions from '../components/IdCardActions';
import { formatDOB } from '../utils/dob';
import { normalizeStateName } from '../utils/stateFormat';
import PageHeader from '../components/dashboard/PageHeader';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);

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
        <PageHeader title="Order Not Found" />
        <Card className="bg-card/80 border-chrome-300/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const photoUrl = order.photo.getDirectURL();

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={() => navigate({ to: '/dashboard' })}
          variant="ghost"
          className="self-start h-10 px-3 sm:px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge className={`${getStatusColor(order.status)} self-start sm:self-auto`}>
          {getStatusLabel(order.status)}
        </Badge>
      </div>

      <PageHeader
        title={`${order.details.first_name} ${order.details.last_name}`}
        description={`Order ID: ${order.id}`}
      />

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 min-w-0">
        {/* Preview Column */}
        <div className="space-y-6 min-w-0 order-1 lg:order-1">
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">ID Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <IdCardPreview
                firstName={order.details.first_name}
                lastName={order.details.last_name}
                dob={formatDOB(order.details.dob)}
                gender={order.details.gender}
                height={order.details.height}
                eyeColor={order.details.eye_color}
                idNumber={order.details.id_number}
                state={order.details.state_name}
                photoUrl={photoUrl}
              />
              <IdCardActions
                firstName={order.details.first_name}
                lastName={order.details.last_name}
                dob={formatDOB(order.details.dob)}
                gender={order.details.gender}
                height={order.details.height}
                eyeColor={order.details.eye_color}
                idNumber={order.details.id_number}
                state={order.details.state_name}
                photoUrl={photoUrl}
              />
            </CardContent>
          </Card>
        </div>

        {/* Details Column */}
        <div className="space-y-6 min-w-0 order-2 lg:order-2">
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm min-w-0">
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">First Name</span>
                  <span className="text-chrome-300 break-words">{order.details.first_name}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Last Name</span>
                  <span className="text-chrome-300 break-words">{order.details.last_name}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Date of Birth</span>
                  <span className="text-chrome-300">{formatDOB(order.details.dob)}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Gender</span>
                  <span className="text-chrome-300">{order.details.gender}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Height</span>
                  <span className="text-chrome-300">{order.details.height}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Eye Color</span>
                  <span className="text-chrome-300">{order.details.eye_color}</span>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <span className="text-muted-foreground block mb-1">Address</span>
                  <span className="text-chrome-300 break-words">{order.details.address}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">City</span>
                  <span className="text-chrome-300 break-words">{order.details.city}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">State</span>
                  <span className="text-chrome-300 break-words">{normalizeStateName(order.details.state_name)}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">ZIP Code</span>
                  <span className="text-chrome-300">{order.details.zip}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">ID Number</span>
                  <span className="text-chrome-300 font-mono text-xs sm:text-sm break-all">{order.details.id_number}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm min-w-0">
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Name</span>
                  <span className="text-chrome-300 break-words">
                    {order.address.first_name} {order.address.last_name}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">Address</span>
                  <span className="text-chrome-300 break-words">{order.address.address}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-muted-foreground block mb-1">City, State ZIP</span>
                  <span className="text-chrome-300 break-words">
                    {order.address.city}, {order.address.state} {order.address.zip}
                  </span>
                </div>
                {order.trackingNumber && (
                  <div className="min-w-0">
                    <span className="text-muted-foreground block mb-1">Tracking Number</span>
                    <span className="text-green-300 font-mono text-xs sm:text-sm break-all">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
