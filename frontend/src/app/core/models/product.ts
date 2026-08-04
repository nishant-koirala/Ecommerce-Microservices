export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
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
  category: CategoryResponse;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  sku: string;
  categoryId: number;
}
