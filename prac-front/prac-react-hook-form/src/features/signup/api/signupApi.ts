import type { SignupValues } from "@/src/features/signup/model/signupSchema";

export type SignupSubmission = {
  id: number;
  email: string;
  username: string;
  createdAt: string;
};

type FieldErrors = Partial<Record<keyof SignupValues, string[] | undefined>>;

export class SignupApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
  }
}

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new SignupApiError(body.message ?? "요청을 처리하지 못했습니다.", response.status, body.fieldErrors);
  }

  return body as T;
}

export const signupKeys = {
  all: ["signup"] as const,
  list: () => [...signupKeys.all, "list"] as const,
};

export const signupApi = {
  checkEmail: (email: string) =>
    request<{ available: boolean }>(`/api/signup/check-email?email=${encodeURIComponent(email)}`),
  create: (values: SignupValues) =>
    request<{ submission: SignupSubmission }>("/api/signup", {
      method: "POST",
      body: JSON.stringify(values),
    }),
  list: () => request<{ submissions: SignupSubmission[] }>("/api/signup"),
};
