import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from '../hooks/orders/useCreateOrder';
import { useIsCallerVIP } from '../hooks/auth/useIsCallerVIP';
import { usePromoCodeValidation } from '../hooks/orders/usePromoCodeValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Crown, AlertCircle, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { US_STATES } from '../constants/usStates';
import PhotoUploader from '../components/PhotoUploader';
import { COPY } from '../content/copy';
import { ExternalBlob } from '../backend';
import { generateIdNumber } from '../utils/generateIdNumber';
import { calculateVIPDiscount, calculateVIPTotal, formatPrice, BASE_ORDER_PRICE } from '../utils/vipPricing';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { normalizeOrderError } from '../utils/orderErrors';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { isVIP, isLoading: vipLoading } = useIsCallerVIP();

  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoBlob, setPhotoBlob] = useState<ExternalBlob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [promoCode, setPromoCode] = useState<string>('');

  const promoValidation = usePromoCodeValidation(promoCode);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    gender: '',
    height: '',
    eyeColor: '',
    shippingFirstName: '',
    shippingLastName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelected = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const blob = ExternalBlob.fromBytes(uint8Array);
    setPhotoBlob(blob);
  };

  const handlePhotoClear = () => {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhotoUrl('');
    setPhotoBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous error message when starting a new submission
    setErrorMessage('');

    if (!photoBlob) {
      setErrorMessage('Please upload a photo');
      return;
    }

    // Generate a new order ID for each submission attempt
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const idNumber = generateIdNumber();

    // Prepare promo code: only send if valid
    const validPromoCode = promoValidation.isValid ? promoCode.trim().toUpperCase() : null;

    try {
      await createOrder.mutateAsync({
        id: orderId,
        details: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: formData.dob,
          address: formData.address,
          city: formData.city,
          state_name: formData.state,
          zip: formData.zip,
          gender: formData.gender,
          height: formData.height,
          eye_color: formData.eyeColor,
          id_number: idNumber,
        },
        address: {
          first_name: formData.shippingFirstName,
          last_name: formData.shippingLastName,
          address: formData.shippingAddress,
          city: formData.shippingCity,
          state: formData.shippingState,
          zip: formData.shippingZip,
        },
        photo: photoBlob,
        promoCode: validPromoCode,
      });

      // Success - navigate to dashboard with success indicator
      navigate({ to: '/dashboard', search: { orderCreated: 'true' } });
    } catch (error: any) {
      console.error('Order creation error:', error);
      
      // Use the error normalization utility to get a user-friendly message
      const message = normalizeOrderError(error);
      setErrorMessage(message);

      // Handle duplicate ID scenario by auto-retrying once with a new ID
      if (message.includes('Order ID conflict') && retryCount === 0) {
        setRetryCount(1);
        // Auto-retry after a brief delay
        setTimeout(() => {
          handleSubmit(e);
        }, 500);
      } else {
        // Reset retry count for next manual attempt
        setRetryCount(0);
      }
    }
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.dob &&
    formData.address &&
    formData.city &&
    formData.state &&
    formData.zip &&
    formData.gender &&
    formData.height &&
    formData.eyeColor &&
    formData.shippingFirstName &&
    formData.shippingLastName &&
    formData.shippingAddress &&
    formData.shippingCity &&
    formData.shippingState &&
    formData.shippingZip &&
    photoBlob;

  // Calculate pricing with promo discount
  const vipDiscount = isVIP ? calculateVIPDiscount(BASE_ORDER_PRICE) : 0;
  const priceAfterVIP = isVIP ? calculateVIPTotal(BASE_ORDER_PRICE) : BASE_ORDER_PRICE;
  const promoDiscount = promoValidation.isValid ? Math.round(priceAfterVIP * 0.05) : 0;
  const finalTotal = priceAfterVIP - promoDiscount;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Order</h1>
        <p className="text-muted-foreground mt-2">{COPY.ORDER_FORM_SUBTITLE}</p>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pricing Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Order Pricing
              {isVIP && <Crown className="w-5 h-5 text-yellow-400" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground">{COPY.ORDER_PRICE_LABEL}:</span>
              <span className="font-semibold">{formatPrice(BASE_ORDER_PRICE)}</span>
            </div>
            {isVIP && (
              <div className="flex justify-between items-center text-lg text-yellow-400">
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  {COPY.VIP_DISCOUNT_LABEL}:
                </span>
                <span className="font-semibold">-{formatPrice(vipDiscount)}</span>
              </div>
            )}
            {promoValidation.isValid && (
              <div className="flex justify-between items-center text-lg text-green-400">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Promo Discount (5%):
                </span>
                <span className="font-semibold">-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between items-center text-xl font-bold">
              <span>{COPY.TOTAL_LABEL}:</span>
              <span className={isVIP || promoValidation.isValid ? 'text-green-400' : 'text-primary'}>
                {formatPrice(finalTotal)}
              </span>
            </div>
            {(isVIP || promoValidation.isValid) && (
              <p className="text-sm text-green-400/80 text-center pt-2">
                🎉 You&apos;re saving {formatPrice(vipDiscount + promoDiscount)} on this order!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Promo Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Promo Code (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="promoCode">Enter Promo Code</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="promoCode"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={createOrder.isPending}
                    className={
                      promoCode.trim() && !promoValidation.isLoading
                        ? promoValidation.isValid
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-red-500 focus:ring-red-500'
                        : ''
                    }
                  />
                  {promoCode.trim() && !promoValidation.isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {promoValidation.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {promoValidation.isLoading && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Validating promo code...
              </p>
            )}
            {promoCode.trim() && !promoValidation.isLoading && promoValidation.isValid && (
              <p className="text-sm text-green-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Valid promo code! 5% discount will be applied.
              </p>
            )}
            {promoCode.trim() && !promoValidation.isLoading && !promoValidation.isValid && (
              <p className="text-sm text-red-500 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Invalid promo code. Please check and try again.
              </p>
            )}
            {promoValidation.error && (
              <p className="text-sm text-red-500">{promoValidation.error}</p>
            )}
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUploader
              onPhotoSelected={handlePhotoSelected}
              currentPhotoUrl={photoUrl}
              onClear={handlePhotoClear}
            />
          </CardContent>
        </Card>

        {/* ID Details */}
        <Card>
          <CardHeader>
            <CardTitle>ID Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth (MM/DD/YYYY)</Label>
              <Input
                id="dob"
                placeholder="MM/DD/YYYY"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                required
                disabled={createOrder.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                disabled={createOrder.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select 
                  value={formData.state} 
                  onValueChange={(value) => handleInputChange('state', value)}
                  disabled={createOrder.isPending}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                  disabled={createOrder.isPending}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="X">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  placeholder="e.g., 5'10&quot;"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eyeColor">Eye Color</Label>
                <Select 
                  value={formData.eyeColor} 
                  onValueChange={(value) => handleInputChange('eyeColor', value)}
                  disabled={createOrder.isPending}
                >
                  <SelectTrigger id="eyeColor">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRN">Brown</SelectItem>
                    <SelectItem value="BLU">Blue</SelectItem>
                    <SelectItem value="GRN">Green</SelectItem>
                    <SelectItem value="HZL">Hazel</SelectItem>
                    <SelectItem value="GRY">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingFirstName">First Name</Label>
                <Input
                  id="shippingFirstName"
                  value={formData.shippingFirstName}
                  onChange={(e) => handleInputChange('shippingFirstName', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingLastName">Last Name</Label>
                <Input
                  id="shippingLastName"
                  value={formData.shippingLastName}
                  onChange={(e) => handleInputChange('shippingLastName', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Address</Label>
              <Input
                id="shippingAddress"
                value={formData.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                required
                disabled={createOrder.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  value={formData.shippingCity}
                  onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingState">State</Label>
                <Select 
                  value={formData.shippingState} 
                  onValueChange={(value) => handleInputChange('shippingState', value)}
                  disabled={createOrder.isPending}
                >
                  <SelectTrigger id="shippingState">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingZip">ZIP Code</Label>
                <Input
                  id="shippingZip"
                  value={formData.shippingZip}
                  onChange={(e) => handleInputChange('shippingZip', e.target.value)}
                  required
                  disabled={createOrder.isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
            disabled={createOrder.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!isFormValid || createOrder.isPending} className="min-w-[140px]">
            {createOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
