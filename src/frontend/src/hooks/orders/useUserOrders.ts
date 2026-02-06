import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useSessionAuth } from '../auth/useSessionAuth';
import { orderKeys } from './queryKeys';
import type { Order } from '../../backend';

export function useUserOrders() {
  const { actor, isFetching } = useActor();
  const { username, isAuthenticated } = useSessionAuth();

  return useQuery<Order[]>({
    queryKey: orderKeys.userOrders(),
    queryFn: async () => {
      if (!actor || !isAuthenticated) return [];
      
      // Since backend doesn't have getUserOrders, we'll store order IDs in localStorage
      // and fetch them individually, or return empty array for now
      const userOrderIds = JSON.parse(localStorage.getItem(`user_orders_${username}`) || '[]') as string[];
      
      if (userOrderIds.length === 0) {
        return [];
      }
      
      // Fetch orders by IDs if we have any
      try {
        const orders = await Promise.all(
          userOrderIds.map(async (id) => {
            try {
              return await actor.getOrder(id);
            } catch {
              return null;
            }
          })
        );
        return orders.filter((order): order is Order => order !== null);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });
}
