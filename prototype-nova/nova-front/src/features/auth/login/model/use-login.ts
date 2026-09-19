"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "../api/login";
import { useAuthStore } from "./auth-store";

export function useLogin() {
  const signIn = useAuthStore((state) => state.signIn);

  return useMutation({
    mutationFn: login,
    // 서버 인증이 성공한 경우에만 전역 인증 상태와 탭 세션을 갱신한다.
    onSuccess: signIn,
  });
}
