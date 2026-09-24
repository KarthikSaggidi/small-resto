"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import CreatePlanModal from "@/components/super-admin/CreatePlanModal";
import ManagePlanModal from "@/components/super-admin/ManagePlanModal";

type Plan = {
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

export default function PlansPageClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [createOpen, setCreateOpen] =
    useState(false);

  const [manageOpen, setManageOpen] =
    useState(false);

  const [selectedPlan, setSelectedPlan] =
    useState<Plan | null>(null);

  function openManagePlan(plan: Plan) {
    setSelectedPlan(plan);
    setManageOpen(true);
  }

  function closeManagePlan() {
    setManageOpen(false);
    setSelectedPlan(null);
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999994]">
            Platform
          </p>

          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#171717]">
            Plans
          </h1>

          <p className="mt-2 text-sm text-[#777772]">
            Create and manage subscription plans
            for your tenants.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#292927]"
        >
          <Plus size={17} />
          Create Plan
        </button>
      </div>

      {children}

      {/* Create Plan */}
      <CreatePlanModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Manage Plan */}
      <ManagePlanModal
        open={manageOpen}
        plan={selectedPlan}
        onClose={closeManagePlan}
      />
    </>
  );
}