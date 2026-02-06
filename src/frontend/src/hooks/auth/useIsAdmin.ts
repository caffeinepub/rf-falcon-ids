import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { authKeys } from '../orders/queryKeys';

export function useIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: authKeys.isAdmin(),
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}
