import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { toast } from 'sonner';

export function useListAdminEmails() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['adminEmails'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAdminEmails();
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
  });
}

export function useGrantAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.grantAdminAccess(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmails'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
  });
}

export function useRevokeAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.revokeAdminAccess(email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmails'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
  });
}
