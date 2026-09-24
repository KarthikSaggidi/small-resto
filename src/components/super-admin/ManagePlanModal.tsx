"use client";

import {
  AlertTriangle,
  Check,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type ManagePlanModalProps = {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
};

export default function ManagePlanModal({
  open,
  plan,
  onClose,
}: ManagePlanModalProps) {
  if (open === false || plan === null) {
    return null;
  }

  const currentPlan = plan;
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    monthlyPrice: "",
    yearlyPrice: "",
    maxUsers: "1",
    maxProducts: "100",
    maxLocations: "1",
    onlineOrders: true,
    billing: true,
    inventory: true,
    reports: true,
    loyalty: false,
    advancedReports: false,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!plan) return;

    setForm({
      name: currentPlan.name,
      slug: plan.slug,
      description: plan.description || "",
      monthlyPrice: String(plan.monthlyPrice),
      yearlyPrice: String(plan.yearlyPrice),
      maxUsers: String(plan.maxUsers),
      maxProducts: String(plan.maxProducts),
      maxLocations: String(plan.maxLocations),
      onlineOrders: plan.onlineOrders,
      billing: plan.billing,
      inventory: plan.inventory,
      reports: plan.reports,
      loyalty: plan.loyalty,
      advancedReports: plan.advancedReports,
      isActive: plan.isActive,
    });

    setError("");
  }, [plan]);

  if (!open || !plan) {
    return null;
  }

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/super-admin/plans/${currentPlan.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            monthlyPrice: Number(form.monthlyPrice),
            yearlyPrice: Number(form.yearlyPrice),
            maxUsers: Number(form.maxUsers),
            maxProducts: Number(form.maxProducts),
            maxLocations: Number(form.maxLocations),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update plan."
        );
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update plan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (currentPlan._count.subscriptions > 0) {
      setError(
        "This plan has subscriptions and cannot be deleted. Deactivate it instead."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${currentPlan.name}" permanently? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setDeleting(true);

    try {
      const response = await fetch(
        `/api/super-admin/plans/${currentPlan.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete plan."
        );
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete plan."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[#fafaf8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e3] bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999994]">
              Plan Management
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#171717]">
              Manage {currentPlan.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#777772] transition hover:bg-[#eeeeeb] hover:text-[#222220]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                <AlertTriangle
                  size={17}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <p className="text-xs leading-5 text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Basic Information */}
            <section>
              <SectionTitle>
                Basic Information
              </SectionTitle>

              <div className="mt-4 space-y-4">
                <Field
                  label="Plan Name"
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  required
                />

                <Field
                  label="Slug"
                  value={form.slug}
                  onChange={(value) =>
                    updateField("slug", value)
                  }
                  required
                />

                <div>
                  <label className="text-xs font-semibold text-[#555550]">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-[#deded9] bg-white px-4 py-3 text-sm text-[#282825] outline-none transition placeholder:text-[#aaa9a4] focus:border-[#777772]"
                    placeholder="Describe what this plan includes..."
                  />
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <SectionTitle>
                Pricing
              </SectionTitle>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Monthly Price (₹)"
                  type="number"
                  min="0"
                  value={form.monthlyPrice}
                  onChange={(value) =>
                    updateField(
                      "monthlyPrice",
                      value
                    )
                  }
                  required
                />

                <Field
                  label="Yearly Price (₹)"
                  type="number"
                  min="0"
                  value={form.yearlyPrice}
                  onChange={(value) =>
                    updateField(
                      "yearlyPrice",
                      value
                    )
                  }
                  required
                />
              </div>
            </section>

            {/* Limits */}
            <section>
              <SectionTitle>
                Limits
              </SectionTitle>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <Field
                  label="Maximum Users"
                  type="number"
                  min="1"
                  value={form.maxUsers}
                  onChange={(value) =>
                    updateField(
                      "maxUsers",
                      value
                    )
                  }
                  required
                />

                <Field
                  label="Maximum Products"
                  type="number"
                  min="1"
                  value={form.maxProducts}
                  onChange={(value) =>
                    updateField(
                      "maxProducts",
                      value
                    )
                  }
                  required
                />

                <Field
                  label="Maximum Locations"
                  type="number"
                  min="1"
                  value={form.maxLocations}
                  onChange={(value) =>
                    updateField(
                      "maxLocations",
                      value
                    )
                  }
                  required
                />
              </div>
            </section>

            {/* Features */}
            <section>
              <SectionTitle>
                Features
              </SectionTitle>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FeatureToggle
                  label="Online Orders"
                  enabled={form.onlineOrders}
                  onChange={(value) =>
                    updateField(
                      "onlineOrders",
                      value
                    )
                  }
                />

                <FeatureToggle
                  label="Billing"
                  enabled={form.billing}
                  onChange={(value) =>
                    updateField(
                      "billing",
                      value
                    )
                  }
                />

                <FeatureToggle
                  label="Inventory"
                  enabled={form.inventory}
                  onChange={(value) =>
                    updateField(
                      "inventory",
                      value
                    )
                  }
                />

                <FeatureToggle
                  label="Reports"
                  enabled={form.reports}
                  onChange={(value) =>
                    updateField(
                      "reports",
                      value
                    )
                  }
                />

                <FeatureToggle
                  label="Loyalty"
                  enabled={form.loyalty}
                  onChange={(value) =>
                    updateField(
                      "loyalty",
                      value
                    )
                  }
                />

                <FeatureToggle
                  label="Advanced Reports"
                  enabled={form.advancedReports}
                  onChange={(value) =>
                    updateField(
                      "advancedReports",
                      value
                    )
                  }
                />
              </div>
            </section>

            {/* Status */}
            <section>
              <SectionTitle>
                Plan Status
              </SectionTitle>

              <div className="mt-4 rounded-2xl border border-[#e5e5e0] bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#333330]">
                      {form.isActive
                        ? "Plan is active"
                        : "Plan is inactive"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#999994]">
                      {form.isActive
                        ? "Tenants can be assigned to this plan."
                        : "This plan cannot be newly assigned to tenants."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        "isActive",
                        !form.isActive
                      )
                    }
                    className={[
                      "relative h-7 w-12 shrink-0 rounded-full transition",
                      form.isActive
                        ? "bg-[#111111]"
                        : "bg-[#d7d7d2]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition",
                        form.isActive
                          ? "left-6"
                          : "left-1",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#e8e8e3] bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                deleting ||
                loading ||
                currentPlan._count.subscriptions > 0
              }
              className="flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={15} />
              )}

              Delete Plan
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || deleting}
                className="h-10 rounded-xl border border-[#deded9] bg-white px-5 text-xs font-semibold text-[#555550] transition hover:bg-[#fafaf8] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || deleting}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-xs font-semibold text-white transition hover:bg-[#292927] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Loader2
                    size={15}
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

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#999994]">
      {children}
    </p>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#555550]">
        {label}
      </label>

      <input
        type={type}
        min={min}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-[#deded9] bg-white px-4 text-sm text-[#282825] outline-none transition placeholder:text-[#aaa9a4] focus:border-[#777772]"
      />
    </div>
  );
}

function FeatureToggle({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={[
        "flex items-center justify-between rounded-2xl border p-4 text-left transition",
        enabled
          ? "border-[#dcdcd7] bg-white"
          : "border-[#e8e8e3] bg-[#fafaf8]",
      ].join(" ")}
    >
      <div>
        <p className="text-xs font-semibold text-[#444440]">
          {label}
        </p>

        <p className="mt-1 text-[10px] text-[#aaa9a4]">
          {enabled ? "Enabled" : "Disabled"}
        </p>
      </div>

      <span
        className={[
          "flex h-6 w-6 items-center justify-center rounded-full",
          enabled
            ? "bg-green-50 text-green-700"
            : "bg-[#eeeeeb] text-[#aaa9a4]",
        ].join(" ")}
      >
        <Check size={12} strokeWidth={2.5} />
      </span>
    </button>
  );
}
