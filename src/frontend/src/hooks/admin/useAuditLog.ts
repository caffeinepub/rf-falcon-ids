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
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
