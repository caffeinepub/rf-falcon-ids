import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import { useGetPromoCodes, useAddPromoCode, useRemovePromoCode } from '../../hooks/admin/useAdminPromoCodes';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PromoCodesSection() {
  const { data: promoCodes, isLoading, error } = useGetPromoCodes();
  const addPromoCode = useAddPromoCode();
  const removePromoCode = useRemovePromoCode();

  const [newPromoCode, setNewPromoCode] = useState('');
  const [removingCode, setRemovingCode] = useState<string | null>(null);

  const handleAddPromoCode = async () => {
    const trimmedCode = newPromoCode.trim().toUpperCase();
    
    if (!trimmedCode) {
      toast.error('Please enter a promo code');
      return;
    }

    if (promoCodes?.some(promo => promo.code === trimmedCode)) {
      toast.error('This promo code already exists');
      return;
    }

    try {
      await addPromoCode.mutateAsync(trimmedCode);
      toast.success('Promo code added successfully');
      setNewPromoCode('');
    } catch (error: any) {
      console.error('Add promo code error:', error);
      toast.error(error.message || 'Failed to add promo code');
    }
  };

  const handleRemovePromoCode = async (code: string) => {
    setRemovingCode(code);
    try {
      await removePromoCode.mutateAsync(code);
      toast.success('Promo code removed successfully');
    } catch (error: any) {
      console.error('Remove promo code error:', error);
      toast.error(error.message || 'Failed to remove promo code');
    } finally {
      setRemovingCode(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full bg-admin-card" />
        <Skeleton className="h-48 w-full bg-admin-card" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load promo codes. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter only active promo codes
  const activePromoCodes = promoCodes?.filter(promo => promo.active) || [];

  return (
    <div className="space-y-6">
      {/* Add Promo Code Card */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-admin-foreground">
            <Plus className="w-5 h-5 text-admin-primary" />
            Add New Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newPromoCode" className="text-admin-muted text-xs uppercase tracking-wider">
                Promo Code
              </Label>
              <Input
                id="newPromoCode"
                placeholder="Enter promo code (e.g., SAVE5)"
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddPromoCode();
                  }
                }}
                disabled={addPromoCode.isPending}
                className="bg-admin-bg border-admin-border text-admin-foreground focus:ring-admin-primary"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddPromoCode}
                disabled={addPromoCode.isPending || !newPromoCode.trim()}
                className="bg-admin-primary hover:bg-admin-primary/90 text-white"
              >
                {addPromoCode.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Code
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-admin-muted text-sm">
            All promo codes provide a 5% discount at checkout. Codes are case-insensitive.
          </p>
        </CardContent>
      </Card>

      {/* Active Promo Codes List */}
      <Card className="bg-admin-card border-admin-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-admin-foreground">
            <Tag className="w-5 h-5 text-admin-primary" />
            Active Promo Codes ({activePromoCodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePromoCodes.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 mx-auto text-admin-muted opacity-50 mb-4" />
              <p className="text-admin-muted">No promo codes available</p>
              <p className="text-admin-muted text-sm mt-2">Add your first promo code above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePromoCodes.map((promo) => (
                <div
                  key={promo.code}
                  className="flex items-center justify-between p-4 bg-admin-bg border border-admin-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-admin-primary" />
                    <div>
                      <Badge variant="outline" className="font-mono text-sm border-admin-primary text-admin-primary">
                        {promo.code}
                      </Badge>
                      <p className="text-xs text-admin-muted mt-1">{Number(promo.discountPercentage)}% off</p>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={removingCode === promo.code}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {removingCode === promo.code ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-admin-card border-admin-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-admin-foreground">
                          Remove Promo Code
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-admin-muted">
                          Are you sure you want to remove the promo code <span className="font-mono font-bold">{promo.code}</span>? 
                          This code will no longer be valid for checkout.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-admin-border text-admin-foreground hover:bg-admin-card">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemovePromoCode(promo.code)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
