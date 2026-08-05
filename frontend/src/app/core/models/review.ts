export interface ReviewResponse {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title: string;
  comment: string;
  reviewerName: string;
  createdAt: string;
}

export interface ReviewRequest {
  userId: number;
  productId: number;
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewSummary {
  productId: number;
  avgRating: number;
  reviewCount: number;
}
