import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { auditKeys } from '../orders/queryKeys';
import type { AuditLogEntry } from '../../backend';

export function useAuditLog(limit: number = 100) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AuditLogEntry[]>({
    queryKey: auditKeys.log(limit),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAuditLog(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 8000, // Consider data fresh for 8 seconds
    refetchInterval: (query) => {
      // Only refetch when document is visible
      return document.hidden ? false : 10000;
    },
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchIntervalInBackground: false, // Stop polling when tab is hidden
  });
}
