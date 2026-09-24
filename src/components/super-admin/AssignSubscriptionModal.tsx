"use client";

import {
  Loader2,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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

type AssignSubscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  tenants: Tenant[];
  plans: Plan[];
};

export default function AssignSubscriptionModal({
  open,
  onClose,
  tenants,
  plans,
}: AssignSubscriptionModalProps) {
  const router = useRouter();

  const [tenantId, setTenantId] = useState("");
  const [planId, setPlanId] = useState("");

  const [billingInterval, setBillingInterval] =
    useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const [status, setStatus] =
    useState<"TRIAL" | "ACTIVE">("TRIAL");

  const [trialDays, setTrialDays] =
    useState("14");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!open) {
    return null;
  }

  const selectedPlan = plans.find(
    (plan) => plan.id === planId
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!tenantId) {
      setError("Please select a tenant.");
      return;
    }

    if (!planId) {
      setError("Please select a plan.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/super-admin/subscriptions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantId,
            planId,
            billingInterval,
            status,
            trialDays: Number(trialDays),
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to create subscription."
        );
      }

      setTenantId("");
      setPlanId("");
      setBillingInterval("MONTHLY");
      setStatus("TRIAL");
      setTrialDays("14");

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;

    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-[#fafaf8] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#e8e8e3] bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999994]">
              Subscriptions
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#171717]">
              Assign Plan
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#777772] transition hover:bg-[#eeeeeb] hover:text-[#222220] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Tenant */}
              <div>
                <label
                  htmlFor="subscription-tenant"
                  className="block text-left text-xs font-semibold text-[#555550]"
                >
                  Tenant
                </label>

                <select
                  id="subscription-tenant"
                  value={tenantId}
                  onChange={(event) =>
                    setTenantId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-[#deded9] bg-white px-4 text-sm text-[#282825] outline-none transition focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5"
                  required
                >
                  <option value="">
                    Select tenant
                  </option>

                  {tenants.map((tenant) => (
                    <option
                      key={tenant.id}
                      value={tenant.id}
                    >
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan */}
              <div>
                <label
                  htmlFor="subscription-plan"
                  className="block text-left text-xs font-semibold text-[#555550]"
                >
                  Plan
                </label>

                <select
                  id="subscription-plan"
                  value={planId}
                  onChange={(event) =>
                    setPlanId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-[#deded9] bg-white px-4 text-sm text-[#282825] outline-none transition focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5"
                  required
                >
                  <option value="">
                    Select plan
                  </option>

                  {plans.map((plan) => (
                    <option
                      key={plan.id}
                      value={plan.id}
                    >
                      {plan.name} — ₹
                      {Number(
                        plan.monthlyPrice
                      ).toLocaleString(
                        "en-IN"
                      )}
                      /month
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Plan */}
              {selectedPlan && (
                <div className="rounded-2xl border border-[#e5e5e0] bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-[#888883]">
                      Selected plan
                    </span>

                    <span className="text-sm font-semibold text-[#333330]">
                      {selectedPlan.name}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#fafaf8] p-3">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#aaa9a4]">
                        Monthly
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#333330]">
                        ₹
                        {Number(
                          selectedPlan.monthlyPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#fafaf8] p-3">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-[#aaa9a4]">
                        Yearly
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#333330]">
                        ₹
                        {Number(
                          selectedPlan.yearlyPrice
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Interval */}
              <div>
                <p className="text-left text-xs font-semibold text-[#555550]">
                  Billing Interval
                </p>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <ChoiceButton
                    active={
                      billingInterval ===
                      "MONTHLY"
                    }
                    onClick={() =>
                      setBillingInterval(
                        "MONTHLY"
                      )
                    }
                    title="Monthly"
                    description="Billed every month"
                  />

                  <ChoiceButton
                    active={
                      billingInterval ===
                      "YEARLY"
                    }
                    onClick={() =>
                      setBillingInterval(
                        "YEARLY"
                      )
                    }
                    title="Yearly"
                    description="Billed every year"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="text-left text-xs font-semibold text-[#555550]">
                  Subscription Status
                </p>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <ChoiceButton
                    active={
                      status === "TRIAL"
                    }
                    onClick={() =>
                      setStatus("TRIAL")
                    }
                    title="Trial"
                    description="Start with a trial"
                  />

                  <ChoiceButton
                    active={
                      status === "ACTIVE"
                    }
                    onClick={() =>
                      setStatus("ACTIVE")
                    }
                    title="Active"
                    description="Activate immediately"
                  />
                </div>
              </div>

              {/* Trial */}
              {status === "TRIAL" && (
                <div>
                  <label
                    htmlFor="trial-days"
                    className="block text-left text-xs font-semibold text-[#555550]"
                  >
                    Trial Period
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="trial-days"
                      type="number"
                      min="0"
                      max="365"
                      value={trialDays}
                      onChange={(event) =>
                        setTrialDays(
                          event.target.value
                        )
                      }
                      className="h-11 w-28 rounded-xl border border-[#deded9] bg-white px-4 text-sm text-[#282825] outline-none transition focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5"
                    />

                    <span className="text-xs text-[#999994]">
                      days
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-[#e8e8e3] bg-white px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="h-10 rounded-xl border border-[#deded9] bg-white px-5 text-xs font-semibold text-[#555550] transition hover:bg-[#fafaf8] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-xs font-semibold text-white transition hover:bg-[#292927] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )}

              Assign Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-[#111111] bg-[#f5f5f2]"
          : "border-[#e5e5e0] bg-white hover:border-[#cfcfca]",
      ].join(" ")}
    >
      <p className="text-xs font-semibold text-[#333330]">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-[#999994]">
        {description}
      </p>
    </button>
  );
}