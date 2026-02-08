import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import { orderKeys } from './queryKeys';
import type { Order } from '../../backend';

export function useUserOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return useQuery<Order[]>({
    queryKey: orderKeys.userOrders(),
    queryFn: async () => {
      if (!actor || !isAuthenticated || !identity) return [];
      
      // Retrieve order IDs from localStorage keyed by principal
      const principalString = identity.getPrincipal().toString();
      const userOrderIds = JSON.parse(localStorage.getItem(`user_orders_${principalString}`) || '[]') as string[];
      
      if (userOrderIds.length === 0) {
        return [];
      }
      
      // Fetch orders by IDs
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
    staleTime: 30000, // 30 seconds - reasonable cache duration
    refetchOnWindowFocus: false, // Prevent unnecessary refetches on tab switch
  });
}
