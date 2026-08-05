export interface WishlistItemResponse {
  id: number;
  userId: number;
  productId: number;
  addedAt: string;
}

export interface AddToWishlistRequest {
  userId: number;
  productId: number;
}