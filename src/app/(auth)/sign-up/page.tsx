"use client";
import { useState } from "react";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CinematicAuthShell, {
  TicketDivider,
  GoogleIcon,
  FieldLabel,
  inputClass,
} from "@/components/auth/CinematicAuthShell";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await signUp.email(
      { email, password, name },
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
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <CinematicAuthShell title="Create your account" subtitle="Join CineVerse and never miss opening night.">
      {error && (
        <div className="mb-5 p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <input
            type="text"
            placeholder="Muhammad Ibraheem"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

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
          {loading ? "Creating account..." : "Create account"}
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
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </CinematicAuthShell>
  );
}