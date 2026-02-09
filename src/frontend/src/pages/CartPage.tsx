import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../hooks/cart/useCart';
import { useCreateOrder } from '../hooks/orders/useCreateOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Loader2, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { calculateCartPricing } from '../utils/cartPricing';
import { normalizeOrderError } from '../utils/orderErrors';
import { COPIES_PER_ID_TEXT, MULTIPLE_ID_DISCOUNT_LABEL } from '../content/copy';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, clearCart, replaceWithFailedItems } = useCart();
  const createOrder = useCreateOrder();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const pricing = calculateCartPricing(items.length);

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    const failedItems: typeof items = [];
    let successCount = 0;

    try {
      for (const item of items) {
        try {
          // Convert photo data URL to bytes
          const photoResponse = await fetch(item.photoDataUrl);
          const photoBlob = await photoResponse.blob();
          const photoArrayBuffer = await photoBlob.arrayBuffer();
          const photoBytes = new Uint8Array(photoArrayBuffer);
          const photoExternalBlob = ExternalBlob.fromBytes(photoBytes);

          // Convert signature data URL to bytes if present
          let signatureBlob: ExternalBlob | null = null;
          if (item.signatureDataUrl) {
            const base64Data = item.signatureDataUrl.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            signatureBlob = ExternalBlob.fromBytes(bytes);
          }

          await createOrder.mutateAsync({
            id: item.id,
            details: item.details,
            address: item.address,
            photo: photoExternalBlob,
            promoCode: item.promoCode,
            signature: signatureBlob,
          });

          successCount++;
        } catch (error: any) {
          console.error(`Failed to create order ${item.id}:`, error);
          failedItems.push(item);
        }
      }

      if (successCount === items.length) {
        clearCart();
        toast.success(`Successfully created ${successCount} order${successCount > 1 ? 's' : ''}!`);
        navigate({ to: '/dashboard', search: { orderCreated: 'true' } });
      } else if (successCount > 0) {
        replaceWithFailedItems(failedItems);
        toast.warning(
          `${successCount} order${successCount > 1 ? 's' : ''} created successfully. ${failedItems.length} failed and remain in cart.`
        );
      } else {
        toast.error('All orders failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(normalizeOrderError(error));
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
              <p className="text-muted-foreground">
                Add some ID orders to your cart to get started
              </p>
            </div>
            <Button onClick={() => navigate({ to: '/orders/new' })} size="lg">
              <Package className="w-4 h-4 mr-2" />
              Create New Order
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Your Cart
          </h1>
          <p className="text-muted-foreground">{COPIES_PER_ID_TEXT}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.photoDataUrl}
                        alt={`${item.details.first_name} ${item.details.last_name}`}
                        className="w-20 h-20 rounded-lg object-cover border border-border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {item.details.first_name} {item.details.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.details.state_name} ID
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ships to: {item.address.city}, {item.address.state}
                      </p>
                      {item.promoCode && (
                        <p className="text-sm text-accent mt-1">
                          Promo: {item.promoCode}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <p className="font-semibold">$100.00</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({items.length} {items.length === 1 ? 'ID' : 'IDs'})
                    </span>
                    <span className="font-medium">{pricing.formattedSubtotal}</span>
                  </div>
                  {pricing.multipleIdDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-accent">{MULTIPLE_ID_DISCOUNT_LABEL}</span>
                      <span className="font-medium text-accent">{pricing.formattedDiscount}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{pricing.formattedTotal}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground text-center">
                    {COPIES_PER_ID_TEXT}
                  </p>
                  {pricing.multipleIdDiscount > 0 && (
                    <p className="text-xs text-accent text-center">
                      You're saving ${pricing.multipleIdDiscount.toFixed(2)} with multiple IDs!
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full"
                  size="lg"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Checkout ({items.length})
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate({ to: '/orders/new' })}
                  className="w-full"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Another ID
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
