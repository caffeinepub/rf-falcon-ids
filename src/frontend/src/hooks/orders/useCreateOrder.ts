import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { orderKeys, accountKeys, authKeys } from './queryKeys';
import type { Details, Address, ExternalBlob } from '../../backend';
import {
  normalizeText,
  validateName,
  validateAddress,
  validateCity,
  validateZip,
  validateHeight,
  validateState,
  validateGender,
  validateEyeColor,
  validateIdNumber,
} from '../../utils/validation';
import { withTimeout } from '../../utils/withTimeout';
import { normalizeOrderError } from '../../utils/orderErrors';

interface CreateOrderParams {
  id: string;
  details: Details;
  address: Address;
  photo: ExternalBlob;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address, photo }: CreateOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('You must be logged in to create an order');

      // Check if caller is banned before proceeding using caller-safe method with timeout
      try {
        const isBanned = await withTimeout(
          actor.isCallerBanned(),
          10000,
          'Ban check timed out. Please try again.'
        );
        if (isBanned) {
          throw new Error('Your account has been banned from placing orders');
        }
      } catch (error: any) {
        // If the error is about being banned, re-throw it with normalized message
        if (error.message && error.message.includes('banned')) {
          throw new Error(normalizeOrderError(error));
        }
        // If it's a timeout or network error, throw normalized error
        if (error.message && (error.message.includes('timed out') || error.message.includes('timeout'))) {
          throw new Error(normalizeOrderError(error));
        }
        // If it's an unauthorized error, throw normalized error
        if (error.message && error.message.includes('Unauthorized')) {
          throw new Error(normalizeOrderError(error));
        }
        // For other errors during ban check, log and proceed (backend will enforce)
        console.warn('Could not check ban status, proceeding with order creation:', error);
      }

      // Validate and normalize all fields before submission (defense-in-depth)
      const firstNameValidation = validateName(details.first_name, 'First name');
      if (!firstNameValidation.valid) throw new Error(firstNameValidation.error);

      const lastNameValidation = validateName(details.last_name, 'Last name');
      if (!lastNameValidation.valid) throw new Error(lastNameValidation.error);

      const addressValidation = validateAddress(details.address);
      if (!addressValidation.valid) throw new Error(addressValidation.error);

      const cityValidation = validateCity(details.city);
      if (!cityValidation.valid) throw new Error(cityValidation.error);

      const zipValidation = validateZip(details.zip);
      if (!zipValidation.valid) throw new Error(zipValidation.error);

      const heightValidation = validateHeight(details.height);
      if (!heightValidation.valid) throw new Error(heightValidation.error);

      const stateValidation = validateState(details.state_name);
      if (!stateValidation.valid) throw new Error(stateValidation.error);

      const genderValidation = validateGender(details.gender);
      if (!genderValidation.valid) throw new Error(genderValidation.error);

      const eyeColorValidation = validateEyeColor(details.eye_color);
      if (!eyeColorValidation.valid) throw new Error(eyeColorValidation.error);

      const idNumberValidation = validateIdNumber(details.id_number);
      if (!idNumberValidation.valid) throw new Error(idNumberValidation.error);

      // Validate shipping address
      const shipFirstNameValidation = validateName(address.first_name, 'Shipping first name');
      if (!shipFirstNameValidation.valid) throw new Error(shipFirstNameValidation.error);

      const shipLastNameValidation = validateName(address.last_name, 'Shipping last name');
      if (!shipLastNameValidation.valid) throw new Error(shipLastNameValidation.error);

      const shipAddressValidation = validateAddress(address.address);
      if (!shipAddressValidation.valid) throw new Error(shipAddressValidation.error);

      const shipCityValidation = validateCity(address.city);
      if (!shipCityValidation.valid) throw new Error(shipCityValidation.error);

      const shipZipValidation = validateZip(address.zip);
      if (!shipZipValidation.valid) throw new Error(shipZipValidation.error);

      const shipStateValidation = validateState(address.state);
      if (!shipStateValidation.valid) throw new Error(shipStateValidation.error);

      // Create normalized payload
      const normalizedDetails: Details = {
        first_name: firstNameValidation.normalized,
        last_name: lastNameValidation.normalized,
        dob: normalizeText(details.dob),
        gender: normalizeText(details.gender),
        height: heightValidation.normalized,
        eye_color: normalizeText(details.eye_color),
        address: addressValidation.normalized,
        city: cityValidation.normalized,
        state_name: stateValidation.normalized,
        zip: zipValidation.normalized,
        id_number: idNumberValidation.normalized,
      };

      const normalizedAddress: Address = {
        first_name: shipFirstNameValidation.normalized,
        last_name: shipLastNameValidation.normalized,
        address: shipAddressValidation.normalized,
        city: shipCityValidation.normalized,
        state: shipStateValidation.normalized,
        zip: shipZipValidation.normalized,
      };

      // Wrap the order creation call with timeout to prevent indefinite hanging
      try {
        await withTimeout(
          actor.createOrder(id, normalizedDetails, normalizedAddress, photo),
          45000,
          'Order creation timed out. Please try again.'
        );
      } catch (error: any) {
        // Normalize and re-throw the error with user-friendly message
        throw new Error(normalizeOrderError(error));
      }
      
      // Store order ID in localStorage keyed by principal
      if (identity) {
        const principalString = identity.getPrincipal().toString();
        const userOrderIds = JSON.parse(localStorage.getItem(`user_orders_${principalString}`) || '[]') as string[];
        if (!userOrderIds.includes(id)) {
          userOrderIds.push(id);
          localStorage.setItem(`user_orders_${principalString}`, JSON.stringify(userOrderIds));
        }
      }
    },
    onSuccess: () => {
      // Invalidate user orders and admin-related queries
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders() });
      queryClient.invalidateQueries({ queryKey: orderKeys.allOrders() });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
