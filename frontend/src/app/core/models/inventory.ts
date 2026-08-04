export interface InventoryResponse {
  id: number;
  productId: number;
  quantityAvailable: number;
  quantityReserved: number;
}

export interface CreateInventoryRequest {
  productId: number;
  quantityAvailable: number;
}
