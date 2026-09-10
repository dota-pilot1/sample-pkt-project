import axios, { type AxiosRequestConfig } from "axios";

export type ApiErrorResponse = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

/** 서버가 반환한 HTTP 오류를 화면과 feature가 공통으로 해석하는 형태다. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type JsonRequestOptions = Omit<AxiosRequestConfig, "data" | "headers" | "url"> & {
  body?: unknown;
  headers?: AxiosRequestConfig["headers"];
};

function getApiBaseUrl() {
  // 배포 환경별 공개 API 주소의 끝 슬래시를 제거해 요청 URL을 일관되게 만든다.
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null;
}

/** Axios 인스턴스는 HTTP 설정·응답 오류 변환만 담당하고 업무 규칙은 feature에 남긴다. */
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { Accept: "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorResponse>(error) || !error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const response = isApiErrorResponse(data) ? data : {};
    return Promise.reject(
      new ApiError(
        response.message ?? "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        status,
        response.code,
        response.fieldErrors ?? {},
      ),
    );
  },
);

/** JSON API 요청과 Spring Boot의 공통 오류 응답을 처리하는 Axios 경계다. */
export async function apiRequest<T>(
  path: string,
  options: JsonRequestOptions = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options;
  const response = await apiClient.request<T>({
    ...requestOptions,
    url: path,
    data: body,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  return response.data;
}
