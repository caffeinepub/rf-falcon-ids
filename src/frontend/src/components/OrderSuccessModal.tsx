import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { SiSnapchat } from 'react-icons/si';
import { calculateVIPDiscount, formatPrice } from '../utils/vipPricing';
import { ORDER_BASE_PRICE, VIP_DISCOUNT_LABEL } from '../content/copy';

interface OrderSuccessModalProps {
  open: boolean;
  onClose: () => void;
  isVIP?: boolean;
}

export default function OrderSuccessModal({ open, onClose, isVIP = false }: OrderSuccessModalProps) {
  const vipDiscount = isVIP ? calculateVIPDiscount(ORDER_BASE_PRICE) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Order Created Successfully!</DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p>
              Your novelty ID order has been submitted and is being processed.
            </p>
            
            {isVIP && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  🎉 VIP Discount Applied!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {VIP_DISCOUNT_LABEL}: {formatPrice(vipDiscount)} saved on this order
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Your VIP status gives you 10% off all orders!
                </p>
              </div>
            )}

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-medium text-foreground mb-1">Contact Us</p>
                  <p className="text-sm">
                    For questions or updates, reach out on Snapchat:
                  </p>
                  <a
                    href="https://www.snapchat.com/add/travis_c1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline mt-2"
                  >
                    <SiSnapchat className="w-4 h-4" />
                    <span className="font-medium">travis_c1</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Payment:</strong> Send payment via Zelle to complete your order. Contact us on Snapchat for payment details.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
