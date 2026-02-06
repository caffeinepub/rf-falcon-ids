export const orderKeys = {
  all: ['orders'] as const,
  userOrders: () => [...orderKeys.all, 'user'] as const,
  allOrders: () => [...orderKeys.all, 'admin', 'all'] as const,
  order: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const authKeys = {
  all: ['auth'] as const,
  isAdmin: () => [...authKeys.all, 'isAdmin'] as const,
};
