import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { toast } from 'sonner';

// Note: Admin access management via email is not implemented in the backend
// These hooks return stub data to prevent TypeScript errors

export function useListAdminEmails() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['adminEmails'],
    queryFn: async () => {
      // Backend doesn't support email-based admin management
      // Return empty array as stub
      return [];
    },
    enabled: false, // Disabled since backend doesn't support this
    retry: 1,
  });
}

export function useGrantAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      // Backend doesn't support email-based admin management
      throw new Error('Admin access management via email is not available');
    },
    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: ['adminEmails'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
      toast.success(`Admin access granted to ${email}`);
    },
    onError: (error: any) => {
      console.error('Grant admin access error:', error);
      const message = error.message || 'Failed to grant admin access';
      toast.error(message);
    },
  });
}

export function useRevokeAdminAccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      // Backend doesn't support email-based admin management
      throw new Error('Admin access management via email is not available');
    },
    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: ['adminEmails'] });
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
      toast.success(`Admin access revoked for ${email}`);
    },
    onError: (error: any) => {
      console.error('Revoke admin access error:', error);
      const message = error.message || 'Failed to revoke admin access';
      toast.error(message);
    },
  });
}
