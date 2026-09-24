"use client";

import {
  Loader2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type Subscription = {
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

  startDate: string;
  endDate: string | null;
  trialEndsAt: string | null;

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

type ManageSubscriptionModalProps = {
  open: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  plans: Plan[];
};

export default function ManageSubscriptionModal({
  open,
  onClose,
  subscription,
  plans,
}: ManageSubscriptionModalProps) {
  if (open === false || subscription === null) {
    return null;
  }

  const currentSubscription = subscription;
  const router = useRouter();

  const [planId, setPlanId] = useState("");

  const [billingInterval, setBillingInterval] =
    useState<"MONTHLY" | "YEARLY">("MONTHLY");

  const [status, setStatus] =
    useState<Subscription["status"]>("TRIAL");

  const [trialDays, setTrialDays] =
    useState("14");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Initialize the form whenever a different
   * subscription is opened.
   */
  useEffect(() => {
    if (!open || !subscription) {
      return;
    }

    setPlanId(currentSubscription.plan.id);

    setBillingInterval(
      currentSubscription.billingInterval
    );

    setStatus(currentSubscription.status);

    if (currentSubscription.trialEndsAt) {
      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(
            currentSubscription.trialEndsAt
          ).getTime() -
            Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      );

      setTrialDays(String(remaining));
    } else {
      setTrialDays("14");
    }

    setError("");
  }, [open, subscription]);

  if (!open || !subscription) {
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
    setLoading(true);

    try {
      const response = await fetch(
        `/api/super-admin/subscriptions/${currentSubscription.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId,
            billingInterval,
            status,
            trialDays: Number(trialDays),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update subscription."
        );
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(
    nextStatus:
      | "ACTIVE"
      | "CANCELLED"
      | "EXPIRED"
  ) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/super-admin/subscriptions/${currentSubscription.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: currentSubscription.plan.id,
            billingInterval:
              currentSubscription.billingInterval,
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update subscription."
        );
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update subscription."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setError("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="flex max-h-[calc(100dvh-32px)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-[#fafaf8] shadow-2xl">
        {/* -------------------------------------------------------------- */}
        {/* Header                                                         */}
        {/* -------------------------------------------------------------- */}

        <div className="flex shrink-0 items-center justify-between border-b border-[#e8e8e3] bg-white px-6 py-5">
          <div className="min-w-0">
            <p className="text-left text-[10px] font-bold uppercase tracking-[0.18em] text-[#999994]">
              Subscription
            </p>

            <h2 className="mt-1 text-left text-xl font-semibold tracking-[-0.03em] text-[#171717]">
              Manage Subscription
            </h2>

            <p className="mt-1 truncate text-xs text-[#999994]">
              {currentSubscription.tenant.name}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#777772] transition hover:bg-[#eeeeeb] hover:text-[#222220] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Form                                                           */}
        {/* -------------------------------------------------------------- */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 px-6 py-6">
              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-left text-xs leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Tenant */}
              <div className="rounded-2xl border border-[#e5e5e0] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
                      Tenant
                    </p>

                    <p className="mt-2 truncate text-left text-sm font-semibold text-[#282825]">
                      {currentSubscription.tenant.name}
                    </p>

                    <p className="mt-1 truncate text-left text-xs text-[#999994]">
                      {currentSubscription.tenant.slug}
                    </p>
                  </div>

                  <StatusBadge
                    status={currentSubscription.status}
                  />
                </div>
              </div>

              {/* Plan */}
              <div>
                <label
                  htmlFor="manage-subscription-plan"
                  className="block text-left text-xs font-semibold text-[#555550]"
                >
                  Plan
                </label>

                <select
                  id="manage-subscription-plan"
                  value={planId}
                  onChange={(event) =>
                    setPlanId(event.target.value)
                  }
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-xl border border-[#deded9] bg-white px-4 text-left text-sm text-[#282825] outline-none transition focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5 disabled:cursor-not-allowed disabled:bg-[#f5f5f2]"
                >
                  {plans.map((plan) => (
                    <option
                      key={plan.id}
                      value={plan.id}
                    >
                      {plan.name}
                    </option>
                  ))}
                </select>

                {selectedPlan && (
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-[#999994]">
                      Current price
                    </span>

                    <span className="text-[11px] font-semibold text-[#555550]">
                      ₹
                      {Number(
                        billingInterval === "YEARLY"
                          ? selectedPlan.yearlyPrice
                          : selectedPlan.monthlyPrice
                      ).toLocaleString("en-IN")}
                      /
                      {billingInterval === "YEARLY"
                        ? "year"
                        : "month"}
                    </span>
                  </div>
                )}
              </div>

              {/* Billing Interval */}
              <div>
                <p className="text-left text-xs font-semibold text-[#555550]">
                  Billing Interval
                </p>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Choice
                    active={
                      billingInterval === "MONTHLY"
                    }
                    onClick={() =>
                      setBillingInterval("MONTHLY")
                    }
                    title="Monthly"
                    description="Billed every month"
                  />

                  <Choice
                    active={
                      billingInterval === "YEARLY"
                    }
                    onClick={() =>
                      setBillingInterval("YEARLY")
                    }
                    title="Yearly"
                    description="Billed every year"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="manage-subscription-status"
                  className="block text-left text-xs font-semibold text-[#555550]"
                >
                  Status
                </label>

                <select
                  id="manage-subscription-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target
                        .value as Subscription["status"]
                    )
                  }
                  disabled={loading}
                  className="mt-2 h-11 w-full rounded-xl border border-[#deded9] bg-white px-4 text-left text-sm text-[#282825] outline-none transition focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5 disabled:cursor-not-allowed disabled:bg-[#f5f5f2]"
                >
                  <option value="TRIAL">
                    Trial
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="PAST_DUE">
                    Past Due
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>

                  <option value="EXPIRED">
                    Expired
                  </option>
                </select>
              </div>

              {/* Trial Period */}
              {status === "TRIAL" && (
                <div>
                  <label
                    htmlFor="manage-subscription-trial-days"
                    className="block text-left text-xs font-semibold text-[#555550]"
                  >
                    Trial Period
                  </label>

                  <div className="mt-2 flex items-center gap-3">
                    <input
                      id="manage-subscription-trial-days"
                      type="number"
                      min="0"
                      max="365"
                      value={trialDays}
                      onChange={(event) =>
                        setTrialDays(
                          event.target.value
                        )
                      }
                      disabled={loading}
                      className="h-11 w-28 rounded-xl border border-[#deded9] bg-white px-4 text-left text-sm text-[#282825] outline-none transition focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5 disabled:cursor-not-allowed disabled:bg-[#f5f5f2]"
                    />

                    <span className="text-xs text-[#999994]">
                      days from today
                    </span>
                  </div>
                </div>
              )}

              {/* Current Period */}
              <div className="rounded-2xl border border-[#e5e5e0] bg-white p-4">
                <p className="text-left text-[10px] font-bold uppercase tracking-[0.12em] text-[#aaa9a4]">
                  Current Period
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Info
                    label="Started"
                    value={formatDate(
                      currentSubscription.startDate
                    )}
                  />

                  <Info
                    label={
                      currentSubscription.status === "TRIAL"
                        ? "Trial ends"
                        : "Period ends"
                    }
                    value={formatDate(
                      currentSubscription.status === "TRIAL"
                        ? currentSubscription.trialEndsAt
                        : currentSubscription.endDate
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* Fixed Footer                                                  */}
          {/* ------------------------------------------------------------ */}

          <div className="shrink-0 border-t border-[#e8e8e3] bg-white px-6 py-4">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {currentSubscription.status !== "ACTIVE" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    changeStatus("ACTIVE")
                  }
                  className="h-9 rounded-xl bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#292927] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    "Activate"
                  )}
                </button>
              )}

              {currentSubscription.status !== "CANCELLED" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    changeStatus("CANCELLED")
                  }
                  className="h-9 rounded-xl border border-[#deded9] bg-white px-4 text-[11px] font-semibold text-[#555550] transition hover:bg-[#fafaf8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              )}

              {currentSubscription.status !== "EXPIRED" && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    changeStatus("EXPIRED")
                  }
                  className="h-9 rounded-xl border border-[#deded9] bg-white px-4 text-[11px] font-semibold text-[#555550] transition hover:bg-[#fafaf8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Expire
                </button>
              )}
            </div>

            {/* Main Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="h-10 rounded-xl border border-[#deded9] bg-white px-5 text-xs font-semibold text-[#555550] transition hover:bg-[#fafaf8] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-xs font-semibold text-white transition hover:bg-[#292927] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                )}

                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Choice Button                                                              */
/* -------------------------------------------------------------------------- */

function Choice({
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
      <p className="text-left text-xs font-semibold text-[#333330]">
        {title}
      </p>

      <p className="mt-1 text-left text-[10px] text-[#999994]">
        {description}
      </p>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Info                                                                       */
/* -------------------------------------------------------------------------- */

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="text-left">
      <p className="text-left text-[10px] uppercase tracking-[0.1em] text-[#aaa9a4]">
        {label}
      </p>

      <p className="mt-1 text-left text-xs font-semibold text-[#555550]">
        {value}
      </p>
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
    ACTIVE: "bg-green-50 text-green-700",
    TRIAL: "bg-blue-50 text-blue-700",
    PAST_DUE: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-red-50 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={[
        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        styles[status] ||
          "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}