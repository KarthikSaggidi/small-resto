import {
  Check,
  CreditCard,
  Users,
  Package,
  MapPin,
} from "lucide-react";

import PlansPageClient from "@/components/super-admin/PlansPageClient";
import ManagePlanButton from "@/components/super-admin/ManagePlanButton";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
        },
      },
    },
  });

  return (
    <main className="p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <PlansPageClient>
          {/* Plans */}
          {plans.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-[#e5e5e0] bg-white px-6 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeeeb] text-[#666661]">
                <CreditCard
                  size={23}
                  strokeWidth={1.7}
                />
              </div>

              <h2 className="mt-5 text-base font-semibold text-[#282825]">
                No plans yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#999994]">
                Create your first subscription plan to
                start assigning plans to tenants.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                />
              ))}
            </div>
          )}
        </PlansPageClient>
      </div>
    </main>
  );
}

function PlanCard({
  plan,
}: {
  plan: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    monthlyPrice: unknown;
    yearlyPrice: unknown;
    maxUsers: number;
    maxProducts: number;
    maxLocations: number;
    onlineOrders: boolean;
    billing: boolean;
    inventory: boolean;
    reports: boolean;
    loyalty: boolean;
    advancedReports: boolean;
    isActive: boolean;
    _count: {
      subscriptions: number;
    };
  };
}) {
  const monthly = Number(plan.monthlyPrice);
  const yearly = Number(plan.yearlyPrice);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Card header */}
      <div className="border-b border-[#eeeeea] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[#282825]">
                {plan.name}
              </h2>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  plan.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600",
                ].join(" ")}
              >
                {plan.isActive
                  ? "ACTIVE"
                  : "INACTIVE"}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-[#aaa9a4]">
              {plan.slug}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eeeeeb] text-[#666661]">
            <CreditCard size={18} />
          </div>
        </div>

        {plan.description && (
          <p className="mt-4 text-sm leading-6 text-[#777772]">
            {plan.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#fafaf8] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
              Monthly
            </p>

            <p className="mt-1 text-xl font-semibold text-[#282825]">
              ₹{monthly.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl bg-[#fafaf8] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
              Yearly
            </p>

            <p className="mt-1 text-xl font-semibold text-[#282825]">
              ₹{yearly.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="border-b border-[#eeeeea] p-6">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
          Limits
        </p>

        <div className="space-y-3">
          <LimitRow
            icon={<Users size={15} />}
            label="Users"
            value={plan.maxUsers}
          />

          <LimitRow
            icon={<Package size={15} />}
            label="Products"
            value={plan.maxProducts}
          />

          <LimitRow
            icon={<MapPin size={15} />}
            label="Locations"
            value={plan.maxLocations}
          />
        </div>
      </div>

      {/* Features */}
      <div className="p-6">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
          Features
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <FeatureItem
            label="Online Orders"
            enabled={plan.onlineOrders}
          />

          <FeatureItem
            label="Billing"
            enabled={plan.billing}
          />

          <FeatureItem
            label="Inventory"
            enabled={plan.inventory}
          />

          <FeatureItem
            label="Reports"
            enabled={plan.reports}
          />

          <FeatureItem
            label="Loyalty"
            enabled={plan.loyalty}
          />

          <FeatureItem
            label="Advanced Reports"
            enabled={plan.advancedReports}
          />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#eeeeea] pt-5">
          <span className="text-xs text-[#999994]">
            {plan._count.subscriptions}{" "}
            {plan._count.subscriptions === 1
              ? "subscription"
              : "subscriptions"}
          </span>

          <ManagePlanButton plan={plan} />
        </div>
      </div>
    </article>
  );
}

function LimitRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-[#666661]">
        <span className="text-[#999994]">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <span className="text-xs font-semibold text-[#444440]">
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function FeatureItem({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 text-xs",
        enabled
          ? "text-[#555550]"
          : "text-[#b5b5b0]",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-5 w-5 items-center justify-center rounded-full",
          enabled
            ? "bg-green-50 text-green-700"
            : "bg-[#f1f1ee] text-[#b5b5b0]",
        ].join(" ")}
      >
        <Check
          size={11}
          strokeWidth={2.5}
        />
      </span>

      <span>{label}</span>
    </div>
  );
}