import { CategoryResponse, ProductResponse } from '../models/product';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

export function isSortOption(value: string | null | undefined): value is SortOption {
  return value === 'featured' || value === 'price-asc' || value === 'price-desc' || value === 'name-asc';
}

export function sortProducts(products: ProductResponse[], sort: SortOption): ProductResponse[] {
  const copy = [...products];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy;
  }
}

/**
 * The backend exposes categories only to authenticated users, but the public
 * products response embeds each product's category — derive the category list
 * from a product list (preserving first-seen order).
 */
export function deriveCategories(products: ProductResponse[]): CategoryResponse[] {
  const byId = new Map<number, CategoryResponse>();
  for (const product of products) {
    byId.set(product.category.id, product.category);
  }
  return [...byId.values()];
}
