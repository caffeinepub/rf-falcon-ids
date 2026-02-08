export const orderKeys = {
  all: ['orders'] as const,
  userOrders: () => [...orderKeys.all, 'user'] as const,
  allOrders: () => [...orderKeys.all, 'admin', 'all'] as const,
  order: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const authKeys = {
  all: ['auth'] as const,
  isAdmin: () => [...authKeys.all, 'isAdmin'] as const,
  vipStatus: () => [...authKeys.all, 'vipStatus'] as const,
  userProfile: () => [...authKeys.all, 'userProfile'] as const,
};

export const securityKeys = {
  all: ['security'] as const,
  stats: () => [...securityKeys.all, 'stats'] as const,
  events: (limit: number) => [...securityKeys.all, 'events', limit] as const,
  config: () => [...securityKeys.all, 'config'] as const,
};

export const auditKeys = {
  all: ['audit'] as const,
  log: (limit: number) => [...auditKeys.all, 'log', limit] as const,
};

export const accountKeys = {
  all: ['accounts'] as const,
  allAccounts: () => [...accountKeys.all, 'admin', 'all'] as const,
  vipAccounts: () => [...accountKeys.all, 'vip'] as const,
};
