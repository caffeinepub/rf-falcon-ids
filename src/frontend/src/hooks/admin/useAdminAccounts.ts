import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { accountKeys, auditKeys, authKeys } from '../orders/queryKeys';
import { Principal } from '@dfinity/principal';
import type { AccountInfo } from '../../backend';
import { toast } from 'sonner';

export function useAccountInfo(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AccountInfo | null>({
    queryKey: accountKeys.info(principal?.toText() || ''),
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        const accountInfo = await actor.getAccountInfo(principal);
        return accountInfo || null;
      } catch (error: any) {
        // Normalize authorization errors
        if (error.message?.includes('Unauthorized') || error.message?.includes('Only admins')) {
          throw new Error('You do not have permission to view account information');
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

export function useSetVIPStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, isVIP }: { principal: Principal; isVIP: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setVIPStatus(principal, isVIP);
    },
    onSuccess: (_, { principal, isVIP }) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.info(principal.toText()) });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success(isVIP ? 'VIP status granted successfully' : 'VIP status revoked successfully');
    },
    onError: (error: any) => {
      console.error('Set VIP status error:', error);
      const message = error.message || 'Failed to update VIP status';
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
    onSuccess: (_, principal) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.info(principal.toText()) });
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
    onSuccess: (_, principal) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
      queryClient.invalidateQueries({ queryKey: accountKeys.info(principal.toText()) });
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
