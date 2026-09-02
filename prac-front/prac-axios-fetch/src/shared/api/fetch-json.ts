import { ApiError } from "./api-error";

interface FetchJsonOptions extends RequestInit {
  fallbackMessage: string;
  fallbackCode: string;
}

interface ErrorBody {
  code?: string;
  message?: string;
}

/** JSON 요청의 헤더·본문 파싱·response.ok 검사를 한곳에서 처리하는 Level 2 공통 fetch 래퍼다. */
export async function fetchJson<T>(url: string, options: FetchJsonOptions): Promise<T> {
  const { fallbackMessage, fallbackCode, headers, ...requestInit } = options;
  const response = await fetch(url, {
    ...requestInit,
    headers: requestInit.body
      ? { "content-type": "application/json", ...headers }
      : headers,
  });

  const body = (await response.json().catch(() => null)) as (T & ErrorBody) | null;
  if (!response.ok) {
    throw new ApiError(
      body?.message ?? fallbackMessage,
      response.status,
      body?.code ?? fallbackCode,
    );
  }
  if (body === null) {
    throw new ApiError("JSON 응답 본문이 비어 있습니다.", response.status, "EMPTY_JSON_RESPONSE");
  }
  return body;
}
