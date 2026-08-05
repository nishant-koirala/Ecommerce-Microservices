export type NotificationType =
  | 'PAYMENT_SUCCESS'
  | 'ORDER_CONFIRMED'
  | 'PAYMENT_REFUNDED'
  | 'ORDER_CANCELLED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED';

export interface NotificationResponse {
  id: number;
  userId: number;
  orderId: number | null;
  paymentId: number | null;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}
