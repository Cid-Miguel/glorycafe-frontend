import { apiClient } from "./client";
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  LoginResponse,
  OrderStatus,
} from "../types/admin";

export async function adminLogin(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    "/api/admin/auth/login",
    { email, password },
  );
  return data;
}

export async function getAdminOrders(
  status?: OrderStatus,
): Promise<AdminOrderSummary[]> {
  const { data } = await apiClient.get<AdminOrderSummary[]>(
    "/api/admin/orders",
    { params: status ? { status } : undefined },
  );
  return data;
}

export async function getAdminOrder(id: number): Promise<AdminOrderDetail> {
  const { data } = await apiClient.get<AdminOrderDetail>(
    `/api/admin/orders/${id}`,
  );
  return data;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<void> {
  await apiClient.patch(`/api/admin/orders/${id}/status`, { status });
}
