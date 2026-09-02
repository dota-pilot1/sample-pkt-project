import { api } from "@/shared/api/axios";
import type { Lot, LotStatus } from "../model/types";

export type LotPage = {
  content: Lot[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LotSearchParams = {
  page: number;
  size: number;
  keyword: string;
  status: LotStatus | "ALL";
  productCode: string;
  process: string;
};

/** 생산을 시작하기 전 LOT 등록 화면에서 보내는 기본 정보다. */
export type CreateLotRequest = {
  workOrderId: number;
  productId: number;
  processId?: number;
  quantity: number;
};

/** 기존 LOT 수정은 연결된 작업지시를 유지하므로 workOrderId를 생략할 수 있다. */
export type UpdateLotRequest = Omit<CreateLotRequest, "workOrderId"> & { workOrderId?: number };

export type LotRegistrationOptions = {
  products: Array<{ id: number; productCode: string; productName: string }>;
};

export type LotRegistrationProcessOption = {
  processId: number;
  processCode: string;
  processName: string;
  sequenceNo: number;
};

/** 서버 LOT 데이터와 항상 일치하는 목록 필터의 선택지다. */
export type LotFilterOptions = {
  productCodes: string[];
  processes: string[];
  testers: string[];
  hasUnassignedTester: boolean;
};

/** PKT LOT 목록을 서버 정렬·필터 가능한 페이지 형태로 가져온다. */
export const lotApi = {
  create: (request: CreateLotRequest) =>
    api.post<Lot>("/api/lots", request).then((response) => response.data),

  update: (lotId: number, request: UpdateLotRequest) =>
    api.put<Lot>(`/api/lots/${lotId}`, request).then((response) => response.data),

  delete: (lotId: number) => api.delete(`/api/lots/${lotId}`),

  getRegistrationOptions: () =>
    api
      .get<LotRegistrationOptions>("/api/lots/registration-options")
      .then((response) => response.data),

  getRegistrationProcessOptions: (productId: string) =>
    api
      .get<LotRegistrationProcessOption[]>(
        `/api/lots/registration-options/products/${productId}/processes`,
      )
      .then((response) => response.data),

  getFilterOptions: () =>
    api
      .get<LotFilterOptions>("/api/lots/filter-options")
      .then((response) => response.data),

  /** 빈 필터는 전송하지 않아 서버가 전체 조건으로 조회하게 한다. */
  getPage: ({
    page,
    size,
    keyword,
    status,
    productCode,
    process,
  }: LotSearchParams) =>
    api
      .get<LotPage>("/api/lots", {
        params: {
          page,
          size,
          sort: "updatedAt",
          direction: "desc",
          keyword: keyword || undefined,
          status: status === "ALL" ? undefined : status,
          productCode: productCode || undefined,
          process: process || undefined,
        },
      })
      .then((response) => response.data),
};
