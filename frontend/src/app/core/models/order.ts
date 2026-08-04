export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'SHIPPED'
  | 'DELIVERED';

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: number;
  items: CreateOrderItemRequest[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  paymentId: number | null;
  createdAt: string;
  items: OrderItemResponse[];
}
