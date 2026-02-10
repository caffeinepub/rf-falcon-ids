import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { authKeys } from '../orders/queryKeys';

export function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const query = useQuery<boolean>({
    queryKey: authKeys.isAdmin(),
    queryFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Admin check error:', error);
        // Re-throw to let React Query handle the error state
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated && !isInitializing,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Detect if we're stuck: authenticated but actor unavailable after initialization
  const isActorUnavailable = isAuthenticated && !isInitializing && !actorFetching && !actor;

  const retryActor = () => {
    // Invalidate actor query to retry initialization
    queryClient.invalidateQueries({ queryKey: ['actor'] });
    // Invalidate admin check query
    queryClient.invalidateQueries({ queryKey: authKeys.isAdmin() });
    // Refetch after invalidation
    queryClient.refetchQueries({ queryKey: ['actor'] });
  };

  // Return deterministic loading state
  // Don't treat errors as "not admin" - expose error state explicitly
  return {
    data: query.data,
    isLoading: isInitializing || actorFetching || (isAuthenticated && query.isLoading),
    isFetched: !!actor && !actorFetching && query.isFetched,
    isError: query.isError,
    error: query.error,
    isActorUnavailable,
    retryActor,
  };
}
