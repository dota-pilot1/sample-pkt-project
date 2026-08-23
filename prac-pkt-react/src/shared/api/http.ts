export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
}

/** 인증이 끊겼을 때 던지는 오류. 화면마다 401을 따로 해석하지 않도록 타입으로 구분한다. */
export class UnauthorizedError extends Error {
  constructor(message = "로그인이 필요합니다.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

type ApiSession = {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
};

/**
 * shared 레이어가 features(auth)를 직접 import하지 않도록 세션 접근을 주입받는다.
 * AuthProvider가 마운트될 때 실제 구현을 등록한다.
 */
let session: ApiSession = { getAccessToken: () => null, onUnauthorized: () => undefined };

export function configureApiSession(next: ApiSession) {
  session = next;
}

/** 인증 헤더를 붙여 요청하고, 401이면 세션을 정리한 뒤 UnauthorizedError를 던진다. */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = session.getAccessToken() ?? import.meta.env.VITE_API_TOKEN;
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: { ...init?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });

  if (response.status === 401) {
    session.onUnauthorized();
    throw new UnauthorizedError();
  }

  return response;
}
