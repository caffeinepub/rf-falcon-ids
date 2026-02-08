import { useIsCallerVIP } from '../hooks/auth/useIsCallerVIP';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Crown } from 'lucide-react';
import { calculateVIPDiscount, formatPrice, BASE_ORDER_PRICE } from '../utils/vipPricing';

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OrderSuccessModal({ open, onClose }: OrderSuccessModalProps) {
  const { isVIP } = useIsCallerVIP();
  const discount = isVIP ? calculateVIPDiscount(BASE_ORDER_PRICE) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Order Created Successfully!</DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            {isVIP && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold">
                  <Crown className="w-5 h-5" />
                  VIP Discount Applied
                </div>
                <p className="text-sm">
                  You saved <span className="font-bold">{formatPrice(discount)}</span> on this order!
                </p>
              </div>
            )}
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Contact for Payment & Delivery:</p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Snapchat:</span> travis_c1
                </p>
                <p className="text-sm text-muted-foreground">Preferred: Cash</p>
                <p className="text-sm text-muted-foreground">If needed: Venmo or Cashapp</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your order has been submitted and is pending approval. You can track its status in your dashboard.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
