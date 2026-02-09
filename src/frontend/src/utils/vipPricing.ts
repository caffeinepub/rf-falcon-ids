export const VIP_DISCOUNT_PERCENTAGE = 0.10; // 10% discount

export function calculateVIPDiscount(basePrice: number): number {
  return basePrice * VIP_DISCOUNT_PERCENTAGE;
}

export function calculateVIPTotal(basePrice: number): number {
  return basePrice - calculateVIPDiscount(basePrice);
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
