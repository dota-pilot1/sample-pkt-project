import { SignUpForm } from "@/features/auth/sign-up/ui/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--soft)] px-5 py-8">
      <SignUpForm />
    </main>
  );
}
