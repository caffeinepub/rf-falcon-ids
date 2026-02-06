import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, details, address, photo }: CreateOrderParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(id, details, address, photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.userOrders() });
    },
  });
}
