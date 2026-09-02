import { api } from "@/shared/api/axios";
import type { CreateProductInput, Product, ProductInput } from "../model/types";

export const productApi = {
  getProducts: () => api.get<Product[]>("/api/products").then((response) => response.data),
  createProduct: (request: CreateProductInput) => api.post<Product>("/api/products", request).then((response) => response.data),
  updateProduct: (productId: number, request: ProductInput) => api.put<Product>(`/api/products/${productId}`, request).then((response) => response.data),
};
