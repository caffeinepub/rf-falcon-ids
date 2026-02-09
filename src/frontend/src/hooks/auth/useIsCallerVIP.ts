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
      const profile = await actor.getCallerUserProfile();
      return profile?.isVIP ?? false;
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
    staleTime: 30_000,
  });

  return {
    ...query,
    isVIP: query.data ?? false,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !!identity && query.isFetched,
  };
}
