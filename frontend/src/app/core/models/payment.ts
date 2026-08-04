export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface CreatePaymentRequest {
  orderId: number;
  userId: number;
  amount: number;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  userId: number;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}
