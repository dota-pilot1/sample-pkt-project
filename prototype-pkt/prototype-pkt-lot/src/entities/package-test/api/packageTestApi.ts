import { api } from "@/shared/api/axios";
import type { CreateTestConditionRequest, CreateTestSpecRequest, TestCondition, TestSpec } from "../model/types";

export const packageTestApi = {
  getSpecs: () => api.get<TestSpec[]>("/api/package-test/specs").then((response) => response.data),
  createSpec: (request: CreateTestSpecRequest) => api.post<TestSpec>("/api/package-test/specs", request).then((response) => response.data),
  addCondition: (specId: number, request: CreateTestConditionRequest) => api.post<TestCondition>(`/api/package-test/specs/${specId}/conditions`, request).then((response) => response.data),
  deleteCondition: (conditionId: number) => api.delete(`/api/package-test/specs/conditions/${conditionId}`),
};
