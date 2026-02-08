import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import { Principal } from '@dfinity/principal';

export function useToggleSecurity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!actor) throw new Error('Actor not available');
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.setSecurityEnabled(enabled, token);
      
      return actor.setSecurityEnabled(enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}

export function useUpdateRateLimits() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ window, maxCalls }: { window: number; maxCalls: number }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.updateRateLimits(BigInt(window), BigInt(maxCalls), token);
      
      return actor.updateRateLimits(BigInt(window), BigInt(maxCalls));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}

export function useClearSecurityCounters() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.clearSecurityCounters(token);
      
      return actor.clearSecurityCounters();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}

export function useAddToBlocklist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalText);
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.addToBlocklist(principal, token);
      
      return actor.addToBlocklist(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}

export function useRemoveFromBlocklist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalText);
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.removeFromBlocklist(principal, token);
      
      return actor.removeFromBlocklist(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}

export function useAddToAllowlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalText);
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.addToAllowlist(principal, token);
      
      return actor.addToAllowlist(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}

export function useRemoveFromAllowlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalText: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalText);
      
      // Note: CSRF token support prepared but backend not yet implemented
      // When available: const { token } = useCsrfToken(); await actor.removeFromAllowlist(principal, token);
      
      return actor.removeFromAllowlist(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}
