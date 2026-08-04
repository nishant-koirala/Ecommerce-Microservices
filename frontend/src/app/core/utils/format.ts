export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  );
}

/**
 * Deterministic pseudo-rating for the design prototype. The backend Product
 * model has no rating/review data yet, so cards derive a stable 3.5–5.0 value
 * from the product id. Swap for real review data when the backend provides it.
 */
export function pseudoRating(productId: number): number {
  return 3.5 + ((productId * 7) % 15) / 10;
}

export function pseudoReviewCount(productId: number): number {
  return (productId * 13) % 240 + 8;
}
