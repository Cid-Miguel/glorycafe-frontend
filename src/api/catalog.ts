import { apiClient } from "./client";
import type { Category, Product } from "../types/catalog";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/api/categories");
  return data;
}

export async function getProducts(categoryId?: number): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/api/products", {
    params: categoryId ? { categoryId } : undefined,
  });
  return data;
}
