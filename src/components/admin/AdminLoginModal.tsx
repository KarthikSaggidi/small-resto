"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Store,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginModal() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
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
        setError(
          data.message || "Invalid email or password."
        );
        return;
      }

      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3eee8] px-5 py-10">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#dcc8b7]/40 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-[#e5d5c6]/60 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" />
      </div>

      {/* LOGIN MODAL */}
      <div className="relative z-10 w-full max-w-[430px]">

        <div className="rounded-[28px] border border-white/80 bg-white/90 p-7 shadow-[0_30px_100px_rgba(55,39,30,0.16)] backdrop-blur-xl sm:p-9">

          {/* BRAND */}
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#382820] text-white shadow-sm">
              <Store size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[-0.01em] text-[#302721]">
                Thirumala Bakery
              </p>

              <p className="mt-0.5 text-[11px] text-[#97867b]">
                Admin Console
              </p>
            </div>

          </div>

          {/* HEADER */}
          <div className="mt-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eee2d6] text-[#79533f]">
              <LockKeyhole size={20} />
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9a7057]">
              Secure Access
            </p>

            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.045em] text-[#302721]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#89776c]">
              Sign in to access your bakery management
              dashboard.
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >

            {/* EMAIL */}
            <div>

              <label
                htmlFor="admin-email"
                className="mb-2 block text-xs font-semibold text-[#514139]"
              >
                Email address
              </label>

              <div className="relative">

                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a59184]"
                />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@thirumalabakery.com"
                  autoComplete="username"
                  required
                  className="h-12 w-full rounded-2xl border border-[#ddd2c9] bg-[#fcfaf8] pl-11 pr-4 text-sm text-[#302721] outline-none transition placeholder:text-[#b2a39a] focus:border-[#93654c] focus:bg-white focus:ring-4 focus:ring-[#93654c]/10"
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div>

              <label
                htmlFor="admin-password"
                className="mb-2 block text-xs font-semibold text-[#514139]"
              >
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a59184]"
                />

                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-12 w-full rounded-2xl border border-[#ddd2c9] bg-[#fcfaf8] pl-11 pr-12 text-sm text-[#302721] outline-none transition placeholder:text-[#b2a39a] focus:border-[#93654c] focus:bg-white focus:ring-4 focus:ring-[#93654c]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#947e72] transition hover:bg-[#f3ece6] hover:text-[#604536]"
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

            {/* ERROR */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#382820] text-sm font-semibold text-white transition hover:bg-[#4b352b] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}

            </button>

          </form>

          {/* SECURITY NOTE */}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#eee5de] pt-5 text-[11px] text-[#9a8980]">
            <ShieldCheck size={14} />
            Secure administrator access
          </div>

        </div>

      </div>

    </main>
  );
}