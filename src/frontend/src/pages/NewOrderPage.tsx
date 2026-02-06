import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateOrder } from '../hooks/orders/useCreateOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, AlertCircle } from 'lucide-react';
import { COPY } from '../content/copy';

export default function NewOrderPage() {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

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
  const [idNumber, setIdNumber] = useState('');

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
    if (!firstName || !lastName || !dob || !gender || !height || !eyeColor || !address || !city || !state || !zip || !idNumber) {
      toast.error('Please fill in all ID details');
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
          dob,
          gender,
          height,
          eye_color: eyeColor,
          address,
          city,
          state_name: state,
          zip,
          id_number: idNumber,
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
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-wider">New ID Order</h1>
        <p className="text-muted-foreground mt-1">{COPY.ORDER_FORM_SUBTITLE}</p>
      </div>

      <div className="bg-card/80 border border-chrome-300/20 rounded p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-chrome-400 shrink-0 mt-0.5" />
        <p className="text-sm text-chrome-300">{COPY.ORDER_FORM_DISCLAIMER}</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* ID Details */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide">ID Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
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
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
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
                  <Label htmlFor="height">Height</Label>
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
                <Label htmlFor="eyeColor">Eye Color</Label>
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
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
                <Label htmlFor="state">State</Label>
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

              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder="e.g., 123456789"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide">Shipping Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Physical novelty ID will be shipped to this address
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipFirstName">First Name</Label>
                  <Input
                    id="shipFirstName"
                    value={shipFirstName}
                    onChange={(e) => setShipFirstName(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipLastName">Last Name</Label>
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
                <Label htmlFor="shipAddress">Address</Label>
                <Input
                  id="shipAddress"
                  value={shipAddress}
                  onChange={(e) => setShipAddress(e.target.value)}
                  className="bg-background/50 border-chrome-300/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipCity">City</Label>
                  <Input
                    id="shipCity"
                    value={shipCity}
                    onChange={(e) => setShipCity(e.target.value)}
                    className="bg-background/50 border-chrome-300/30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipZip">ZIP Code</Label>
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
                <Label htmlFor="shipState">State</Label>
                <Select value={shipState} onValueChange={setShipState} required>
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

          {/* Photo Upload */}
          <Card className="bg-card/80 border-chrome-300/20">
            <CardHeader>
              <CardTitle className="tracking-wide">ID Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                onPhotoSelected={handlePhotoSelected}
                currentPhotoUrl={croppedPhotoUrl}
                onClear={handleClearPhoto}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="bg-card/80 border-chrome-300/20 shadow-glow">
            <CardHeader>
              <CardTitle className="tracking-wide">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <IdCardPreview
                  firstName={firstName}
                  lastName={lastName}
                  dob={dob}
                  gender={gender}
                  height={height}
                  eyeColor={eyeColor}
                  idNumber={idNumber}
                  state={state}
                  photoUrl={croppedPhotoUrl}
                />
              </div>
              <IdCardActions />
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-chrome-300 hover:bg-chrome-200 text-black font-semibold"
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              'Create Order'
            )}
          </Button>
        </div>
      </form>

      <PhotoCropModal
        open={showCropModal}
        imageUrl={rawPhotoUrl}
        onCropComplete={handleCropComplete}
        onClose={() => setShowCropModal(false)}
      />
    </div>
  );
}
