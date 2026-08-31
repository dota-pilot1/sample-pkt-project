"use client";

import { useTranslation } from "../../../node_modules/react-i18next";
import { SignupForm } from "@/features/auth/signup/SignupForm";
import { AuthLayout } from "@/shared/ui/AuthLayout";

export default function RegisterPage() {
  const { t } = useTranslation("auth");
  return (
    <AuthLayout title={t("signUpTitle")} subtitle={t("signUpSubtitle")}>
      <SignupForm />
    </AuthLayout>
  );
}
