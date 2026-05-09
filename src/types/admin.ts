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
  mustChangePassword: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminOrderSummary {
  id: number;
  orderDate: string;
  dailyOrderNumber: number;
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
  orderDate: string;
  dailyOrderNumber: number;
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

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  isAvailable: boolean;
}

export interface CategoryInput {
  name: string;
  displayOrder: number;
}
