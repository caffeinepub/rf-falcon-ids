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
      return actor.removeFromAllowlist(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityKeys.config() });
      queryClient.invalidateQueries({ queryKey: securityKeys.events(100) });
    },
  });
}
