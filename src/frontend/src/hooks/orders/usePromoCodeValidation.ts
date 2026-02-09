import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { promoKeys } from './queryKeys';

interface PromoValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePromoCodeValidation(promoCode: string): PromoValidationResult {
  const { actor, isFetching: actorFetching } = useActor();
  const trimmedCode = promoCode.trim().toUpperCase();

  const { data: promoCodes, isLoading, error } = useQuery<string[]>({
    queryKey: promoKeys.list(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPromoCodes();
    },
    enabled: !!actor && !actorFetching && trimmedCode.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  if (trimmedCode.length === 0) {
    return { isValid: false, isLoading: false, error: null };
  }

  if (isLoading || actorFetching) {
    return { isValid: false, isLoading: true, error: null };
  }

  if (error) {
    return { isValid: false, isLoading: false, error: 'Failed to validate promo code' };
  }

  if (!promoCodes) {
    return { isValid: false, isLoading: false, error: null };
  }

  // Case-insensitive match
  const isValid = promoCodes.some(code => code.toUpperCase() === trimmedCode);

  return { isValid, isLoading: false, error: null };
}
