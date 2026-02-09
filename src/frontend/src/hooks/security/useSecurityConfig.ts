import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';

export interface SecurityConfig {
  enabled: boolean;
  rateLimitWindow: bigint;
  maxCallsPerWindow: bigint;
  blocklistSize: bigint;
  allowlistSize: bigint;
}

// Note: Security config is not implemented in the backend
// This hook returns stub data to prevent TypeScript errors

export function useSecurityConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SecurityConfig>({
    queryKey: securityKeys.config(),
    queryFn: async () => {
      // Backend doesn't support security config
      // Return stub data
      return {
        enabled: false,
        rateLimitWindow: BigInt(60),
        maxCallsPerWindow: BigInt(100),
        blocklistSize: BigInt(0),
        allowlistSize: BigInt(0),
      };
    },
    enabled: false, // Disabled since backend doesn't support this
  });
}
