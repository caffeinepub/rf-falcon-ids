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

export default function VipCongratsDialog() {
  const { identity } = useInternetIdentity();
  const { isVIP, isFetched } = useIsCallerVIP();
  const [open, setOpen] = useState(false);
  const [hasShownForPrincipal, setHasShownForPrincipal] = useState(false);

  useEffect(() => {
    if (!identity || !isFetched) return;

    const principalId = identity.getPrincipal().toText();
    const storageKey = `vip-congrats-shown-${principalId}`;
    const hasShown = localStorage.getItem(storageKey) === 'true';

    // Show dialog if user is VIP and hasn't seen it for this principal
    if (isVIP && !hasShown && !hasShownForPrincipal) {
      setOpen(true);
      setHasShownForPrincipal(true);
      localStorage.setItem(storageKey, 'true');
    }

    // If user is no longer VIP, clear the shown flag
    if (!isVIP && hasShown) {
      localStorage.removeItem(storageKey);
      setHasShownForPrincipal(false);
    }
  }, [identity, isVIP, isFetched, hasShownForPrincipal]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center animate-pulse">
                <Crown className="w-12 h-12 text-yellow-400" />
              </div>
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            🎉 Congratulations! You&apos;re VIP! 🎉
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-2">
              <p className="text-yellow-400 font-semibold text-lg">
                You now have VIP status!
              </p>
              <p className="text-sm">
                Enjoy <span className="font-bold">10% off</span> all your orders automatically.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your VIP discount will be automatically applied to every order you place. No codes needed!
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={() => setOpen(false)} className="w-full">
            Awesome, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
