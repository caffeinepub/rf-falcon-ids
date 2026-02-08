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
import { Loader2, AlertCircle } from 'lucide-react';
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

      <div className="grid lg:grid-cols-[1fr,420px] gap-6 sm:gap-8">
        {/* Form Column */}
        <div className="space-y-6">
          {submissionError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium">Submission Error</p>
                <p className="text-sm text-destructive/80 mt-1">{submissionError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ID Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>ID Details</CardTitle>
                <CardDescription>Enter the information to appear on the ID card</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      aria-invalid={showValidation && !!validationErrors.firstName}
                      aria-describedby={validationErrors.firstName ? 'firstName-error' : undefined}
                    />
                    {showValidation && validationErrors.firstName && (
                      <InlineFieldMessage id="firstName-error" type="error">
                        {validationErrors.firstName}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      aria-invalid={showValidation && !!validationErrors.lastName}
                      aria-describedby={validationErrors.lastName ? 'lastName-error' : undefined}
                    />
                    {showValidation && validationErrors.lastName && (
                      <InlineFieldMessage id="lastName-error" type="error">
                        {validationErrors.lastName}
                      </InlineFieldMessage>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      aria-invalid={showValidation && !!validationErrors.dob}
                      aria-describedby={validationErrors.dob ? 'dob-error' : undefined}
                    />
                    {showValidation && validationErrors.dob && (
                      <InlineFieldMessage id="dob-error" type="error">
                        {validationErrors.dob}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger
                        id="gender"
                        aria-invalid={showValidation && !!validationErrors.gender}
                        aria-describedby={validationErrors.gender ? 'gender-error' : undefined}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="X">Non-binary</SelectItem>
                      </SelectContent>
                    </Select>
                    {showValidation && validationErrors.gender && (
                      <InlineFieldMessage id="gender-error" type="error">
                        {validationErrors.gender}
                      </InlineFieldMessage>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height *</Label>
                    <Input
                      id="height"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="5'10&quot;"
                      aria-invalid={showValidation && !!validationErrors.height}
                      aria-describedby={validationErrors.height ? 'height-error' : undefined}
                    />
                    {showValidation && validationErrors.height && (
                      <InlineFieldMessage id="height-error" type="error">
                        {validationErrors.height}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eyeColor">Eye Color *</Label>
                    <Select value={eyeColor} onValueChange={setEyeColor}>
                      <SelectTrigger
                        id="eyeColor"
                        aria-invalid={showValidation && !!validationErrors.eyeColor}
                        aria-describedby={validationErrors.eyeColor ? 'eyeColor-error' : undefined}
                      >
                        <SelectValue placeholder="Select eye color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BLK">Black</SelectItem>
                        <SelectItem value="BLU">Blue</SelectItem>
                        <SelectItem value="BRO">Brown</SelectItem>
                        <SelectItem value="GRY">Gray</SelectItem>
                        <SelectItem value="GRN">Green</SelectItem>
                        <SelectItem value="HAZ">Hazel</SelectItem>
                      </SelectContent>
                    </Select>
                    {showValidation && validationErrors.eyeColor && (
                      <InlineFieldMessage id="eyeColor-error" type="error">
                        {validationErrors.eyeColor}
                      </InlineFieldMessage>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    aria-invalid={showValidation && !!validationErrors.address}
                    aria-describedby={validationErrors.address ? 'address-error' : undefined}
                  />
                  {showValidation && validationErrors.address && (
                    <InlineFieldMessage id="address-error" type="error">
                      {validationErrors.address}
                    </InlineFieldMessage>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Springfield"
                      aria-invalid={showValidation && !!validationErrors.city}
                      aria-describedby={validationErrors.city ? 'city-error' : undefined}
                    />
                    {showValidation && validationErrors.city && (
                      <InlineFieldMessage id="city-error" type="error">
                        {validationErrors.city}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger
                        id="state"
                        aria-invalid={showValidation && !!validationErrors.state}
                        aria-describedby={validationErrors.state ? 'state-error' : undefined}
                      >
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
                      <InlineFieldMessage id="state-error" type="error">
                        {validationErrors.state}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="12345"
                      aria-invalid={showValidation && !!validationErrors.zip}
                      aria-describedby={validationErrors.zip ? 'zip-error' : undefined}
                    />
                    {showValidation && validationErrors.zip && (
                      <InlineFieldMessage id="zip-error" type="error">
                        {validationErrors.zip}
                      </InlineFieldMessage>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
                <CardDescription>Upload a photo for your ID card</CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUploader
                  onPhotoSelected={handlePhotoSelected}
                  onClear={handleClearPhoto}
                  currentPhotoUrl={croppedPhotoUrl}
                />
                {showValidation && validationErrors.photo && (
                  <InlineFieldMessage id="photo-error" type="error">
                    {validationErrors.photo}
                  </InlineFieldMessage>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>Where should we send your ID card?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipFirstName">First Name *</Label>
                    <Input
                      id="shipFirstName"
                      value={shipFirstName}
                      onChange={(e) => setShipFirstName(e.target.value)}
                      placeholder="John"
                      aria-invalid={showValidation && !!validationErrors.shipFirstName}
                      aria-describedby={validationErrors.shipFirstName ? 'shipFirstName-error' : undefined}
                    />
                    {showValidation && validationErrors.shipFirstName && (
                      <InlineFieldMessage id="shipFirstName-error" type="error">
                        {validationErrors.shipFirstName}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipLastName">Last Name *</Label>
                    <Input
                      id="shipLastName"
                      value={shipLastName}
                      onChange={(e) => setShipLastName(e.target.value)}
                      placeholder="Doe"
                      aria-invalid={showValidation && !!validationErrors.shipLastName}
                      aria-describedby={validationErrors.shipLastName ? 'shipLastName-error' : undefined}
                    />
                    {showValidation && validationErrors.shipLastName && (
                      <InlineFieldMessage id="shipLastName-error" type="error">
                        {validationErrors.shipLastName}
                      </InlineFieldMessage>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipAddress">Address *</Label>
                  <Input
                    id="shipAddress"
                    value={shipAddress}
                    onChange={(e) => setShipAddress(e.target.value)}
                    placeholder="123 Main St"
                    aria-invalid={showValidation && !!validationErrors.shipAddress}
                    aria-describedby={validationErrors.shipAddress ? 'shipAddress-error' : undefined}
                  />
                  {showValidation && validationErrors.shipAddress && (
                    <InlineFieldMessage id="shipAddress-error" type="error">
                      {validationErrors.shipAddress}
                    </InlineFieldMessage>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipCity">City *</Label>
                    <Input
                      id="shipCity"
                      value={shipCity}
                      onChange={(e) => setShipCity(e.target.value)}
                      placeholder="Springfield"
                      aria-invalid={showValidation && !!validationErrors.shipCity}
                      aria-describedby={validationErrors.shipCity ? 'shipCity-error' : undefined}
                    />
                    {showValidation && validationErrors.shipCity && (
                      <InlineFieldMessage id="shipCity-error" type="error">
                        {validationErrors.shipCity}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipState">State *</Label>
                    <Select value={shipState} onValueChange={setShipState}>
                      <SelectTrigger
                        id="shipState"
                        aria-invalid={showValidation && !!validationErrors.shipState}
                        aria-describedby={validationErrors.shipState ? 'shipState-error' : undefined}
                      >
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showValidation && validationErrors.shipState && (
                      <InlineFieldMessage id="shipState-error" type="error">
                        {validationErrors.shipState}
                      </InlineFieldMessage>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipZip">ZIP Code *</Label>
                    <Input
                      id="shipZip"
                      value={shipZip}
                      onChange={(e) => setShipZip(e.target.value)}
                      placeholder="12345"
                      aria-invalid={showValidation && !!validationErrors.shipZip}
                      aria-describedby={validationErrors.shipZip ? 'shipZip-error' : undefined}
                    />
                    {showValidation && validationErrors.shipZip && (
                      <InlineFieldMessage id="shipZip-error" type="error">
                        {validationErrors.shipZip}
                      </InlineFieldMessage>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Creating Order...
                </>
              ) : (
                'Create Order'
              )}
            </Button>
          </form>
        </div>

        {/* Preview Column - Sticky on desktop */}
        <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Live preview of your ID card</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo Crop Modal */}
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
