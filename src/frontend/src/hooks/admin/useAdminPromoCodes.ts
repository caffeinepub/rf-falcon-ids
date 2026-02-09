import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { promoKeys } from '../orders/queryKeys';
import type { PromoCode } from '../../backend';

export function useGetPromoCodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PromoCode[]>({
    queryKey: promoKeys.list(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllPromoCodes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddPromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promoCode: string) => {
      if (!actor) throw new Error('Actor not available');
      
      const normalizedCode = promoCode.trim().toUpperCase();
      
      // Create promo code with 5% discount, valid for 1 year, unlimited usage
      const oneYearFromNow = BigInt(Date.now() * 1_000_000) + BigInt(365 * 24 * 60 * 60 * 1_000_000_000);
      
      await actor.createPromoCode(
        normalizedCode,
        BigInt(5), // 5% discount
        oneYearFromNow,
        BigInt(999999) // Effectively unlimited
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.list() });
    },
  });
}

export function useRemovePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promoCode: string) => {
      if (!actor) throw new Error('Actor not available');
      
      const normalizedCode = promoCode.trim().toUpperCase();
      await actor.deactivatePromoCode(normalizedCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.list() });
    },
  });
}
