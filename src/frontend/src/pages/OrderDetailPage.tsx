import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrder } from '../hooks/orders/useGetOrder';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, MapPin, Calendar, Hash, Download, Printer, Edit, User, Image as ImageIcon, FileSignature, Tag, Archive } from 'lucide-react';
import IdCardPreview from '../components/IdCardPreview';
import PageHeader from '../components/dashboard/PageHeader';
import { formatOrderStatus, formatTimestamp } from '../utils/formatters';
import { useIsAdmin } from '../hooks/auth/useIsAdmin';
import { useState, useEffect } from 'react';
import { exportIdCardToPNG, printIdCard } from '../utils/exportIdCard';
import { toast } from 'sonner';
import AdminEditOrderDialog from '../components/orders/AdminEditOrderDialog';
import CopyableMonospaceText from '../components/common/CopyableMonospaceText';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrder(orderId);
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (order?.photo) {
      setPhotoUrl(order.photo.getDirectURL());
    }
    if (order?.signature) {
      setSignatureUrl(order.signature.getDirectURL());
    }
  }, [order]);

  // Check if order is archived and user is not admin
  const isArchivedAndNotAdmin = order?.archived && !isAdmin && !adminLoading;

  const handleExport = async () => {
    if (!order) return;
    
    try {
      await exportIdCardToPNG(
        order.details.first_name,
        order.details.last_name,
        order.details.dob,
        order.details.gender,
        order.details.height,
        order.details.eye_color,
        order.details.id_number,
        order.details.state_name,
        photoUrl
      );
      toast.success('ID card exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export ID card');
    }
  };

  const handlePrint = () => {
    try {
      printIdCard();
      toast.success('Preparing to print...');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print ID card');
    }
  };

  if (isLoading || adminLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button onClick={() => navigate({ to: '/dashboard' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (isArchivedAndNotAdmin) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order Archived</h2>
        <p className="text-muted-foreground mb-6">
          This order has been archived and is no longer accessible.
        </p>
        <Button onClick={() => navigate({ to: '/dashboard' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Details"
        description={`Order #${order.id}`}
        action={
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Order
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        }
      />

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                <Badge variant={order.status === 'shipped' ? 'default' : 'secondary'} className="mt-1">
                  {formatOrderStatus(order.status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Created</p>
                <p className="text-sm font-medium mt-1 truncate">
                  {formatTimestamp(order.creationTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Hash className="w-8 h-8 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">ID Number</p>
                <p className="text-sm font-medium font-mono mt-1 truncate">
                  {order.details.id_number}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Shipping To</p>
                <p className="text-sm font-medium mt-1 truncate">
                  {order.address.city}, {order.address.state}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin-only metadata section */}
      {isAdmin && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Admin Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.owner && (
                <CopyableMonospaceText
                  text={order.owner.toString()}
                  label="Owner Principal"
                />
              )}
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Promo Used</p>
                <Badge variant={order.promoUsed ? 'default' : 'secondary'}>
                  {order.promoUsed ? 'Yes (VIP 10%)' : 'No'}
                </Badge>
              </div>
              
              {order.promoCode && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Promo Code</p>
                  <p className="text-sm font-mono bg-muted p-3 rounded border border-border">
                    {order.promoCode}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Archived Status</p>
                <Badge variant={order.archived ? 'secondary' : 'outline'}>
                  {order.archived ? (
                    <>
                      <Archive className="w-3 h-3 mr-1" />
                      Archived
                    </>
                  ) : (
                    'Active'
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ID Card Preview */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <IdCardPreview 
              details={order.details} 
              photoUrl={photoUrl}
              signatureUrl={signatureUrl}
            />
            <div className="flex gap-3">
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PNG
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin-only Photo and Signature section */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Photo
              </h3>
              {photoUrl ? (
                <div className="space-y-3">
                  <img 
                    src={photoUrl} 
                    alt="Order photo" 
                    className="w-full h-auto rounded border border-border"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(photoUrl, '_blank')}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    View Full Size
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photo available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileSignature className="w-5 h-5" />
                Signature
              </h3>
              {signatureUrl ? (
                <div className="space-y-3">
                  <img 
                    src={signatureUrl} 
                    alt="Order signature" 
                    className="w-full h-auto rounded border border-border bg-white"
                  />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(signatureUrl, '_blank')}
                  >
                    <FileSignature className="w-4 h-4 mr-2" />
                    View Full Size
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No signature available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shipping Address */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Shipping Address
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">
              {order.address.first_name} {order.address.last_name}
            </p>
            <p className="break-words">{order.address.address}</p>
            <p>
              {order.address.city}, {order.address.state} {order.address.zip}
            </p>
          </div>
        </CardContent>
      </Card>

      {order.trackingNumber && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Tracking Number</h3>
            <p className="text-sm font-mono bg-muted p-3 rounded break-all">
              {order.trackingNumber}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Admin Edit Dialog */}
      {isAdmin && (
        <AdminEditOrderDialog
          order={order}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
