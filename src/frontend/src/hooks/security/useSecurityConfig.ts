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

export function useSecurityConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SecurityConfig>({
    queryKey: securityKeys.config(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSecurityConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}
