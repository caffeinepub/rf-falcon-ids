import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from '../hooks/orders/useCreateOrder';
import { useIsCallerVIP } from '../hooks/auth/useIsCallerVIP';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Crown, AlertCircle } from 'lucide-react';
import { US_STATES } from '../constants/usStates';
import PhotoUploader from '../components/PhotoUploader';
import { COPY } from '../content/copy';
import { ExternalBlob } from '../backend';
import { generateIdNumber } from '../utils/generateIdNumber';
import { calculateVIPDiscount, calculateVIPTotal, formatPrice, BASE_ORDER_PRICE } from '../utils/vipPricing';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { isVIP, isLoading: vipLoading } = useIsCallerVIP();

  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoBlob, setPhotoBlob] = useState<ExternalBlob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
    setErrorMessage('');

    if (!photoBlob) {
      setErrorMessage('Please upload a photo');
      return;
    }

    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const idNumber = generateIdNumber();

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
      });

      navigate({ to: '/dashboard', search: { orderCreated: 'true' } });
    } catch (error: any) {
      console.error('Order creation error:', error);
      
      // Extract user-friendly error message
      let message = 'Failed to create order. Please try again.';
      
      if (error.message) {
        // Check for ban-related errors
        if (error.message.includes('banned')) {
          message = 'Your account has been banned from placing orders. Please contact support.';
        } else if (error.message.includes('Unauthorized')) {
          message = 'You must be logged in to create an order.';
        } else {
          message = error.message;
        }
      }
      
      setErrorMessage(message);
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

  const discount = isVIP ? calculateVIPDiscount(BASE_ORDER_PRICE) : 0;
  const total = isVIP ? calculateVIPTotal(BASE_ORDER_PRICE) : BASE_ORDER_PRICE;

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
                <span className="font-semibold">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between items-center text-xl font-bold">
              <span>{COPY.TOTAL_LABEL}:</span>
              <span className={isVIP ? 'text-yellow-400' : 'text-primary'}>{formatPrice(total)}</span>
            </div>
            {isVIP && (
              <p className="text-sm text-yellow-400/80 text-center pt-2">
                🎉 You&apos;re saving {formatPrice(discount)} with your VIP status!
              </p>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
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
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eyeColor">Eye Color</Label>
                <Select value={formData.eyeColor} onValueChange={(value) => handleInputChange('eyeColor', value)}>
                  <SelectTrigger id="eyeColor">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRN">Brown</SelectItem>
                    <SelectItem value="BLU">Blue</SelectItem>
                    <SelectItem value="GRN">Green</SelectItem>
                    <SelectItem value="HZL">Hazel</SelectItem>
                    <SelectItem value="GRY">Gray</SelectItem>
                    <SelectItem value="BLK">Black</SelectItem>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingLastName">Last Name</Label>
                <Input
                  id="shippingLastName"
                  value={formData.shippingLastName}
                  onChange={(e) => handleInputChange('shippingLastName', e.target.value)}
                  required
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingState">State</Label>
                <Select
                  value={formData.shippingState}
                  onValueChange={(value) => handleInputChange('shippingState', value)}
                >
                  <SelectTrigger id="shippingState">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
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
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!isFormValid || createOrder.isPending}
        >
          {createOrder.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Order...
            </>
          ) : (
            'Create Order'
          )}
        </Button>
      </form>
    </div>
  );
}
