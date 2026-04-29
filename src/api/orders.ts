import { apiClient } from "./client";
import type { CreateOrderRequest, CreateOrderResponse } from "../types/order";

export async function createOrder(
  request: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const { data } = await apiClient.post<CreateOrderResponse>(
    "/api/orders",
    request,
  );
  return data;
}
