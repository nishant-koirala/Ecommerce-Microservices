export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  imageUrl: string | null;
  category: CategoryResponse;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  sku: string;
  imageUrl?: string | null;
  categoryId: number;
}
