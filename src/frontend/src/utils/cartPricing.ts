import { ORDER_BASE_PRICE } from '../content/copy';

export interface CartPricingBreakdown {
  subtotal: number;
  multipleIdDiscount: number;
  total: number;
  formattedSubtotal: string;
  formattedDiscount: string;
  formattedTotal: string;
}

export function calculateCartPricing(quantity: number): CartPricingBreakdown {
  const subtotal = quantity * ORDER_BASE_PRICE;
  const multipleIdDiscount = quantity < 2 ? 0 : (quantity - 1) * 10;
  const total = subtotal - multipleIdDiscount;

  return {
    subtotal,
    multipleIdDiscount,
    total,
    formattedSubtotal: `$${subtotal.toFixed(2)}`,
    formattedDiscount: multipleIdDiscount > 0 ? `-$${multipleIdDiscount.toFixed(2)}` : '$0.00',
    formattedTotal: `$${total.toFixed(2)}`,
  };
}
