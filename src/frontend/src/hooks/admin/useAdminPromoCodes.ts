import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { promoKeys } from '../orders/queryKeys';

// Note: Promo code management is not implemented in the backend
// These hooks return stub data to prevent TypeScript errors

export function useGetPromoCodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: promoKeys.list(),
    queryFn: async () => {
      // Backend doesn't support promo codes
      // Return empty array as stub
      return [];
    },
    enabled: false, // Disabled since backend doesn't support this
  });
}

export function useAddPromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promoCode: string) => {
      // Backend doesn't support promo codes
      throw new Error('Promo code management is not available');
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
      // Backend doesn't support promo codes
      throw new Error('Promo code management is not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.list() });
    },
  });
}
