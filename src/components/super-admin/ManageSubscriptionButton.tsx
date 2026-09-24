"use client";

import { useState } from "react";

import ManageSubscriptionModal from "@/components/super-admin/ManageSubscriptionModal";

type Subscription = {
  id: string;
  status:
    | "TRIAL"
    | "ACTIVE"
    | "PAST_DUE"
    | "CANCELLED"
    | "EXPIRED";
  billingInterval: "MONTHLY" | "YEARLY";
  startDate: Date;
  endDate: Date | null;
  trialEndsAt: Date | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  plan: {
    id: string;
    name: string;
    monthlyPrice: unknown;
    yearlyPrice: unknown;
  };
};

type Plan = {
  id: string;
  name: string;
  monthlyPrice: unknown;
  yearlyPrice: unknown;
};

export default function ManageSubscriptionButton({
  subscription,
  plans,
}: {
  subscription: Subscription;
  plans: Plan[];
}) {
  const [open, setOpen] = useState(false);

  const modalSubscription = {
    ...subscription,
    startDate:
      subscription.startDate.toISOString(),
    endDate:
      subscription.endDate?.toISOString() ??
      null,
    trialEndsAt:
      subscription.trialEndsAt?.toISOString() ??
      null,
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#444440] transition hover:text-[#111111]"
      >
        Manage
      </button>

      <ManageSubscriptionModal
        open={open}
        onClose={() => setOpen(false)}
        subscription={modalSubscription}
        plans={plans}
      />
    </>
  );
}