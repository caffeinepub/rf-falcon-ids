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
import { US_STATES } from '../constants/usStates';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Loader2, Info, CheckCircle2 } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName || !dob || !gender || !height || !eyeColor || !address || !city || !state || !zip) {
      toast.error('Please fill in all ID details');
      return;
    }

    // Validate DOB format
    const formattedDOB = dateInputToDOB(dob);
    if (!isValidDOB(formattedDOB)) {
      toast.error('Please enter a valid date of birth');
      return;
    }

    if (!shipFirstName || !shipLastName || !shipAddress || !shipCity || !shipState || !shipZip) {
      toast.error('Please fill in all shipping information');
      return;
    }

    if (!croppedPhotoUrl) {
      toast.error('Please upload and crop a photo');
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
          dob: formattedDOB,
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
      toast.error('Failed to create order');
    }
  };

  // Preview DOB in MM/DD/YYYY format
  const previewDOB = dob ? dateInputToDOB(dob) : '';

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wider">Create Your ID</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Follow the steps below to place your order</p>
      </div>

      <div className="bg-card/60 border border-chrome-300/10 rounded p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-chrome-400 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-chrome-300">{COPY.ORDER_FORM_DISCLAIMER}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-6">
          {/* Step 1: ID Details */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide flex items-center gap-2 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-chrome-300/20 text-chrome-300 text-sm font-bold">1</span>
                ID Information
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
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
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm">Date of Birth (MM/DD/YYYY) *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Will appear as: {previewDOB || 'MM/DD/YYYY'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm">Gender *</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger className="bg-background/50 border-chrome-300/30">
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
                  <Label htmlFor="height" className="text-sm">Height *</Label>
                  <Input
                    id="height"
                    placeholder="5'10&quot;"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eyeColor" className="text-sm">Eye Color *</Label>
                <Select value={eyeColor} onValueChange={setEyeColor} required>
                  <SelectTrigger className="bg-background/50 border-chrome-300/30">
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

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address *</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip" className="text-sm">ZIP Code *</Label>
                  <Input
                    id="zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm">State *</Label>
                <Select value={state} onValueChange={setState} required>
                  <SelectTrigger className="bg-background/50 border-chrome-300/30">
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
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Photo Upload */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide flex items-center gap-2 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-chrome-300/20 text-chrome-300 text-sm font-bold">2</span>
                Photo Upload
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Upload a clear photo for your ID card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                currentPhotoUrl={croppedPhotoUrl}
                onClear={handleClearPhoto}
              />
            </CardContent>
          </Card>

          {/* Step 3: Shipping Info */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide flex items-center gap-2 text-lg sm:text-xl">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-chrome-300/20 text-chrome-300 text-sm font-bold">3</span>
                Shipping Information
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Where should we send your ID card?
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
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipLastName" className="text-sm">Last Name *</Label>
                  <Input
                    id="shipLastName"
                    value={shipLastName}
                    onChange={(e) => setShipLastName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipAddress" className="text-sm">Address *</Label>
                <Input
                  id="shipAddress"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipCity" className="text-sm">City *</Label>
                  <Input
                    id="shipCity"
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipZip" className="text-sm">ZIP Code *</Label>
                  <Input
                    id="shipZip"
                    value={shipZip}
                    onChange={(e) => setShipZip(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipState" className="text-sm">State *</Label>
                <Select value={shipState} onValueChange={setShipState} required>
                  <SelectTrigger className="bg-background/50 border-chrome-300/30">
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
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={createOrder.isPending}
            className="w-full bg-chrome-300 hover:bg-chrome-200 text-black font-semibold text-base py-6"
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </div>

        {/* Preview - Sticky on large screens */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide text-lg sm:text-xl">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
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
              </div>
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
      </form>

      <PhotoCropModal
        open={showCropModal}
        onClose={() => setShowCropModal(false)}
        imageUrl={rawPhotoUrl}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
