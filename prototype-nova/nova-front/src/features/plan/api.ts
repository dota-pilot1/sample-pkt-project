export const RATE_PLAN_STATUSES = ["DRAFT", "ACTIVE", "SUSPENDED", "TERMINATED"] as const;
export type RatePlanSalesStatus = (typeof RATE_PLAN_STATUSES)[number];

export const RATE_PLAN_SORT_FIELDS = ["ratePlanCode", "name", "monthlyFee", "updatedAt"] as const;
export type RatePlanSortField = (typeof RATE_PLAN_SORT_FIELDS)[number];
export type RatePlanSortDirection = "asc" | "desc";

export type RatePlanListQuery = {
  keyword?: string;
  categoryCode?: string;
  status?: RatePlanSalesStatus;
  page?: number;
  size?: number;
  sort?: RatePlanSortField;
  direction?: RatePlanSortDirection;
};

export type RatePlanSummary = {
  id: number;
  ratePlanCode: string;
  name: string;
  categoryCode: string;
  categoryName: string;
  monthlyFee: number;
  salesStatus: RatePlanSalesStatus;
  updatedAt: string;
};

export type RatePlanPage = {
  items: RatePlanSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export function buildRatePlanListQuery(query: RatePlanListQuery = {}) {
  const params = new URLSearchParams();
  if (query.keyword?.trim()) params.set("keyword", query.keyword.trim());
  if (query.categoryCode?.trim()) params.set("categoryCode", query.categoryCode.trim());
  if (query.status) params.set("status", query.status);
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.size !== undefined) params.set("size", String(query.size));
  if (query.sort) params.set("sort", query.sort);
  if (query.direction) params.set("direction", query.direction);
  return params.toString();
}

import { apiRequest } from "@/shared/api/client";

/** 기존 생성 API가 받는 초안 입력 계약이다. 날짜는 offset을 포함해 전송한다. */
export type CreateRatePlanRequest = {
  ratePlanCode: string;
  name: string;
  categoryCode: string;
  monthlyFee: number;
  saleStartAt: string;
  description: string;
};

export type RatePlanCategory = { id: number; code: string; name: string; sortOrder: number };
export type CreatedRatePlan = Omit<CreateRatePlanRequest, "description"> & { id: number; salesStatus: RatePlanSalesStatus };

export const ratePlanApi = {
  findCategories: () => apiRequest<RatePlanCategory[]>("/api/plan-categories"),
  create: (body: CreateRatePlanRequest) =>
    apiRequest<CreatedRatePlan>("/api/plans", { method: "POST", body }),
  findPage: (query: RatePlanListQuery = {}) =>
    apiRequest<RatePlanPage>(`/api/plans?${buildRatePlanListQuery(query)}`),
};
