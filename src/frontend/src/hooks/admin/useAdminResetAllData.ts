import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { orderKeys, authKeys } from '../orders/queryKeys';

// Note: Reset all data is not implemented in the backend
// This hook throws an error to prevent accidental use

export function useAdminResetAllData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Backend doesn't support reset all data
      throw new Error('Reset all data is not available');
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error: any) => {
      console.error('Reset all data error:', error);
      throw error;
    },
  });
}
