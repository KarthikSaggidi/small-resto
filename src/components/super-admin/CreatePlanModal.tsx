"use client";

import {
  Check,
  Loader2,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CreatePlanModalProps = {
  open: boolean;
  onClose: () => void;
};

const initialForm = {
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
};

export default function CreatePlanModal({
  open,
  onClose,
}: CreatePlanModalProps) {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateField(
    field: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugManuallyEdited
        ? current.slug
        : generateSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);

    updateField(
      "slug",
      generateSlug(value)
    );
  }

  function toggleFeature(
    field:
      | "onlineOrders"
      | "billing"
      | "inventory"
      | "reports"
      | "loyalty"
      | "advancedReports"
  ) {
    setForm((current) => ({
      ...current,
      [field]: !current[field],
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
        "/api/super-admin/plans",
        {
          method: "POST",
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

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create the plan."
        );
        return;
      }

      setForm(initialForm);
      setSlugManuallyEdited(false);

      onClose();
      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-[#e5e5e0] bg-[#fafaf8] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e5e0] bg-white px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa9a4]">
              Platform
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#171717]">
              Create Plan
            </h2>

            <p className="mt-1 text-xs text-[#999994]">
              Define pricing, limits and features for this plan.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#777772] transition hover:bg-[#f1f1ee] hover:text-[#222220] disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-100px)] overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Basic information */}
            <section>
              <SectionTitle>
                Basic Information
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Plan Name"
                  required
                >
                  <input
                    value={form.name}
                    onChange={(event) =>
                      handleNameChange(
                        event.target.value
                      )
                    }
                    placeholder="Professional"
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Slug"
                  required
                >
                  <input
                    value={form.slug}
                    onChange={(event) =>
                      handleSlugChange(
                        event.target.value
                      )
                    }
                    placeholder="professional"
                    required
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Description">
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="For growing bakeries and cafes."
                    rows={3}
                    className={`${inputClass} resize-none py-3`}
                  />
                </Field>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <SectionTitle>
                Pricing
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Monthly Price"
                  required
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999994]">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.monthlyPrice}
                      onChange={(event) =>
                        updateField(
                          "monthlyPrice",
                          event.target.value
                        )
                      }
                      placeholder="999"
                      required
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>

                <Field
                  label="Yearly Price"
                  required
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999994]">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.yearlyPrice}
                      onChange={(event) =>
                        updateField(
                          "yearlyPrice",
                          event.target.value
                        )
                      }
                      placeholder="9999"
                      required
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Limits */}
            <section>
              <SectionTitle>
                Usage Limits
              </SectionTitle>

              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Maximum Users"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    value={form.maxUsers}
                    onChange={(event) =>
                      updateField(
                        "maxUsers",
                        event.target.value
                      )
                    }
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Maximum Products"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    value={form.maxProducts}
                    onChange={(event) =>
                      updateField(
                        "maxProducts",
                        event.target.value
                      )
                    }
                    required
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Maximum Locations"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    value={form.maxLocations}
                    onChange={(event) =>
                      updateField(
                        "maxLocations",
                        event.target.value
                      )
                    }
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* Features */}
            <section>
              <SectionTitle>
                Features
              </SectionTitle>

              <div className="grid gap-3 sm:grid-cols-2">
                <FeatureToggle
                  label="Online Orders"
                  enabled={form.onlineOrders}
                  onClick={() =>
                    toggleFeature(
                      "onlineOrders"
                    )
                  }
                />

                <FeatureToggle
                  label="Billing"
                  enabled={form.billing}
                  onClick={() =>
                    toggleFeature("billing")
                  }
                />

                <FeatureToggle
                  label="Inventory"
                  enabled={form.inventory}
                  onClick={() =>
                    toggleFeature(
                      "inventory"
                    )
                  }
                />

                <FeatureToggle
                  label="Reports"
                  enabled={form.reports}
                  onClick={() =>
                    toggleFeature("reports")
                  }
                />

                <FeatureToggle
                  label="Loyalty"
                  enabled={form.loyalty}
                  onClick={() =>
                    toggleFeature("loyalty")
                  }
                />

                <FeatureToggle
                  label="Advanced Reports"
                  enabled={form.advancedReports}
                  onClick={() =>
                    toggleFeature(
                      "advancedReports"
                    )
                  }
                />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#e5e5e0] bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-[#deded9] px-5 text-sm font-semibold text-[#555550] transition hover:bg-[#f7f7f4] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 text-sm font-semibold text-white transition hover:bg-[#292927] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Create Plan
                </>
              )}
            </button>
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
    <div className="mb-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#666661]">
        {children}
      </h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-[#555550]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function FeatureToggle({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
        enabled
          ? "border-[#d8e8d8] bg-[#f5faf5]"
          : "border-[#e5e5e0] bg-white hover:bg-[#fafaf8]",
      ].join(" ")}
    >
      <span
        className={[
          "text-xs font-semibold",
          enabled
            ? "text-[#444440]"
            : "text-[#888883]",
        ].join(" ")}
      >
        {label}
      </span>

      <span
        className={[
          "flex h-6 w-6 items-center justify-center rounded-full",
          enabled
            ? "bg-green-600 text-white"
            : "bg-[#eeeeeb] text-transparent",
        ].join(" ")}
      >
        <Check size={12} strokeWidth={2.5} />
      </span>
    </button>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-[#deded9] bg-white px-3 text-sm text-[#282825] outline-none transition placeholder:text-[#aaa9a4] focus:border-[#777772] focus:ring-2 focus:ring-[#111111]/5";
