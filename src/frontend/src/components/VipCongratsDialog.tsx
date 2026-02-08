import { useEffect, useState } from 'react';
import { useIsCallerVIP } from '../hooks/auth/useIsCallerVIP';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';

const VIP_DIALOG_DISMISSED_KEY = 'vip-congrats-dismissed';

export default function VipCongratsDialog() {
  const { isVIP, isLoading, isFetched } = useIsCallerVIP();
  const { identity } = useInternetIdentity();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!identity || isLoading || !isFetched) return;

    if (isVIP) {
      const principal = identity.getPrincipal().toString();
      const dismissedKey = `${VIP_DIALOG_DISMISSED_KEY}-${principal}`;
      const wasDismissed = localStorage.getItem(dismissedKey);

      if (!wasDismissed) {
        setOpen(true);
      }
    }
  }, [isVIP, isLoading, isFetched, identity]);

  const handleClose = () => {
    if (identity) {
      const principal = identity.getPrincipal().toString();
      const dismissedKey = `${VIP_DIALOG_DISMISSED_KEY}-${principal}`;
      localStorage.setItem(dismissedKey, 'true');
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-yellow-500/10 via-background to-background border-yellow-500/30">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Crown className="w-16 h-16 text-yellow-400 animate-pulse" />
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Congrats you're VIP!
          </DialogTitle>
          <DialogDescription className="text-center text-lg pt-4">
            You get <span className="font-bold text-yellow-400">10% off</span> all orders by the admin.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
