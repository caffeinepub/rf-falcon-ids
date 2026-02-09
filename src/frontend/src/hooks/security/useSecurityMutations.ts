import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys, auditKeys } from '../orders/queryKeys';
import type { TreyCSecurityConfig } from '../../backend';

export function useToggleSecurity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      try {
        // Get current config
        const currentConfig = await actor.getTreyCSecurityConfig();
        
        // Update with new enabled status
        const updatedConfig: TreyCSecurityConfig = {
          ...currentConfig,
          enabled,
        };
        
        await actor.setTreyCSecurityConfig(updatedConfig);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only admins can toggle security settings');
        }
        throw new Error(`Failed to toggle security: ${error.message || 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events() });
      queryClient.invalidateQueries({ queryKey: auditKeys.logs() });
    },
  });
}

export function useUpdateSecurityConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: TreyCSecurityConfig) => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      try {
        await actor.setTreyCSecurityConfig(config);
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only admins can update security configuration');
        }
        throw new Error(`Failed to update security config: ${error.message || 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events() });
      queryClient.invalidateQueries({ queryKey: auditKeys.logs() });
    },
  });
}

export function useClearSecurityEvents() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      try {
        await actor.clearTreyCSecurityEvents();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only admins can clear security events');
        }
        throw new Error(`Failed to clear security events: ${error.message || 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.events() });
      queryClient.invalidateQueries({ queryKey: auditKeys.logs() });
    },
  });
}

export function useResetSecurityStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) {
        throw new Error('Actor not available');
      }

      try {
        await actor.resetTreyCSecurityStats();
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          throw new Error('Unauthorized: Only admins can reset security statistics');
        }
        throw new Error(`Failed to reset security stats: ${error.message || 'Unknown error'}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: auditKeys.logs() });
    },
  });
}
