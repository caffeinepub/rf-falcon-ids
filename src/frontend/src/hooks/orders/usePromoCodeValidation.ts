import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { promoKeys } from './queryKeys';

interface PromoValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

// Note: Promo codes are not implemented in the backend
// This hook always returns invalid to prevent errors

export function usePromoCodeValidation(promoCode: string): PromoValidationResult {
  const { actor, isFetching: actorFetching } = useActor();
  const trimmedCode = promoCode.trim().toUpperCase();

  // Backend doesn't support promo codes, so always return invalid
  return { isValid: false, isLoading: false, error: null };
}
