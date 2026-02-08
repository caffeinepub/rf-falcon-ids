import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';

/**
 * CSRF token hook for state-changing operations
 * Note: Backend CSRF token generation is not yet implemented
 * This hook is prepared for future backend capability
 */
export function useCsrfToken() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const query = useQuery<string | null>({
    queryKey: ['csrfToken', identity?.getPrincipal().toString()],
    queryFn: async () => {
      // Backend CSRF token generation not yet implemented
      // When available, call: return actor.getCsrfToken();
      // For now, return null to indicate no token required
      return null;
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    token: query.data,
    isLoading: actorFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
