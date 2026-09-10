"use client";

import { useMutation } from "@tanstack/react-query";
import { signUp } from "../api/sign-up";

export function useSignUp() {
  return useMutation({
    // HTTP 요청은 feature API에 두고, hook은 mutation 상태만 UI에 제공한다.
    mutationFn: signUp,
  });
}
