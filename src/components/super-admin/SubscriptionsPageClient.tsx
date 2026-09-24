"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import AssignSubscriptionModal from "@/components/super-admin/AssignSubscriptionModal";

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type Plan = {
  id: string;
  name: string;
  monthlyPrice: unknown;
  yearlyPrice: unknown;
};

export default function SubscriptionsPageClient({
  children,
  tenants,
  plans,
}: {
  children: React.ReactNode;
  tenants: Tenant[];
  plans: Plan[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999994]">
            Platform
          </p>

          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#171717]">
            Subscriptions
          </h1>

          <p className="mt-2 text-sm text-[#777772]">
            Manage plans, trials, and billing subscriptions for your tenants.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#292927]"
        >
          <Plus size={17} />
          Assign Plan
        </button>
      </div>

      {children}

      <AssignSubscriptionModal
        open={open}
        onClose={() => setOpen(false)}
        tenants={tenants}
        plans={plans}
      />
    </>
  );
}
