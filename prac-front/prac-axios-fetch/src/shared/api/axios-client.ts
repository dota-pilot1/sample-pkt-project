import axios from "axios";
import { ApiError } from "./api-error";

interface AxiosErrorBody {
  code?: string;
  message?: string;
}

/**
 * fetch와 달리 baseURL·공통 헤더·timeout을 인스턴스 한 번에 설정한다.
 * 이후 모든 Level 3 API 함수는 이 설정을 자동으로 공유한다.
 */
export const axiosClient = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
  timeout: 8_000,
});

// fetch는 response.ok를 직접 검사하지만 Axios는 4xx·5xx를 자동 reject하므로 인터셉터 한곳에서 처리한다.
axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!axios.isAxiosError<AxiosErrorBody>(error)) return Promise.reject(error);

    // 서버 응답이 없는 네트워크 오류는 status 0으로 구분한다.
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    return Promise.reject(
      new ApiError(
        body?.message ?? (status === 0 ? "서버에 연결하지 못했습니다." : "Axios 요청에 실패했습니다."),
        status,
        body?.code ?? (status === 0 ? "AXIOS_NETWORK_ERROR" : "AXIOS_REQUEST_FAILED"),
      ),
    );
  },
);
