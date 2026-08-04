export const FREE_SHIPPING_THRESHOLD = 75;
export const FLAT_SHIPPING = 6.95;

export function shippingCost(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}
