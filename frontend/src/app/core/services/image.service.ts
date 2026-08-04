import { Injectable } from '@angular/core';

/**
 * Products now carry a real imageUrl from the backend catalog. When present,
 * use it (appending Unsplash sizing params); otherwise fall back to a
 * deterministic picsum placeholder seeded by SKU.
 */
@Injectable({ providedIn: 'root' })
export class ImageService {
  product(product: { id: number; sku: string; imageUrl?: string | null }, size = 600): string {
    if (product.imageUrl) {
      return `${product.imageUrl}?auto=format&fit=crop&w=${size}&q=80`;
    }
    const seed = product.sku || String(product.id);
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
  }
}
