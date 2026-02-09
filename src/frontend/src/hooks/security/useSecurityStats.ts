import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import type { SecurityStats } from '../../backend';

// Note: Security stats are not implemented in the backend
// This hook returns stub data to prevent TypeScript errors

export function useSecurityStats() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SecurityStats>({
    queryKey: securityKeys.stats(),
    queryFn: async () => {
      // Backend doesn't support security stats
      // Return stub data
      return {
        allowedCalls: BigInt(0),
        deniedCalls: BigInt(0),
        throttledCalls: BigInt(0),
      };
    },
    enabled: false, // Disabled since backend doesn't support this
    staleTime: 8000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
}
