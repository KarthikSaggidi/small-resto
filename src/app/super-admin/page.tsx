import {
  ArrowUpRight,
  Building2,
  CreditCard,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const [
    totalTenants,
    activeTenants,
    trialTenants,
    totalUsers,
    activeSubscriptions,
    successfulPayments,
    recentTenants,
    recentPayments,
  ] = await Promise.all([
    prisma.tenant.count(),

    prisma.tenant.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.tenant.count({
      where: {
        status: "TRIAL",
      },
    }),

    prisma.user.count(),

    prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.payment.findMany({
      where: {
        status: "SUCCESS",
      },
      select: {
        amount: true,
      },
    }),

    prisma.tenant.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        businessType: true,
        createdAt: true,
      },
    }),

    prisma.payment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        tenant: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const totalRevenue = successfulPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);

  return (
    <main className="p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999994]">
            DropXcorp
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[#171717]">
                Super Admin Dashboard
              </h1>

              <p className="mt-2 text-sm text-[#777772]">
                Overview of your entire DropXcorp SaaS platform.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#e5e5e0] bg-white px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-[#666661]">
                Live platform data
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <StatCard
            label="Total Tenants"
            value={totalTenants.toString()}
            description={`${activeTenants} active`}
            icon={Building2}
          />

          <StatCard
            label="Trial Tenants"
            value={trialTenants.toString()}
            description="Currently on trial"
            icon={Zap}
          />

          <StatCard
            label="Users"
            value={totalUsers.toString()}
            description="Platform users"
            icon={Users}
          />

          <StatCard
            label="Subscriptions"
            value={activeSubscriptions.toString()}
            description="Active subscriptions"
            icon={CreditCard}
          />

          <StatCard
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            description="Successful payments"
            icon={Wallet}
          />

        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* Recent Tenants */}
          <section className="rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">
              <div>
                <h2 className="text-sm font-semibold text-[#222220]">
                  Recent Tenants
                </h2>

                <p className="mt-1 text-xs text-[#999994]">
                  Latest businesses added to your platform
                </p>
              </div>

              <a
                href="/super-admin/tenants"
                className="flex items-center gap-1 text-xs font-semibold text-[#555550] hover:text-[#111111]"
              >
                View all
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="divide-y divide-[#eeeeea]">

              {recentTenants.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No tenants yet"
                  description="Create your first tenant to start building the platform."
                />
              ) : (
                recentTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eeeeeb] text-xs font-bold text-[#555550]">
                        {tenant.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#282825]">
                          {tenant.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-[#999994]">
                          {tenant.businessType || "Business"} ·{" "}
                          {tenant.slug}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <StatusBadge status={tenant.status} />

                      <p className="mt-1 text-[10px] text-[#aaa9a4]">
                        {formatDate(tenant.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}

            </div>
          </section>

          {/* Subscription Overview */}
          <section className="rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">

            <div className="border-b border-[#eeeeea] px-6 py-5">
              <h2 className="text-sm font-semibold text-[#222220]">
                Platform Overview
              </h2>

              <p className="mt-1 text-xs text-[#999994]">
                Current tenant distribution
              </p>
            </div>

            <div className="space-y-6 p-6">

              <OverviewRow
                label="Active tenants"
                value={activeTenants}
                total={Math.max(totalTenants, 1)}
              />

              <OverviewRow
                label="Trial tenants"
                value={trialTenants}
                total={Math.max(totalTenants, 1)}
              />

              <OverviewRow
                label="Active subscriptions"
                value={activeSubscriptions}
                total={Math.max(totalTenants, 1)}
              />

              <div className="rounded-2xl bg-[#f7f7f4] p-4">
                <p className="text-xs font-medium text-[#777772]">
                  Total platform revenue
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">
                  {formatCurrency(totalRevenue)}
                </p>

                <p className="mt-1 text-[11px] text-[#999994]">
                  From successful payments
                </p>
              </div>

            </div>
          </section>
        </div>

        {/* Payments */}
        <section className="mt-6 rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-[#222220]">
                Recent Payments
              </h2>

              <p className="mt-1 text-xs text-[#999994]">
                Latest subscription and platform payments
              </p>
            </div>

            <a
              href="/super-admin/payments"
              className="flex items-center gap-1 text-xs font-semibold text-[#555550] hover:text-[#111111]"
            >
              View all
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="divide-y divide-[#eeeeea]">

            {recentPayments.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No payments yet"
                description="Payments will appear here once tenants subscribe."
              />
            ) : (
              recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#282825]">
                      {payment.tenant.name}
                    </p>

                    <p className="mt-1 text-xs text-[#999994]">
                      {payment.paymentMethod || "Payment"} ·{" "}
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#222220]">
                      {payment.currency}{" "}
                      {Number(payment.amount).toLocaleString("en-IN")}
                    </p>

                    <p
                      className={[
                        "mt-1 text-[10px] font-semibold uppercase tracking-wide",
                        payment.status === "SUCCESS"
                          ? "text-green-600"
                          : payment.status === "FAILED"
                            ? "text-red-600"
                            : "text-[#999994]",
                      ].join(" ")}
                    >
                      {payment.status}
                    </p>
                  </div>
                </div>
              ))
            )}

          </div>
        </section>

      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Components
───────────────────────────────────────────── */

function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}) {
  return (
    <div className="rounded-3xl border border-[#e5e5e0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f0ed] text-[#555550]">
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-5 text-xs font-medium text-[#999994]">
        {label}
      </p>

      <p className="mt-1 truncate text-[25px] font-semibold tracking-[-0.045em] text-[#171717]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-[#999994]">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    TRIAL: "bg-blue-50 text-blue-700",
    SUSPENDED: "bg-red-50 text-red-700",
    INACTIVE: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold",
        styles[status] || "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function OverviewRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = Math.min(
    100,
    Math.round((value / total) * 100)
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#666661]">
          {label}
        </span>

        <span className="text-xs font-semibold text-[#282825]">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eeeeea]">
        <div
          className="h-full rounded-full bg-[#222220] transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0f0ed] text-[#777772]">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <p className="mt-4 text-sm font-semibold text-[#444440]">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-[#999994]">
        {description}
      </p>
    </div>
  );
}