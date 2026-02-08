/**
 * Shared validation and normalization utilities for user inputs
 * Provides consistent sanitization across forms before backend calls
 */

// Max lengths for text fields
export const MAX_LENGTHS = {
  NAME: 100,
  ADDRESS: 200,
  CITY: 100,
  ZIP: 10,
  STATE: 50,
  HEIGHT: 20,
  ID_NUMBER: 20,
  TRACKING_NUMBER: 100,
} as const;

// Allowed character patterns
const NAME_PATTERN = /^[a-zA-Z\s\-'.]+$/;
const ADDRESS_PATTERN = /^[a-zA-Z0-9\s\-'.#,]+$/;
const CITY_PATTERN = /^[a-zA-Z\s\-'.]+$/;
const ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const HEIGHT_PATTERN = /^[0-9]'[0-9]{1,2}"?$|^[0-9]{2,3}\s?(cm|in)$/i;

/**
 * Normalize text by trimming whitespace and collapsing multiple spaces
 */
export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Validate and normalize a name field
 */
export function validateName(name: string, fieldName: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(name);
  
  if (!normalized) {
    return { valid: false, error: `${fieldName} is required`, normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.NAME) {
    return { valid: false, error: `${fieldName} must be ${MAX_LENGTHS.NAME} characters or less`, normalized };
  }
  
  if (!NAME_PATTERN.test(normalized)) {
    return { valid: false, error: `${fieldName} contains invalid characters`, normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate and normalize an address field
 */
export function validateAddress(address: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(address);
  
  if (!normalized) {
    return { valid: false, error: 'Address is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.ADDRESS) {
    return { valid: false, error: `Address must be ${MAX_LENGTHS.ADDRESS} characters or less`, normalized };
  }
  
  if (!ADDRESS_PATTERN.test(normalized)) {
    return { valid: false, error: 'Address contains invalid characters', normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate and normalize a city field
 */
export function validateCity(city: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(city);
  
  if (!normalized) {
    return { valid: false, error: 'City is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.CITY) {
    return { valid: false, error: `City must be ${MAX_LENGTHS.CITY} characters or less`, normalized };
  }
  
  if (!CITY_PATTERN.test(normalized)) {
    return { valid: false, error: 'City contains invalid characters', normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate ZIP code format
 */
export function validateZip(zip: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(zip);
  
  if (!normalized) {
    return { valid: false, error: 'ZIP code is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.ZIP) {
    return { valid: false, error: `ZIP code must be ${MAX_LENGTHS.ZIP} characters or less`, normalized };
  }
  
  if (!ZIP_PATTERN.test(normalized)) {
    return { valid: false, error: 'ZIP code must be in format 12345 or 12345-6789', normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate height format
 */
export function validateHeight(height: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(height);
  
  if (!normalized) {
    return { valid: false, error: 'Height is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.HEIGHT) {
    return { valid: false, error: `Height must be ${MAX_LENGTHS.HEIGHT} characters or less`, normalized };
  }
  
  if (!HEIGHT_PATTERN.test(normalized)) {
    return { valid: false, error: 'Height must be in format like 5\'10" or 180cm', normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate state selection
 */
export function validateState(state: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(state);
  
  if (!normalized) {
    return { valid: false, error: 'State is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.STATE) {
    return { valid: false, error: `State must be ${MAX_LENGTHS.STATE} characters or less`, normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate gender selection
 */
export function validateGender(gender: string): { valid: boolean; error?: string } {
  if (!gender || !gender.trim()) {
    return { valid: false, error: 'Gender is required' };
  }
  
  return { valid: true };
}

/**
 * Validate eye color selection
 */
export function validateEyeColor(eyeColor: string): { valid: boolean; error?: string } {
  if (!eyeColor || !eyeColor.trim()) {
    return { valid: false, error: 'Eye color is required' };
  }
  
  return { valid: true };
}

/**
 * Validate tracking number
 */
export function validateTrackingNumber(trackingNumber: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(trackingNumber);
  
  if (!normalized) {
    return { valid: false, error: 'Tracking number is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.TRACKING_NUMBER) {
    return { valid: false, error: `Tracking number must be ${MAX_LENGTHS.TRACKING_NUMBER} characters or less`, normalized };
  }
  
  return { valid: true, normalized };
}

/**
 * Validate ID number
 */
export function validateIdNumber(idNumber: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeText(idNumber);
  
  if (!normalized) {
    return { valid: false, error: 'ID number is required', normalized: '' };
  }
  
  if (normalized.length > MAX_LENGTHS.ID_NUMBER) {
    return { valid: false, error: `ID number must be ${MAX_LENGTHS.ID_NUMBER} characters or less`, normalized };
  }
  
  return { valid: true, normalized };
}
