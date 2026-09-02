"use client";
import { Bebas_Neue, Inter } from "next/font/google";
import Link from "next/link";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

const VOID = "#0A090C";
const PANEL = "#170F17";

function SprocketStrip() {
  return (
    <div
      aria-hidden
      className="h-4 w-full"
      style={{
        backgroundImage: `radial-gradient(circle at 10px 8px, ${VOID} 4px, transparent 4.5px)`,
        backgroundSize: "26px 16px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

export default function CinematicAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${bebas.variable} ${inter.variable} min-h-screen flex font-[family-name:var(--font-body)] text-[#F3EFE9]`}
      style={{ backgroundColor: VOID }}
    >
      <style>{`
        @keyframes authCardIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .auth-card-enter { animation: authCardIn 0.5s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .auth-card-enter { animation: none; }
        }
        /* Kill Chrome's light-blue autofill background, keep it dark */
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #1C1920 inset;
          -webkit-text-fill-color: #F3EFE9;
          caret-color: #F3EFE9;
          transition: background-color 999999s ease-in-out 0s;
        }
      `}</style>

      {/* Left panel — cinema atmosphere, hidden on small screens */}
      <div
        className="hidden md:flex md:w-[42%] lg:w-[38%] flex-col relative overflow-hidden"
        style={{ backgroundColor: PANEL }}
      >
        <SprocketStrip />

        <div className="flex-1 flex flex-col justify-center px-10 lg:px-14 relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-10 w-96 h-96 rounded-full blur-[110px] opacity-30"
            style={{ backgroundColor: "#D9A54A" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #F3EFE9 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative">
            <div className="w-10 h-[3px] mb-6" style={{ backgroundColor: "#D9A54A" }} />
            <h1 className="font-[family-name:var(--font-display)] text-6xl lg:text-7xl tracking-wide leading-none">
              CINEVERSE
            </h1>
            <p className="mt-5 text-[#B8AFC0] text-base leading-relaxed max-w-[30ch]">
              The lights dim. The story begins.
            </p>
          </div>
        </div>

        <SprocketStrip />
      </div>

      {/* Right panel — the actual form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* soft warm bleed behind the card, ties the two panels together */}
        <div
          aria-hidden
          className="pointer-events-none absolute w-[520px] h-[520px] rounded-full blur-[130px] opacity-[0.08]"
          style={{ backgroundColor: "#D9A54A" }}
        />

        <div className="w-full max-w-md relative">
          <div className="md:hidden mb-8 flex items-center gap-3">
            <div className="w-8 h-[3px]" style={{ backgroundColor: "#D9A54A" }} />
            <span className="font-[family-name:var(--font-display)] text-2xl tracking-wide">
              CINEVERSE
            </span>
          </div>

          <div
            className="auth-card-enter relative rounded-2xl border border-white/10 p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden"
            style={{ backgroundColor: "#131116" }}
          >
            {/* top accent thread, warm-to-primary */}
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "linear-gradient(90deg, #D9A54A, #E5304F)" }}
            />

            <h2 className="text-2xl font-semibold mb-1.5 mt-1">{title}</h2>
            <p className="text-[#948C99] text-sm mb-7">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketDivider() {
  return (
    <div className="flex items-center gap-3 my-7">
      <div className="flex-1 border-t border-dashed border-white/15" />
      <span className="text-xs text-[#77707F]">or continue with</span>
      <div className="flex-1 border-t border-dashed border-white/15" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.96H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-[#B8AFC0] mb-1.5">{children}</label>;
}

export const inputClass =
  "auth-input w-full px-4 py-2.5 bg-[#1C1920] border border-white/10 rounded-lg text-[#F3EFE9] placeholder:text-[#5E5768] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors";