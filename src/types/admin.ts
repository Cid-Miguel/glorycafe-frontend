export type OrderStatus =
  | "Pending"
  | "Paid"
  | "Preparing"
  | "Ready"
  | "Completed";

export interface LoginResponse {
  accessToken: string;
  expiresAtUtc: string;
  displayName: string;
}

export interface AdminOrderSummary {
  id: number;
  customerFirstName: string;
  customerLastName: string;
  estimatedPickupTime: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrderDetail {
  id: number;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  estimatedPickupTime: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items: AdminOrderItem[];
}
