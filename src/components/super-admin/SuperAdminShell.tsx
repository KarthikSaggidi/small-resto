"use client";

import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    label: "Dashboard",
    href: "/super-admin",
    icon: LayoutDashboard,
  },
  {
    label: "Tenants",
    href: "/super-admin/tenants",
    icon: Building2,
  },
  {
    label: "Subscriptions",
    href: "/super-admin/subscriptions",
    icon: Zap,
  },
  {
    label: "Plans",
    href: "/super-admin/plans",
    icon: Sparkles,
  },
  {
    label: "Users",
    href: "/super-admin/users",
    icon: Users,
  },
  {
    label: "Payments",
    href: "/super-admin/payments",
    icon: CreditCard,
  },
  {
    label: "Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Support",
    href: "/super-admin/support",
    icon: ShieldCheck,
  },
  {
    label: "Settings",
    href: "/super-admin/settings",
    icon: Settings,
  },
];

export default function SuperAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await fetch("/api/super-admin/logout", {
        method: "POST",
      });

      router.push("/super-admin");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#171717]">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#e5e5e0] bg-white transition-transform duration-200",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-[#eeeeea] px-5">
          <Link
            href="/super-admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] text-white">
              <span className="text-base font-bold">D</span>
            </div>

            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em]">
                DropXcorp
              </p>

              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#999994]">
                Super Admin
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#777772] hover:bg-[#f1f1ee] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa9a4]">
            Platform
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/super-admin"
                  ? pathname === "/super-admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                    active
  ? "bg-[#111111] !text-white shadow-sm"
  : "text-[#676762] hover:bg-[#f3f3f0] hover:text-[#171717]"
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account */}
        <div className="border-t border-[#eeeeea] p-3">
          <div className="rounded-2xl bg-[#f7f7f4] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#deded9] text-xs font-bold text-[#333330]">
                SA
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#282825]">
                  Super Admin
                </p>

                <p className="truncate text-[10px] text-[#999994]">
                  admin@dropxcorp.in
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#e3e3de] bg-white text-xs font-semibold text-[#666661] transition hover:bg-[#eeeeeb] hover:text-[#222220] disabled:opacity-50"
            >
              <LogOut size={14} />
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-[260px]">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-[#e5e5e0] bg-white/90 px-5 backdrop-blur-xl lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5e5e0] text-[#555550] lg:hidden"
          >
            <Menu size={19} />
          </button>

          <div className="flex-1">
            <p className="text-xs font-medium text-[#999994]">
              DropXcorp Platform
            </p>

            <h2 className="mt-0.5 text-sm font-semibold text-[#282825]">
              Super Admin Console
            </h2>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-[#e5e5e0] bg-[#fafaf8] px-3 py-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[11px] font-medium text-[#666661]">
              Platform Online
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="min-h-[calc(100vh-76px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
