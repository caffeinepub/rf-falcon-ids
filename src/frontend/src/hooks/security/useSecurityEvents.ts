import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';

// Note: SecurityEvent type is not exported from backend
// Define a local stub type that matches expected usage
export interface SecurityEvent {
  timestamp: bigint;
  principal: string;
  action: string;
  result: 'allowed' | 'denied' | 'throttled';
  reason: string;
}

// Note: Security events are not implemented in the backend
// This hook returns stub data to prevent TypeScript errors

export function useSecurityEvents(limit: number = 100) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SecurityEvent[]>({
    queryKey: securityKeys.events(limit),
    queryFn: async () => {
      // Backend doesn't support security events
      // Return empty array as stub
      return [];
    },
    enabled: false, // Disabled since backend doesn't support this
    staleTime: 4000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
  });
}
