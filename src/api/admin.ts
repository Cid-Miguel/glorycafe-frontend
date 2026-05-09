import { apiClient } from "./client";
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  CategoryInput,
  ChangePasswordRequest,
  LoginResponse,
  OrderStatus,
  ProductInput,
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

export async function changeAdminPassword(
  request: ChangePasswordRequest,
): Promise<void> {
  await apiClient.post("/api/admin/auth/change-password", request);
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

// ── Products ───────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput): Promise<number> {
  const { data } = await apiClient.post<{ id: number }>(
    "/api/admin/products",
    input,
  );
  return data.id;
}

export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<void> {
  await apiClient.put(`/api/admin/products/${id}`, input);
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/products/${id}`);
}

export async function uploadProductImage(
  id: number,
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<{ imageUrl: string }>(
    `/api/admin/products/${id}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.imageUrl;
}

export async function deleteProductImage(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/products/${id}/image`);
}

// ── Categories ─────────────────────────────────────────────────────────

export async function createCategory(input: CategoryInput): Promise<number> {
  const { data } = await apiClient.post<{ id: number }>(
    "/api/admin/categories",
    input,
  );
  return data.id;
}

export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<void> {
  await apiClient.put(`/api/admin/categories/${id}`, input);
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/categories/${id}`);
}
