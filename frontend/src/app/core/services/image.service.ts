import { Injectable } from '@angular/core';

/**
 * The backend Product model has no image field yet, so product cards use
 * deterministic placeholder photos (seeded by SKU) until it does.
 */
@Injectable({ providedIn: 'root' })
export class ImageService {
  product(product: { id: number; sku: string }, size = 600): string {
    const seed = product.sku || String(product.id);
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${size}/${size}`;
  }
}
