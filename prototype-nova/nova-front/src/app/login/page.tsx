import { LoginForm } from "@/features/auth/login/ui/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--soft)] px-5 py-8">
      <LoginForm />
    </main>
  );
}
