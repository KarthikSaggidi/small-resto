"use client";

import { useState } from "react";

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

export default function ManagePlanButton({
  plan,
}: {
  plan: Plan;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#444440] transition hover:text-[#111111]"
      >
        Manage
      </button>

      <ManagePlanModal
        open={open}
        plan={plan}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
