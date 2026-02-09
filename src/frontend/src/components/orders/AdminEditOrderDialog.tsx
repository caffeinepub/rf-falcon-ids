import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminUpdateOrderDetails } from '../../hooks/orders/useAdminUpdateOrderDetails';
import USStateSelect from '../forms/USStateSelect';
import type { Order } from '../../backend';
import {
  validateName,
  validateAddress,
  validateCity,
  validateZip,
  validateState,
  validateGender,
  validateEyeColor,
  validateHeight,
  validateIdNumber,
} from '../../utils/validation';
import { isValidDOB, dobToDateInput, dateInputToDOB } from '../../utils/dob';
import InlineFieldMessage from '../forms/InlineFieldMessage';
import { US_STATES } from '../../constants/usStates';
import { HEIGHT_OPTIONS } from '../../constants/heights';

interface AdminEditOrderDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  dob?: string;
  gender?: string;
  height?: string;
  eyeColor?: string;
  idNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
}

export default function AdminEditOrderDialog({ order, open, onOpenChange }: AdminEditOrderDialogProps) {
  const { mutate: updateOrder, isPending } = useAdminUpdateOrderDetails();

  // ID Details form state
  const [firstName, setFirstName] = useState(order.details.first_name);
  const [lastName, setLastName] = useState(order.details.last_name);
  const [dob, setDob] = useState(dobToDateInput(order.details.dob));
  const [gender, setGender] = useState(order.details.gender);
  const [height, setHeight] = useState(order.details.height);
  const [eyeColor, setEyeColor] = useState(order.details.eye_color);
  const [idNumber, setIdNumber] = useState(order.details.id_number);
  const [idAddress, setIdAddress] = useState(order.details.address);
  const [idCity, setIdCity] = useState(order.details.city);
  const [idState, setIdState] = useState(order.details.state_name);
  const [idZip, setIdZip] = useState(order.details.zip);

  // Shipping Address form state
  const [shippingFirstName, setShippingFirstName] = useState(order.address.first_name);
  const [shippingLastName, setShippingLastName] = useState(order.address.last_name);
  const [shippingAddress, setShippingAddress] = useState(order.address.address);
  const [shippingCity, setShippingCity] = useState(order.address.city);
  const [shippingState, setShippingState] = useState(order.address.state);
  const [shippingZip, setShippingZip] = useState(order.address.zip);

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when order changes or dialog opens
  useEffect(() => {
    if (open) {
      setFirstName(order.details.first_name);
      setLastName(order.details.last_name);
      setDob(dobToDateInput(order.details.dob));
      setGender(order.details.gender);
      setHeight(order.details.height);
      setEyeColor(order.details.eye_color);
      setIdNumber(order.details.id_number);
      setIdAddress(order.details.address);
      setIdCity(order.details.city);
      setIdState(order.details.state_name);
      setIdZip(order.details.zip);
      setShippingFirstName(order.address.first_name);
      setShippingLastName(order.address.last_name);
      setShippingAddress(order.address.address);
      setShippingCity(order.address.city);
      setShippingState(order.address.state);
      setShippingZip(order.address.zip);
      setErrors({});
    }
  }, [open, order]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate ID details
    const firstNameValidation = validateName(firstName, 'First name');
    if (!firstNameValidation.valid) newErrors.firstName = firstNameValidation.error;

    const lastNameValidation = validateName(lastName, 'Last name');
    if (!lastNameValidation.valid) newErrors.lastName = lastNameValidation.error;

    const dobString = dateInputToDOB(dob);
    if (!isValidDOB(dobString)) {
      newErrors.dob = 'Date of birth must be in MM/DD/YYYY format';
    }

    const genderValidation = validateGender(gender);
    if (!genderValidation.valid) newErrors.gender = genderValidation.error;

    const heightValidation = validateHeight(height);
    if (!heightValidation.valid) newErrors.height = heightValidation.error;

    const eyeColorValidation = validateEyeColor(eyeColor);
    if (!eyeColorValidation.valid) newErrors.eyeColor = eyeColorValidation.error;

    const idNumberValidation = validateIdNumber(idNumber);
    if (!idNumberValidation.valid) newErrors.idNumber = idNumberValidation.error;

    const idAddressValidation = validateAddress(idAddress);
    if (!idAddressValidation.valid) newErrors.address = idAddressValidation.error;

    const idCityValidation = validateCity(idCity);
    if (!idCityValidation.valid) newErrors.city = idCityValidation.error;

    const idStateValidation = validateState(idState);
    if (!idStateValidation.valid) newErrors.state = idStateValidation.error;

    const idZipValidation = validateZip(idZip);
    if (!idZipValidation.valid) newErrors.zip = idZipValidation.error;

    // Validate shipping address
    const shippingFirstNameValidation = validateName(shippingFirstName, 'First name');
    if (!shippingFirstNameValidation.valid) newErrors.shippingFirstName = shippingFirstNameValidation.error;

    const shippingLastNameValidation = validateName(shippingLastName, 'Last name');
    if (!shippingLastNameValidation.valid) newErrors.shippingLastName = shippingLastNameValidation.error;

    const shippingAddressValidation = validateAddress(shippingAddress);
    if (!shippingAddressValidation.valid) newErrors.shippingAddress = shippingAddressValidation.error;

    const shippingCityValidation = validateCity(shippingCity);
    if (!shippingCityValidation.valid) newErrors.shippingCity = shippingCityValidation.error;

    const shippingStateValidation = validateState(shippingState);
    if (!shippingStateValidation.valid) newErrors.shippingState = shippingStateValidation.error;

    const shippingZipValidation = validateZip(shippingZip);
    if (!shippingZipValidation.valid) newErrors.shippingZip = shippingZipValidation.error;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors before saving');
      return;
    }

    const newDetails = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      dob: dateInputToDOB(dob),
      gender: gender.trim(),
      height: height.trim(),
      eye_color: eyeColor.trim(),
      id_number: idNumber.trim(),
      address: idAddress.trim(),
      city: idCity.trim(),
      state_name: idState.trim(),
      zip: idZip.trim(),
    };

    const newAddress = {
      first_name: shippingFirstName.trim(),
      last_name: shippingLastName.trim(),
      address: shippingAddress.trim(),
      city: shippingCity.trim(),
      state: shippingState.trim(),
      zip: shippingZip.trim(),
    };

    updateOrder(
      { orderId: order.id, newDetails, newAddress },
      {
        onSuccess: () => {
          toast.success('Order updated successfully');
          onOpenChange(false);
        },
        onError: (error: any) => {
          console.error('Update error:', error);
          const errorMessage = error?.message || 'Failed to update order';
          if (errorMessage.includes('Unauthorized')) {
            toast.error('You do not have permission to edit orders');
          } else if (errorMessage.includes('not found')) {
            toast.error('Order not found');
          } else {
            toast.error(errorMessage);
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order Details</DialogTitle>
          <DialogDescription>
            Update the ID card details and shipping address for order #{order.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ID Card Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">ID Card Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <InlineFieldMessage id="firstName-error" type="error">
                    {errors.firstName}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <InlineFieldMessage id="lastName-error" type="error">
                    {errors.lastName}
                  </InlineFieldMessage>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.dob ? 'dob-error' : undefined}
                  aria-invalid={!!errors.dob}
                />
                {errors.dob && (
                  <InlineFieldMessage id="dob-error" type="error">
                    {errors.dob}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender} disabled={isPending}>
                  <SelectTrigger id="gender" aria-describedby={errors.gender ? 'gender-error' : undefined} aria-invalid={!!errors.gender}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="X">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <InlineFieldMessage id="gender-error" type="error">
                    {errors.gender}
                  </InlineFieldMessage>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Select value={height} onValueChange={setHeight} disabled={isPending}>
                  <SelectTrigger id="height" aria-describedby={errors.height ? 'height-error' : undefined} aria-invalid={!!errors.height}>
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent>
                    {HEIGHT_OPTIONS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.height && (
                  <InlineFieldMessage id="height-error" type="error">
                    {errors.height}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eyeColor">Eye Color</Label>
                <Select value={eyeColor} onValueChange={setEyeColor} disabled={isPending}>
                  <SelectTrigger id="eyeColor" aria-describedby={errors.eyeColor ? 'eyeColor-error' : undefined} aria-invalid={!!errors.eyeColor}>
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
                  <InlineFieldMessage id="eyeColor-error" type="error">
                    {errors.eyeColor}
                  </InlineFieldMessage>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                disabled={isPending}
                aria-describedby={errors.idNumber ? 'idNumber-error' : undefined}
                aria-invalid={!!errors.idNumber}
              />
              {errors.idNumber && (
                <InlineFieldMessage id="idNumber-error" type="error">
                  {errors.idNumber}
                </InlineFieldMessage>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idAddress">Address on ID</Label>
              <Input
                id="idAddress"
                value={idAddress}
                onChange={(e) => setIdAddress(e.target.value)}
                disabled={isPending}
                aria-describedby={errors.address ? 'idAddress-error' : undefined}
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <InlineFieldMessage id="idAddress-error" type="error">
                  {errors.address}
                </InlineFieldMessage>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idCity">City</Label>
                <Input
                  id="idCity"
                  value={idCity}
                  onChange={(e) => setIdCity(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.city ? 'idCity-error' : undefined}
                  aria-invalid={!!errors.city}
                />
                {errors.city && (
                  <InlineFieldMessage id="idCity-error" type="error">
                    {errors.city}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idState">State</Label>
                <USStateSelect
                  id="idState"
                  value={idState}
                  onValueChange={setIdState}
                  placeholder="Select state"
                  disabled={isPending}
                  valueType="name"
                  aria-describedby={errors.state ? 'idState-error' : undefined}
                  aria-invalid={!!errors.state}
                />
                {errors.state && (
                  <InlineFieldMessage id="idState-error" type="error">
                    {errors.state}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idZip">ZIP Code</Label>
                <Input
                  id="idZip"
                  value={idZip}
                  onChange={(e) => setIdZip(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.zip ? 'idZip-error' : undefined}
                  aria-invalid={!!errors.zip}
                />
                {errors.zip && (
                  <InlineFieldMessage id="idZip-error" type="error">
                    {errors.zip}
                  </InlineFieldMessage>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingFirstName">First Name</Label>
                <Input
                  id="shippingFirstName"
                  value={shippingFirstName}
                  onChange={(e) => setShippingFirstName(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.shippingFirstName ? 'shippingFirstName-error' : undefined}
                  aria-invalid={!!errors.shippingFirstName}
                />
                {errors.shippingFirstName && (
                  <InlineFieldMessage id="shippingFirstName-error" type="error">
                    {errors.shippingFirstName}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingLastName">Last Name</Label>
                <Input
                  id="shippingLastName"
                  value={shippingLastName}
                  onChange={(e) => setShippingLastName(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.shippingLastName ? 'shippingLastName-error' : undefined}
                  aria-invalid={!!errors.shippingLastName}
                />
                {errors.shippingLastName && (
                  <InlineFieldMessage id="shippingLastName-error" type="error">
                    {errors.shippingLastName}
                  </InlineFieldMessage>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Address</Label>
              <Input
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={isPending}
                aria-describedby={errors.shippingAddress ? 'shippingAddress-error' : undefined}
                aria-invalid={!!errors.shippingAddress}
              />
              {errors.shippingAddress && (
                <InlineFieldMessage id="shippingAddress-error" type="error">
                  {errors.shippingAddress}
                </InlineFieldMessage>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.shippingCity ? 'shippingCity-error' : undefined}
                  aria-invalid={!!errors.shippingCity}
                />
                {errors.shippingCity && (
                  <InlineFieldMessage id="shippingCity-error" type="error">
                    {errors.shippingCity}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingState">State</Label>
                <USStateSelect
                  id="shippingState"
                  value={shippingState}
                  onValueChange={setShippingState}
                  placeholder="Select state"
                  disabled={isPending}
                  valueType="code"
                  aria-describedby={errors.shippingState ? 'shippingState-error' : undefined}
                  aria-invalid={!!errors.shippingState}
                />
                {errors.shippingState && (
                  <InlineFieldMessage id="shippingState-error" type="error">
                    {errors.shippingState}
                  </InlineFieldMessage>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingZip">ZIP Code</Label>
                <Input
                  id="shippingZip"
                  value={shippingZip}
                  onChange={(e) => setShippingZip(e.target.value)}
                  disabled={isPending}
                  aria-describedby={errors.shippingZip ? 'shippingZip-error' : undefined}
                  aria-invalid={!!errors.shippingZip}
                />
                {errors.shippingZip && (
                  <InlineFieldMessage id="shippingZip-error" type="error">
                    {errors.shippingZip}
                  </InlineFieldMessage>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
