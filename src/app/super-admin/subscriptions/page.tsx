import {
  CalendarDays,
  CreditCard,
  Users,
} from "lucide-react";

import ManageSubscriptionButton from "@/components/super-admin/ManageSubscriptionButton";
import SubscriptionsPageClient from "@/components/super-admin/SubscriptionsPageClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const [subscriptions, tenants, plans] =
    await Promise.all([
      prisma.subscription.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              email: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              slug: true,
              monthlyPrice: true,
              yearlyPrice: true,
            },
          },
          payments: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      }),

      prisma.tenant.findMany({
        where: {
          status: {
            not: "INACTIVE",
          },
        },
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),

      prisma.plan.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          monthlyPrice: true,
          yearlyPrice: true,
        },
      }),
    ]);

  const trialCount = subscriptions.filter(
    (subscription) =>
      subscription.status === "TRIAL"
  ).length;

  const activeCount = subscriptions.filter(
    (subscription) =>
      subscription.status === "ACTIVE"
  ).length;

  const pastDueCount = subscriptions.filter(
    (subscription) =>
      subscription.status === "PAST_DUE"
  ).length;

  return (
    <main className="p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <SubscriptionsPageClient
          tenants={tenants}
          plans={plans}
        >
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total"
              value={subscriptions.length}
              icon={<CreditCard size={18} />}
            />

            <SummaryCard
              label="Active"
              value={activeCount}
              icon={<Users size={18} />}
            />

            <SummaryCard
              label="Trial"
              value={trialCount}
              icon={<CalendarDays size={18} />}
            />

            <SummaryCard
              label="Past Due"
              value={pastDueCount}
              icon={<CreditCard size={18} />}
            />
          </div>

          {/* Subscription List */}
          <section className="overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">
            {subscriptions.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Desktop Header */}
                <div className="hidden grid-cols-[1.5fr_1.1fr_0.9fr_0.9fr_130px_80px] gap-4 border-b border-[#eeeeea] bg-[#fafaf8] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#999994] lg:grid">
                  <span>Tenant</span>
                  <span>Plan</span>
                  <span>Billing</span>
                  <span>Status</span>
                  <span>Period</span>
                  <span className="text-right">
                    Action
                  </span>
                </div>

                <div className="divide-y divide-[#eeeeea]">
                  {subscriptions.map(
                    (subscription) => (
                      <SubscriptionRow
                        key={subscription.id}
                        subscription={subscription}
                        plans={plans}
                      />
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </SubscriptionsPageClient>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Summary Card                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e5e0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#999994]">
          {label}
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eeeeeb] text-[#666661]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#282825]">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subscription Row                                                           */
/* -------------------------------------------------------------------------- */

function SubscriptionRow({
  subscription,
  plans,
}: {
  subscription: {
    id: string;
    status:
      | "TRIAL"
      | "ACTIVE"
      | "PAST_DUE"
      | "CANCELLED"
      | "EXPIRED";

    billingInterval:
      | "MONTHLY"
      | "YEARLY";

    startDate: Date;
    endDate: Date | null;
    trialEndsAt: Date | null;

    tenant: {
      id: string;
      name: string;
      slug: string;
      status: string;
      email: string | null;
    };

    plan: {
      id: string;
      name: string;
      slug: string;
      monthlyPrice: unknown;
      yearlyPrice: unknown;
    };
  };

  plans: {
    id: string;
    name: string;
    monthlyPrice: unknown;
    yearlyPrice: unknown;
  }[];
}) {
  const periodEnd =
    subscription.status === "TRIAL"
      ? subscription.trialEndsAt
      : subscription.endDate;

  return (
    <div className="grid gap-5 px-6 py-5 transition-colors hover:bg-[#fafaf8] lg:grid-cols-[1.5fr_1.1fr_0.9fr_0.9fr_130px_80px] lg:items-center lg:gap-4">
      {/* Tenant */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeeeb] text-xs font-bold text-[#555550]">
          {subscription.tenant.name
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#282825]">
            {subscription.tenant.name}
          </p>

          <p className="mt-1 truncate text-xs text-[#999994]">
            {subscription.tenant.slug}
          </p>
        </div>
      </div>

      {/* Plan */}
      <div>
        <p className="text-xs font-semibold text-[#444440]">
          {subscription.plan.name}
        </p>

        <p className="mt-1 text-[10px] text-[#aaa9a4]">
          ₹
          {Number(
            subscription.billingInterval ===
              "YEARLY"
              ? subscription.plan.yearlyPrice
              : subscription.plan.monthlyPrice
          ).toLocaleString("en-IN")}
          /
          {subscription.billingInterval ===
          "YEARLY"
            ? "year"
            : "month"}
        </p>
      </div>

      {/* Billing */}
      <div>
        <span className="inline-flex rounded-full bg-[#f1f1ee] px-2.5 py-1 text-[10px] font-semibold text-[#666661]">
          {subscription.billingInterval}
        </span>
      </div>

      {/* Status */}
      <div>
        <StatusBadge
          status={subscription.status}
        />
      </div>

      {/* Period */}
      <div>
        <p className="text-xs font-medium text-[#555550]">
          {formatDate(periodEnd)}
        </p>

        <p className="mt-1 text-[10px] text-[#aaa9a4]">
          {subscription.status ===
          "TRIAL"
            ? "Trial ends"
            : "Period ends"}
        </p>
      </div>

      {/* Manage */}
      <div className="lg:text-right">
        <ManageSubscriptionButton
          subscription={subscription}
          plans={plans}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    ACTIVE:
      "bg-green-50 text-green-700",

    TRIAL:
      "bg-blue-50 text-blue-700",

    PAST_DUE:
      "bg-amber-50 text-amber-700",

    CANCELLED:
      "bg-red-50 text-red-700",

    EXPIRED:
      "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold",
        styles[status] ||
          "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Formatter                                                             */
/* -------------------------------------------------------------------------- */

function formatDate(
  date: Date | null
) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeeeb] text-[#666661]">
        <CreditCard
          size={23}
          strokeWidth={1.7}
        />
      </div>

      <h2 className="mt-5 text-base font-semibold text-[#282825]">
        No subscriptions yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-[#999994]">
        Assign a plan to your first tenant to
        create a subscription.
      </p>
    </div>
  );
}