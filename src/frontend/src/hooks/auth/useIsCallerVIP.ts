import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { authKeys } from '../orders/queryKeys';

export function useIsCallerVIP() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<boolean>({
    queryKey: authKeys.vipStatus(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Use the backend VIP source of truth
      return actor.isCallerVIP();
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
    staleTime: 5_000, // Reduced to 5 seconds for faster VIP status updates
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return {
    ...query,
    isVIP: query.data ?? false,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}
