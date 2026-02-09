import { Details, Address } from '../../backend';

export interface CartItem {
  id: string;
  details: Details;
  address: Address;
  photoDataUrl: string;
  signatureDataUrl: string | null;
  promoCode: string | null;
  addedAt: number;
}
