import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentSession, login, logout, register } from "../api/session-api";

export const sessionQueryKey = ["session", "me"] as const;

/** HttpOnly 쿠키를 서버에서 확인해 현재 사용자 상태를 제공한다. */
export function useSessionQuery() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchCurrentSession,
    retry: false,
    staleTime: 30_000,
  });
}

/** 로그인 성공 응답을 세션 캐시에 즉시 반영한다. */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session);
    },
  });
}

/** 회원가입 API가 발급한 사용자와 세션을 로그인과 같은 Query 캐시에 반영한다. */
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session);
    },
  });
}

/** 로그아웃 뒤 인증 사용자와 보호된 설비 캐시를 함께 비운다. */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryKey, { user: null });
      queryClient.removeQueries({ queryKey: ["equipment"] });
    },
  });
}
