import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { accountKeys, auditKeys } from '../orders/queryKeys';
import { Principal } from '@dfinity/principal';
import type { AccountInfo } from '../../backend';
import { toast } from 'sonner';

export function useAllAccounts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AccountInfo[]>({
    queryKey: accountKeys.allAccounts(),
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const accounts = await actor.getAllAccounts();
      return accounts;
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGrantVIPStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.grantVIPStatus(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      toast.success('VIP status granted successfully');
    },
    onError: (error: any) => {
      console.error('Grant VIP error:', error);
      const message = error.message || 'Failed to grant VIP status';
      toast.error(message);
    },
  });
}

export function useRevokeVIPStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.revokeVIPStatus(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      toast.success('VIP status revoked successfully');
    },
    onError: (error: any) => {
      console.error('Revoke VIP error:', error);
      const message = error.message || 'Failed to revoke VIP status';
      toast.error(message);
    },
  });
}

export function useBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.banUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      toast.success('User banned successfully');
    },
    onError: (error: any) => {
      console.error('Ban user error:', error);
      const message = error.message || 'Failed to ban user';
      toast.error(message);
    },
  });
}

export function useUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unbanUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      toast.success('User unbanned successfully');
    },
    onError: (error: any) => {
      console.error('Unban user error:', error);
      const message = error.message || 'Failed to unban user';
      toast.error(message);
    },
  });
}
