import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from '../hooks/orders/useCreateOrder';
import { useIsCallerVIP } from '../hooks/auth/useIsCallerVIP';
import { usePromoCodeValidation } from '../hooks/orders/usePromoCodeValidation';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useCart } from '../hooks/cart/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Tag, CheckCircle2, XCircle, ShoppingCart, Send } from 'lucide-react';
import { toast } from 'sonner';
import PhotoUploader from '../components/PhotoUploader';
import PhotoCropModal from '../components/PhotoCropModal';
import SignaturePad from '../components/SignaturePad';
import USStateSelect from '../components/forms/USStateSelect';
import { US_STATES } from '../constants/usStates';
import { HEIGHT_OPTIONS } from '../constants/heights';
import { generateIdNumber } from '../utils/generateIdNumber';
import { normalizeText } from '../utils/validation';
import { ExternalBlob } from '../backend';
import { calculateVIPDiscount, calculateVIPTotal, formatPrice } from '../utils/vipPricing';
import { ORDER_BASE_PRICE, ORDER_PRICE_LABEL, VIP_DISCOUNT_LABEL, TOTAL_LABEL } from '../content/copy';

const MAX_RETRIES = 3;

export default function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { data: isVIP, isLoading: vipLoading } = useIsCallerVIP();
  const { addItem } = useCart();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);
  
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const debouncedPromoCode = useDebouncedValue(promoCode, 500);
  
  // Validate promo code with debounced value
  const promoValidation = usePromoCodeValidation(debouncedPromoCode);

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState(0);

  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
    setShowCropModal(true);
  };

  const handlePhotoCropped = (croppedUrl: string) => {
    setCroppedPhotoUrl(croppedUrl);
    setShowCropModal(false);
    
    // Clear error when photo is selected
    if (errors.photo) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.photo;
        return updated;
      });
    }
  };

  const handleClearPhoto = () => {
    setCroppedPhotoUrl('');
    setSelectedFileUrl('');
    setSelectedFile(null);
  };

  const handleInputChange = (field: string, value: string) => {
    const normalized = normalizeText(value);
    setFormData((prev) => ({ ...prev, [field]: normalized }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // ID Card Details
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    if (!formData.zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.height) {
      newErrors.height = 'Height is required';
    }
    if (!formData.eyeColor.trim()) {
      newErrors.eyeColor = 'Eye color is required';
    }

    // Shipping Address
    if (!formData.shippingFirstName.trim()) {
      newErrors.shippingFirstName = 'First name is required';
    }
    if (!formData.shippingLastName.trim()) {
      newErrors.shippingLastName = 'Last name is required';
    }
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Address is required';
    }
    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = 'City is required';
    }
    if (!formData.shippingState) {
      newErrors.shippingState = 'State is required';
    }
    if (!formData.shippingZip.trim()) {
      newErrors.shippingZip = 'ZIP code is required';
    }

    // Photo
    if (!croppedPhotoUrl) {
      newErrors.photo = 'Photo is required';
    }

    // Promo code validation
    const trimmedPromo = promoCode.trim();
    if (trimmedPromo && !promoValidation.isValid && !promoValidation.isLoading) {
      newErrors.promoCode = 'Invalid promo code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const orderId = generateIdNumber();
    const selectedState = US_STATES.find((s) => s.code === formData.state);
    const trimmedPromo = promoCode.trim();
    const normalizedPromoCode = trimmedPromo ? trimmedPromo.toUpperCase() : null;

    addItem({
      id: orderId,
      details: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        dob: formData.dob,
        address: formData.address,
        city: formData.city,
        state_name: selectedState?.name || formData.state,
        zip: formData.zip,
        gender: formData.gender,
        height: formData.height,
        eye_color: formData.eyeColor,
        id_number: orderId,
      },
      address: {
        first_name: formData.shippingFirstName,
        last_name: formData.shippingLastName,
        address: formData.shippingAddress,
        city: formData.shippingCity,
        state: formData.shippingState,
        zip: formData.shippingZip,
      },
      photoDataUrl: croppedPhotoUrl,
      signatureDataUrl: signatureDataUrl,
      promoCode: normalizedPromoCode,
      addedAt: Date.now(),
    });

    toast.success('Added to cart!');
    navigate({ to: '/cart' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    // Additional check for promo code before submission
    const trimmedPromo = promoCode.trim();
    if (trimmedPromo && !promoValidation.isValid) {
      toast.error('Please enter a valid promo code or leave it empty');
      return;
    }

    try {
      const orderId = generateIdNumber();
      
      // Convert cropped photo URL to bytes
      const response = await fetch(croppedPhotoUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const photoBytes = new Uint8Array(arrayBuffer);
      const photoBlob = ExternalBlob.fromBytes(photoBytes);
      
      // Convert signature data URL to bytes if present
      let signatureBlob: ExternalBlob | null = null;
      if (signatureDataUrl) {
        const base64Data = signatureDataUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        signatureBlob = ExternalBlob.fromBytes(bytes);
      }

      const selectedState = US_STATES.find((s) => s.code === formData.state);

      // Normalize promo code before submission
      const normalizedPromoCode = trimmedPromo ? trimmedPromo.toUpperCase() : null;

      await createOrder.mutateAsync({
        id: orderId,
        details: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: formData.dob,
          address: formData.address,
          city: formData.city,
          state_name: selectedState?.name || formData.state,
          zip: formData.zip,
          gender: formData.gender,
          height: formData.height,
          eye_color: formData.eyeColor,
          id_number: orderId,
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
        promoCode: normalizedPromoCode,
        signature: signatureBlob,
      });

      toast.success('Order created successfully!');
      navigate({ to: '/dashboard', search: { orderCreated: 'true' } });
    } catch (error: any) {
      console.error('Order creation error:', error);
      
      const errorMessage = error.message || 'Failed to create order';
      
      if (errorMessage.includes('duplicate') && retryCount < MAX_RETRIES) {
        setRetryCount(retryCount + 1);
        toast.error('ID collision detected. Retrying...');
        setTimeout(() => handleSubmit(e), 500);
      } else {
        toast.error(errorMessage);
        setRetryCount(0);
      }
    }
  };

  // Calculate pricing
  const basePrice = ORDER_BASE_PRICE;
  const discount = isVIP ? calculateVIPDiscount(basePrice) : 0;
  const total = isVIP ? calculateVIPTotal(basePrice) : basePrice;

  // Determine promo code input state
  const showPromoValidation = debouncedPromoCode.trim().length > 0;
  const promoInputClassName = showPromoValidation
    ? promoValidation.isValid
      ? 'border-green-500 focus:ring-green-500'
      : promoValidation.isLoading
      ? 'border-yellow-500 focus:ring-yellow-500'
      : 'border-red-500 focus:ring-red-500'
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Create New Order
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to order your custom ID card
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID Card Details */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                ID Card Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className={errors.dob ? 'border-destructive' : ''}
                  />
                  {errors.dob && (
                    <p className="text-sm text-destructive">{errors.dob}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                  >
                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="X">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-destructive">{errors.gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height *</Label>
                  <Select
                    value={formData.height}
                    onValueChange={(value) => handleInputChange('height', value)}
                  >
                    <SelectTrigger className={errors.height ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select height" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto touch-pan-y">
                      {HEIGHT_OPTIONS.map((height) => (
                        <SelectItem key={height} value={height}>
                          {height}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.height && (
                    <p className="text-sm text-destructive">{errors.height}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eyeColor">Eye Color *</Label>
                  <Select
                    value={formData.eyeColor}
                    onValueChange={(value) => handleInputChange('eyeColor', value)}
                  >
                    <SelectTrigger className={errors.eyeColor ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select eye color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRO">Brown</SelectItem>
                      <SelectItem value="BLU">Blue</SelectItem>
                      <SelectItem value="GRN">Green</SelectItem>
                      <SelectItem value="HAZ">Hazel</SelectItem>
                      <SelectItem value="GRY">Gray</SelectItem>
                      <SelectItem value="BLK">Black</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.eyeColor && (
                    <p className="text-sm text-destructive">{errors.eyeColor}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main St"
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <USStateSelect
                    value={formData.state}
                    onValueChange={(value) => handleInputChange('state', value)}
                    valueType="code"
                    aria-invalid={!!errors.state}
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    placeholder="12345"
                    className={errors.zip ? 'border-destructive' : ''}
                  />
                  {errors.zip && (
                    <p className="text-sm text-destructive">{errors.zip}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Photo *</Label>
                <PhotoUploader
                  onPhotoSelected={handlePhotoSelected}
                  currentPhotoUrl={croppedPhotoUrl}
                  onClear={handleClearPhoto}
                />
                {errors.photo && (
                  <p className="text-sm text-destructive">{errors.photo}</p>
                )}
              </div>

              <div className="space-y-2">
                <SignaturePad onSignatureChange={setSignatureDataUrl} />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingFirstName">First Name *</Label>
                  <Input
                    id="shippingFirstName"
                    value={formData.shippingFirstName}
                    onChange={(e) => handleInputChange('shippingFirstName', e.target.value)}
                    className={errors.shippingFirstName ? 'border-destructive' : ''}
                  />
                  {errors.shippingFirstName && (
                    <p className="text-sm text-destructive">{errors.shippingFirstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingLastName">Last Name *</Label>
                  <Input
                    id="shippingLastName"
                    value={formData.shippingLastName}
                    onChange={(e) => handleInputChange('shippingLastName', e.target.value)}
                    className={errors.shippingLastName ? 'border-destructive' : ''}
                  />
                  {errors.shippingLastName && (
                    <p className="text-sm text-destructive">{errors.shippingLastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingAddress">Address *</Label>
                <Input
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  placeholder="123 Main St"
                  className={errors.shippingAddress ? 'border-destructive' : ''}
                />
                {errors.shippingAddress && (
                  <p className="text-sm text-destructive">{errors.shippingAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingCity">City *</Label>
                  <Input
                    id="shippingCity"
                    value={formData.shippingCity}
                    onChange={(e) => handleInputChange('shippingCity', e.target.value)}
                    className={errors.shippingCity ? 'border-destructive' : ''}
                  />
                  {errors.shippingCity && (
                    <p className="text-sm text-destructive">{errors.shippingCity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingState">State *</Label>
                  <USStateSelect
                    value={formData.shippingState}
                    onValueChange={(value) => handleInputChange('shippingState', value)}
                    valueType="code"
                    aria-invalid={!!errors.shippingState}
                  />
                  {errors.shippingState && (
                    <p className="text-sm text-destructive">{errors.shippingState}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingZip">ZIP Code *</Label>
                  <Input
                    id="shippingZip"
                    value={formData.shippingZip}
                    onChange={(e) => handleInputChange('shippingZip', e.target.value)}
                    placeholder="12345"
                    className={errors.shippingZip ? 'border-destructive' : ''}
                  />
                  {errors.shippingZip && (
                    <p className="text-sm text-destructive">{errors.shippingZip}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Promo Code & Pricing */}
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Promo Code & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promoCode">Promo Code (Optional)</Label>
                <div className="relative">
                  <Input
                    id="promoCode"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className={promoInputClassName}
                  />
                  {showPromoValidation && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {promoValidation.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                      ) : promoValidation.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.promoCode && (
                  <p className="text-sm text-destructive">{errors.promoCode}</p>
                )}
                {showPromoValidation && promoValidation.isValid && (
                  <p className="text-sm text-green-600">
                    Valid promo code! {promoValidation.discountPercentage}% discount will be applied.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{ORDER_PRICE_LABEL}</span>
                  <span className="font-medium">{formatPrice(basePrice)}</span>
                </div>
                {isVIP && (
                  <div className="flex justify-between text-sm">
                    <span className="text-accent">{VIP_DISCOUNT_LABEL}</span>
                    <span className="font-medium text-accent">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>{TOTAL_LABEL}</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddToCart}
              className="flex-1"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button
              type="submit"
              disabled={createOrder.isPending}
              className="flex-1"
              size="lg"
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Order...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Order Now
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {showCropModal && selectedFileUrl && (
        <PhotoCropModal
          open={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageUrl={selectedFileUrl}
          onCropComplete={handlePhotoCropped}
        />
      )}
    </div>
  );
}
