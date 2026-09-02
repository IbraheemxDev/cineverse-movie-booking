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
        <div className="mb-5 p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <FieldLabel>Password</FieldLabel>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-2.5 bg-primary hover:bg-primary-dull transition-colors font-medium rounded-lg text-white cursor-pointer disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <TicketDivider />

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full py-2.5 bg-[#1C1920] hover:bg-[#242029] border border-white/10 transition-colors font-medium rounded-lg text-[#F3EFE9] flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <p className="mt-7 text-center text-sm text-[#948C99]">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </CinematicAuthShell>
  );
}