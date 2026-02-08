import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from '../hooks/orders/useCreateOrder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IdCardPreview from '../components/IdCardPreview';
import IdCardActions from '../components/IdCardActions';
import PhotoUploader from '../components/PhotoUploader';
import PhotoCropModal from '../components/PhotoCropModal';
import InlineFieldMessage from '../components/forms/InlineFieldMessage';
import PageHeader from '../components/dashboard/PageHeader';
import { US_STATES } from '../constants/usStates';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Loader2, Info, AlertCircle } from 'lucide-react';
import { COPY } from '../content/copy';
import { generateIdNumber } from '../utils/generateIdNumber';
import { isValidDOB, dateInputToDOB, dobToDateInput } from '../utils/dob';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  // Generate a stable ID number for this session (preview + submission)
  const generatedIdNumber = useRef(generateIdNumber());

  // ID Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Shipping Info
  const [shipFirstName, setShipFirstName] = useState('');
  const [shipLastName, setShipLastName] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip, setShipZip] = useState('');

  // Photo
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawPhotoUrl, setRawPhotoUrl] = useState<string>('');
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState<string>('');
  const [showCropModal, setShowCropModal] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>('');

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setRawPhotoUrl(url);
      setShowCropModal(true);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleCropComplete = (croppedUrl: string) => {
    setCroppedPhotoUrl(croppedUrl);
  };

  const handleClearPhoto = () => {
    setSelectedFile(null);
    setCroppedPhotoUrl('');
    setRawPhotoUrl('');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // ID Details validation
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!dob) {
      errors.dob = 'Date of birth is required';
    } else {
      const formattedDOB = dateInputToDOB(dob);
      if (!isValidDOB(formattedDOB)) {
        errors.dob = 'Please enter a valid date of birth';
      }
    }
    if (!gender) errors.gender = 'Gender is required';
    if (!height.trim()) errors.height = 'Height is required';
    if (!eyeColor) errors.eyeColor = 'Eye color is required';
    if (!address.trim()) errors.address = 'Address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state) errors.state = 'State is required';
    if (!zip.trim()) errors.zip = 'ZIP code is required';

    // Shipping validation
    if (!shipFirstName.trim()) errors.shipFirstName = 'Shipping first name is required';
    if (!shipLastName.trim()) errors.shipLastName = 'Shipping last name is required';
    if (!shipAddress.trim()) errors.shipAddress = 'Shipping address is required';
    if (!shipCity.trim()) errors.shipCity = 'Shipping city is required';
    if (!shipState) errors.shipState = 'Shipping state is required';
    if (!shipZip.trim()) errors.shipZip = 'Shipping ZIP code is required';

    // Photo validation
    if (!croppedPhotoUrl) errors.photo = 'Photo is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    setSubmissionError('');

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Convert cropped photo to blob
      const response = await fetch(croppedPhotoUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const externalBlob = ExternalBlob.fromBytes(uint8Array);

      await createOrder.mutateAsync({
        id: `ORD-${Date.now()}`,
        details: {
          first_name: firstName,
          last_name: lastName,
          dob: dateInputToDOB(dob),
          gender,
          height,
          eye_color: eyeColor,
          address,
          city,
          state_name: state,
          zip,
          id_number: generatedIdNumber.current,
        },
        address: {
          first_name: shipFirstName,
          last_name: shipLastName,
          address: shipAddress,
          city: shipCity,
          state: shipState,
          zip: shipZip,
        },
        photo: externalBlob,
      });

      toast.success('Order created successfully');
      toast.info('Please contact the owner for payment methods');
      navigate({ to: '/dashboard', search: { orderCreated: 'true' } });
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order. Please try again.';
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Preview DOB in MM/DD/YYYY format
  const previewDOB = dob ? dateInputToDOB(dob) : '';

  const isSubmitting = createOrder.isPending;

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <PageHeader
        title="Create Your ID"
        description="Follow the steps below to place your order"
      />

      <div className="bg-card/60 border border-chrome-300/10 rounded-lg p-4 flex items-start gap-3 min-w-0">
        <Info className="w-5 h-5 text-chrome-400 shrink-0 mt-0.5" />
        <p className="text-sm text-chrome-300 break-words">{COPY.ORDER_FORM_DISCLAIMER}</p>
      </div>

      {submissionError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 min-w-0">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-400 mb-1">Submission Error</p>
            <p className="text-sm text-red-300 break-words">{submissionError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6 lg:gap-8 min-w-0">
        <div className="space-y-6 min-w-0">
          {/* Step 1: ID Details */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide flex items-center gap-2 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-chrome-300/20 text-chrome-300 text-sm font-bold shrink-0">1</span>
                <span className="break-words">ID Information</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Enter the details as you want them to appear on your ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.firstName}
                    aria-describedby={validationErrors.firstName ? 'firstName-error' : undefined}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.firstName && (
                    <InlineFieldMessage id="firstName-error" type="error">
                      {validationErrors.firstName}
                    </InlineFieldMessage>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.lastName}
                    aria-describedby={validationErrors.lastName ? 'lastName-error' : undefined}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.lastName && (
                    <InlineFieldMessage id="lastName-error" type="error">
                      {validationErrors.lastName}
                    </InlineFieldMessage>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm">Date of Birth (MM/DD/YYYY) *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-background/50 border-chrome-300/30 h-11"
                  aria-invalid={showValidation && !!validationErrors.dob}
                  aria-describedby={validationErrors.dob ? 'dob-error' : 'dob-preview'}
                  disabled={isSubmitting}
                  required
                />
                {showValidation && validationErrors.dob ? (
                  <InlineFieldMessage id="dob-error" type="error">
                    {validationErrors.dob}
                  </InlineFieldMessage>
                ) : (
                  <p id="dob-preview" className="text-xs text-muted-foreground">
                    Will appear as: {previewDOB || 'MM/DD/YYYY'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm">Gender *</Label>
                  <Select value={gender} onValueChange={setGender} disabled={isSubmitting} required>
                    <SelectTrigger className="bg-background/50 border-chrome-300/30 h-11" aria-invalid={showValidation && !!validationErrors.gender}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="X">Non-binary</SelectItem>
                    </SelectContent>
                  </Select>
                  {showValidation && validationErrors.gender && (
                    <InlineFieldMessage type="error">{validationErrors.gender}</InlineFieldMessage>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm">Height *</Label>
                  <Input
                    id="height"
                    placeholder="5'10&quot;"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.height}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.height && (
                    <InlineFieldMessage type="error">{validationErrors.height}</InlineFieldMessage>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eyeColor" className="text-sm">Eye Color *</Label>
                <Select value={eyeColor} onValueChange={setEyeColor} disabled={isSubmitting} required>
                  <SelectTrigger className="bg-background/50 border-chrome-300/30 h-11" aria-invalid={showValidation && !!validationErrors.eyeColor}>
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
                {showValidation && validationErrors.eyeColor && (
                  <InlineFieldMessage type="error">{validationErrors.eyeColor}</InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background/50 border-chrome-300/30 h-11"
                  placeholder="123 Main St"
                  aria-invalid={showValidation && !!validationErrors.address}
                  disabled={isSubmitting}
                  required
                />
                {showValidation && validationErrors.address && (
                  <InlineFieldMessage type="error">{validationErrors.address}</InlineFieldMessage>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.city}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.city && (
                    <InlineFieldMessage type="error">{validationErrors.city}</InlineFieldMessage>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip" className="text-sm">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.zip}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.zip && (
                    <InlineFieldMessage type="error">{validationErrors.zip}</InlineFieldMessage>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm">State *</Label>
                <Select value={state} onValueChange={setState} disabled={isSubmitting} required>
                  <SelectTrigger className="bg-background/50 border-chrome-300/30 h-11" aria-invalid={showValidation && !!validationErrors.state}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && validationErrors.state && (
                  <InlineFieldMessage type="error">{validationErrors.state}</InlineFieldMessage>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Photo Upload */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide flex items-center gap-2 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-chrome-300/20 text-chrome-300 text-sm font-bold shrink-0">2</span>
                <span className="break-words">Upload Photo</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Upload a clear photo of yourself for the ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                onClear={handleClearPhoto}
                currentPhotoUrl={croppedPhotoUrl}
              />
              {showValidation && validationErrors.photo && (
                <InlineFieldMessage type="error">{validationErrors.photo}</InlineFieldMessage>
              )}
            </CardContent>
          </Card>

          {/* Step 3: Shipping Information */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide flex items-center gap-2 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-chrome-300/20 text-chrome-300 text-sm font-bold shrink-0">3</span>
                <span className="break-words">Shipping Information</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Where should we send your ID?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipFirstName" className="text-sm">First Name *</Label>
                  <Input
                    id="shipFirstName"
                    value={shipFirstName}
                    onChange={(e) => setShipFirstName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.shipFirstName}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.shipFirstName && (
                    <InlineFieldMessage type="error">{validationErrors.shipFirstName}</InlineFieldMessage>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipLastName" className="text-sm">Last Name *</Label>
                  <Input
                    id="shipLastName"
                    value={shipLastName}
                    onChange={(e) => setShipLastName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.shipLastName}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.shipLastName && (
                    <InlineFieldMessage type="error">{validationErrors.shipLastName}</InlineFieldMessage>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipAddress" className="text-sm">Address *</Label>
                <Input
                  id="shipAddress"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(e.target.value)}
                  className="bg-background/50 border-chrome-300/30 h-11"
                  placeholder="123 Main St"
                  aria-invalid={showValidation && !!validationErrors.shipAddress}
                  disabled={isSubmitting}
                  required
                />
                {showValidation && validationErrors.shipAddress && (
                  <InlineFieldMessage type="error">{validationErrors.shipAddress}</InlineFieldMessage>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipCity" className="text-sm">City *</Label>
                  <Input
                    id="shipCity"
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.shipCity}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.shipCity && (
                    <InlineFieldMessage type="error">{validationErrors.shipCity}</InlineFieldMessage>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipZip" className="text-sm">ZIP Code *</Label>
                  <Input
                    id="shipZip"
                    value={shipZip}
                    onChange={(e) => setShipZip(e.target.value)}
                    className="bg-background/50 border-chrome-300/30 h-11"
                    aria-invalid={showValidation && !!validationErrors.shipZip}
                    disabled={isSubmitting}
                    required
                  />
                  {showValidation && validationErrors.shipZip && (
                    <InlineFieldMessage type="error">{validationErrors.shipZip}</InlineFieldMessage>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipState" className="text-sm">State *</Label>
                <Select value={shipState} onValueChange={setShipState} disabled={isSubmitting} required>
                  <SelectTrigger className="bg-background/50 border-chrome-300/30 h-11" aria-invalid={showValidation && !!validationErrors.shipState}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && validationErrors.shipState && (
                  <InlineFieldMessage type="error">{validationErrors.shipState}</InlineFieldMessage>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-chrome-300 hover:bg-chrome-200 text-black font-semibold h-12 text-base shadow-chrome-glow"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              'Submit Order'
            )}
          </Button>
        </div>

        {/* Preview Column - Sticky on desktop */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-6 min-w-0 max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">Preview</CardTitle>
              <CardDescription className="text-sm">
                Live preview of your ID card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <IdCardPreview
                firstName={firstName}
                lastName={lastName}
                dob={previewDOB}
                gender={gender}
                height={height}
                eyeColor={eyeColor}
                idNumber={generatedIdNumber.current}
                state={state}
                photoUrl={croppedPhotoUrl}
              />
              {croppedPhotoUrl && firstName && lastName && (
                <IdCardActions
                  firstName={firstName}
                  lastName={lastName}
                  dob={previewDOB}
                  gender={gender}
                  height={height}
                  eyeColor={eyeColor}
                  idNumber={generatedIdNumber.current}
                  state={state}
                  photoUrl={croppedPhotoUrl}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </form>

      {showCropModal && rawPhotoUrl && (
        <PhotoCropModal
          open={showCropModal}
          imageUrl={rawPhotoUrl}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropModal(false)}
        />
      )}
    </div>
  );
}
