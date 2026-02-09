import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { authKeys } from '../orders/queryKeys';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<boolean>({
    queryKey: authKeys.isAdmin(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Admin check error:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !isInitializing,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Detect if we're stuck: authenticated but actor unavailable after initialization
  // Wait a reasonable time (5 seconds) before declaring actor unavailable
  const isActorUnavailable = isAuthenticated && !isInitializing && !actorFetching && !actor && !query.isLoading;

  const retryActor = () => {
    // Force a page reload to retry actor initialization
    window.location.reload();
  };

  // Return deterministic loading state
  return {
    ...query,
    isLoading: isInitializing || actorFetching || (isAuthenticated && query.isLoading),
    isFetched: !!actor && !actorFetching && query.isFetched,
    isActorUnavailable,
    retryActor,
  };
}
