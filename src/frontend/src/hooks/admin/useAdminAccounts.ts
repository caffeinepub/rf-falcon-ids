import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { accountKeys, auditKeys, authKeys, orderKeys } from '../orders/queryKeys';
import type { AccountInfo } from '../../backend';
import { Principal } from '@dfinity/principal';

export function useAccountInfo(principal: Principal | null) {
  const { actor } = useActor();

  return useQuery<AccountInfo | null>({
    queryKey: principal ? accountKeys.info(principal.toText()) : ['accounts', 'null'],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getAccountInfo(principal);
    },
    enabled: !!actor && !!principal,
    staleTime: 10_000,
  });
}

export function useSetVIPStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, isVIP }: { principal: Principal; isVIP: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setVIPStatus(principal, isVIP);
    },
    onSuccess: (_, { principal }) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: accountKeys.info(principal.toText()) });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all }); // Invalidate all auth queries including VIP status
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.banUser(principal);
    },
    onSuccess: (_, principal) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.info(principal.toText()) });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unbanUser(principal);
    },
    onSuccess: (_, principal) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.info(principal.toText()) });
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}
