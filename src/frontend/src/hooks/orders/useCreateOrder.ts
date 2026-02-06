import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useSessionAuth } from '../auth/useSessionAuth';
import { orderKeys } from './queryKeys';
import type { Details, Address, ExternalBlob } from '../../backend';

interface CreateOrderParams {
  id: string;
  details: Details;
  address: Address;
  photo: ExternalBlob;
}

export function useCreateOrder() {
  const { actor } = useActor();
  const { username } = useSessionAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address, photo }: CreateOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrder(id, details, address, photo);
      
      // Store order ID in localStorage for this user
      if (username) {
        const userOrderIds = JSON.parse(localStorage.getItem(`user_orders_${username}`) || '[]') as string[];
        if (!userOrderIds.includes(id)) {
          userOrderIds.push(id);
          localStorage.setItem(`user_orders_${username}`, JSON.stringify(userOrderIds));
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders() });
    },
  });
}
