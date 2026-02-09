import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { securityKeys } from '../orders/queryKeys';
import { Principal } from '@dfinity/principal';

// Note: Security mutations are not implemented in the backend
// These hooks throw errors to prevent accidental use

export function useToggleSecurity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      throw new Error('Security toggle is not available');
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
      throw new Error('Rate limit updates are not available');
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
      throw new Error('Clear security counters is not available');
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
      throw new Error('Blocklist management is not available');
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
      throw new Error('Blocklist management is not available');
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
      throw new Error('Allowlist management is not available');
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
      throw new Error('Allowlist management is not available');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}
