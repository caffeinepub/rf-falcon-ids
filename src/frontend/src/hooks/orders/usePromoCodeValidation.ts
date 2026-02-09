import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { promoKeys } from './queryKeys';

interface PromoValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  discountPercentage: number;
}

export function usePromoCodeValidation(promoCode: string): PromoValidationResult {
  const { actor, isFetching: actorFetching } = useActor();
  const trimmedCode = promoCode.trim().toUpperCase();

  const query = useQuery({
    queryKey: promoKeys.validation(trimmedCode),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.validatePromoCode(trimmedCode);
    },
    enabled: !!actor && !actorFetching && trimmedCode.length > 0,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    isValid: query.data?.valid ?? false,
    isLoading: query.isLoading || actorFetching,
    error: query.error ? 'Failed to validate promo code' : null,
    discountPercentage: query.data?.discountPercentage ? Number(query.data.discountPercentage) : 0,
  };
}
