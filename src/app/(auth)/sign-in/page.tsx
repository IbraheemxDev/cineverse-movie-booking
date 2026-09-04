"use client";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CinematicAuthShell, {
  TicketDivider,
  GoogleIcon,
  FieldLabel,
  inputClass,
} from "@/components/auth/CinematicAuthShell";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Something went wrong");
          setLoading(false);
        },
      }
    );
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <CinematicAuthShell title="Welcome back" subtitle="Sign in to grab your next seat.">
      {error && (
        <div className="mb-4 sm:mb-5 p-3 text-xs sm:text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg break-words">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="flex flex-col gap-3.5 sm:gap-4 w-full">
        <div className="w-full">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${inputClass} text-base sm:text-sm w-full py-2.5 sm:py-2 px-3.5 rounded-lg transition`}
          />
        </div>

        <div className="w-full">
          <FieldLabel>Password</FieldLabel>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputClass} text-base sm:text-sm w-full py-2.5 sm:py-2 px-3.5 rounded-lg transition`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 sm:mt-1 py-3 sm:py-2.5 text-sm sm:text-base bg-primary hover:bg-primary-dull active:scale-[0.99] transition-all font-medium rounded-lg text-white cursor-pointer disabled:opacity-50 touch-manipulation"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <TicketDivider />

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full py-3 sm:py-2.5 text-sm sm:text-base bg-[#1C1920] hover:bg-[#242029] active:scale-[0.99] border border-white/10 transition-all font-medium rounded-lg text-[#F3EFE9] flex items-center justify-center gap-2.5 cursor-pointer touch-manipulation"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <p className="mt-5 sm:mt-7 text-center text-xs sm:text-sm text-[#948C99]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:underline font-medium p-1">
          Sign up
        </Link>
      </p>
    </CinematicAuthShell>
  );
}