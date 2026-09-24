import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: {
      id,
    },
    include: {
      tenantUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      subscriptions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          plan: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },
    },
  });

  if (!tenant) {
    notFound();
  }

  const subscription = tenant.subscriptions[0];

  return (
    <main className="p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Back */}
        <Link
          href="/super-admin/tenants"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#777772] transition hover:text-[#171717]"
        >
          <ArrowLeft size={16} />
          Back to Tenants
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeeeb] text-sm font-bold text-[#555550]">
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-[30px] font-semibold tracking-[-0.045em] text-[#171717]">
                    {tenant.name}
                  </h1>

                  <StatusBadge status={tenant.status} />
                </div>

                <p className="mt-1 text-sm text-[#999994]">
                  {tenant.slug}
                  {tenant.businessType
                    ? ` · ${tenant.businessType}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="h-10 rounded-xl border border-[#deded9] bg-white px-4 text-sm font-semibold text-[#444440] transition hover:bg-[#fafaf8]"
          >
            Edit Tenant
          </button>
        </div>

        {/* Overview cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={<Building2 size={18} />}
            label="Business Type"
            value={tenant.businessType || "Not specified"}
          />

          <InfoCard
            icon={<Mail size={18} />}
            label="Business Email"
            value={tenant.email || "Not specified"}
          />

          <InfoCard
            icon={<Phone size={18} />}
            label="Business Phone"
            value={tenant.phone || "Not specified"}
          />

          <InfoCard
            icon={<ShieldCheck size={18} />}
            label="Subscription"
            value={subscription?.plan?.name || "No subscription"}
          />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {/* Users */}
          <section className="overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold text-[#282825]">
                  Tenant Users
                </h2>

                <p className="mt-1 text-xs text-[#999994]">
                  Users who can access this business.
                </p>
              </div>

              <div className="flex h-9 items-center gap-2 rounded-xl bg-[#f4f4f1] px-3 text-xs font-semibold text-[#666661]">
                <Users size={14} />
                {tenant.tenantUsers.length}
              </div>
            </div>

            {tenant.tenantUsers.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[#999994]">
                No users assigned to this tenant.
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeea]">
                {tenant.tenantUsers.map(({ user }) => (
                  <div
                    key={user.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eeeeeb] text-xs font-bold text-[#555550]">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#282825]">
                          {user.name}
                        </p>

                        <p className="mt-1 truncate text-xs text-[#999994]">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoleBadge role={user.role} />

                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600",
                        ].join(" ")}
                      >
                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Subscription */}
          <section className="overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">
            <div className="border-b border-[#eeeeea] px-6 py-5">
              <h2 className="text-base font-semibold text-[#282825]">
                Subscription
              </h2>

              <p className="mt-1 text-xs text-[#999994]">
                Current plan and billing information.
              </p>
            </div>

            {!subscription ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eeeeeb] text-[#666661]">
                  <ShieldCheck size={20} />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#444440]">
                  No subscription
                </p>

                <p className="mt-1 text-xs text-[#999994]">
                  This tenant has not been assigned a plan yet.
                </p>

                <button
                  type="button"
                  className="mt-5 h-10 rounded-xl bg-[#111111] px-4 text-xs font-semibold text-white transition hover:bg-[#292927]"
                >
                  Assign Plan
                </button>
              </div>
            ) : (
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
                    Current Plan
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#282825]">
                    {subscription.plan.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailItem
                    label="Status"
                    value={subscription.status}
                  />

                  <DetailItem
                    label="Billing"
                    value={subscription.billingInterval}
                  />

                  <DetailItem
                    label="Start Date"
                    value={formatDate(subscription.startDate)}
                  />

                  <DetailItem
                    label="End Date"
                    value={
                      subscription.endDate
                        ? formatDate(subscription.endDate)
                        : "No end date"
                    }
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Payments */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">
          <div className="border-b border-[#eeeeea] px-6 py-5">
            <h2 className="text-base font-semibold text-[#282825]">
              Recent Payments
            </h2>

            <p className="mt-1 text-xs text-[#999994]">
              Latest payment activity for this tenant.
            </p>
          </div>

          {tenant.payments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#999994]">
              No payments recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-[#eeeeea]">
              {tenant.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#282825]">
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </p>

                    <p className="mt-1 text-xs text-[#999994]">
                      {payment.paymentMethod || "Payment"} ·{" "}
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <span
                    className={[
                      "inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold",
                      payment.status === "SUCCESS"
                        ? "bg-green-50 text-green-700"
                        : payment.status === "FAILED"
                        ? "bg-red-50 text-red-700"
                        : "bg-gray-100 text-gray-600",
                    ].join(" ")}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e5e0] bg-white p-5 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeeeb] text-[#666661]">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-[#444440]">
        {value}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fafaf8] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#aaa9a4]">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-[#555550]">
        {value}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-50 text-purple-700",
    TENANT_ADMIN: "bg-blue-50 text-blue-700",
    MANAGER: "bg-amber-50 text-amber-700",
    STAFF: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
        styles[role] || "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {role.replace("_", " ")}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
