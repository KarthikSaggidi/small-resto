"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/super-admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      router.refresh();
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f5f3] px-5 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#d9d9d5]/50 blur-3xl" />

        <div className="absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full bg-[#e6e6e1]/70 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="rounded-[30px] border border-white/90 bg-white/90 p-8 shadow-[0_35px_100px_rgba(0,0,0,0.10)] backdrop-blur-2xl sm:p-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#111111] text-white shadow-sm">
              <span className="text-lg font-bold tracking-tight">
                D
              </span>
            </div>

            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#171717]">
                DropXcorp
              </p>

              <p className="mt-0.5 text-[11px] text-[#8a8a86]">
                Super Admin Console
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mt-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeeeb] text-[#30302d]">
              <LockKeyhole size={20} />
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#777772]">
              Restricted Access
            </p>

            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-[#171717]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#777772]">
              Sign in to manage your DropXcorp SaaS platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="super-admin-email"
                className="mb-2 block text-xs font-semibold text-[#393936]"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999994]"
                />

                <input
                  id="super-admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@dropxcorp.in"
                  autoComplete="username"
                  required
                  className="h-12 w-full rounded-2xl border border-[#deded9] bg-[#fafaf8] pl-11 pr-4 text-sm text-[#20201e] outline-none transition placeholder:text-[#aaa9a4] focus:border-[#555550] focus:bg-white focus:ring-4 focus:ring-[#111111]/5"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="super-admin-password"
                className="mb-2 block text-xs font-semibold text-[#393936]"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999994]"
                />

                <input
                  id="super-admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-2xl border border-[#deded9] bg-[#fafaf8] pl-11 pr-12 text-sm text-[#20201e] outline-none transition placeholder:text-[#aaa9a4] focus:border-[#555550] focus:bg-white focus:ring-4 focus:ring-[#111111]/5"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#898984] transition hover:bg-[#eeeeeb] hover:text-[#333330]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] text-sm font-semibold text-white transition hover:bg-[#292927] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to DropXcorp

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          {/* Security */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-[#eeeeea] pt-5 text-[11px] text-[#969691]">
            <ShieldCheck size={14} />
            Secure Super Admin access
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-[#999994]">
          DropXcorp SaaS Platform
        </p>
      </div>
    </main>
  );
}
