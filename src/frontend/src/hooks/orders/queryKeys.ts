export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: string) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  archivedOrders: () => [...orderKeys.all, 'archived'] as const,
  allOrders: () => [...orderKeys.all, 'allOrders'] as const,
  userOrders: () => [...orderKeys.all, 'userOrders'] as const,
  order: (id: string) => [...orderKeys.all, 'order', id] as const,
};

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  vipStatus: () => [...authKeys.all, 'vipStatus'] as const,
  adminStatus: () => [...authKeys.all, 'adminStatus'] as const,
  isAdmin: () => [...authKeys.all, 'isAdmin'] as const,
};

export const accountKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountKeys.all, 'list'] as const,
  list: (filters?: string) => [...accountKeys.lists(), { filters }] as const,
  details: () => [...accountKeys.all, 'detail'] as const,
  info: (principal: string) => [...accountKeys.details(), principal] as const,
};

export const promoKeys = {
  all: ['promoCodes'] as const,
  lists: () => [...promoKeys.all, 'list'] as const,
  list: () => [...promoKeys.lists()] as const,
  details: () => [...promoKeys.all, 'detail'] as const,
  detail: (code: string) => [...promoKeys.details(), code] as const,
  validation: (code: string) => [...promoKeys.all, 'validation', code] as const,
};

export const auditKeys = {
  all: ['audit'] as const,
  logs: () => [...auditKeys.all, 'log'] as const,
  log: (limit?: number) => [...auditKeys.logs(), { limit }] as const,
};

export const securityKeys = {
  all: ['security'] as const,
  stats: () => [...securityKeys.all, 'stats'] as const,
  events: (limit?: number) => [...securityKeys.all, 'events', { limit }] as const,
  config: () => [...securityKeys.all, 'config'] as const,
};
