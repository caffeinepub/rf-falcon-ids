import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { promoKeys } from '../orders/queryKeys';

export function useGetPromoCodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
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
      await actor.addPromoCode(promoCode);
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
      await actor.removePromoCode(promoCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoKeys.list() });
    },
  });
}
