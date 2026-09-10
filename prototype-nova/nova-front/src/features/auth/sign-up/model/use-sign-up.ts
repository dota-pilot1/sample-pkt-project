"use client";

import { useMutation } from "@tanstack/react-query";
import { signUp } from "../api/sign-up";

export function useSignUp() {
  return useMutation({ mutationFn: signUp });
}
