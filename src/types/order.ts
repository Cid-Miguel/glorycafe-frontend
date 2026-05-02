export interface CreateOrderRequest {
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  customerEmail?: string;
  estimatedPickupTime: string;
  items: { productId: number; quantity: number }[];
}

export interface CreateOrderResponse {
  orderId: number;
  orderDate: string;
  dailyOrderNumber: number;
  totalAmount: number;
}

export interface ApiValidationProblem {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
