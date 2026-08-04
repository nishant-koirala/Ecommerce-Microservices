import { ProductResponse } from './product';

/** Raw cart item as returned by the backend. */
export interface CartItemResponse {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
}

/**
 * Cart item enriched with product details for display.
 * The backend returns only productId, so CartService joins in the product.
 */
export interface CartItem {
  id: number;
  userId: number;
  product: ProductResponse;
  quantity: number;
}

export interface AddToCartRequest {
  userId: number;
  productId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface CheckoutResponse {
  orderId: number;
  status: string;
  totalAmount: number;
}
