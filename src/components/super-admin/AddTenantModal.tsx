"use client";

import {
  Building2,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTenantModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function handleBusinessNameChange(value: string) {
    setName(value);

    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/super-admin/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          businessType,
          email,
          phone,
          ownerName,
          ownerEmail,
          ownerPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create tenant.");
        return;
      }

      setName("");
      setSlug("");
      setBusinessType("");
      setEmail("");
      setPhone("");
      setOwnerName("");
      setOwnerEmail("");
      setOwnerPassword("");

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.18)]">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eeeeea] bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeeeeb] text-[#555550]">
              <Building2 size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-[#222220]">
                Add Tenant
              </h2>

              <p className="mt-0.5 text-xs text-[#999994]">
                Create a new business on the DropXcorp platform.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#777772] transition hover:bg-[#f1f1ee] hover:text-[#222220]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">

          {/* Business information */}
          <div>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999994]">
                Business Information
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <Field
                label="Business name"
                required
                value={name}
                onChange={handleBusinessNameChange}
                placeholder="Thirumala Bakery"
                icon={Building2}
              />

              <Field
                label="Tenant slug"
                required
                value={slug}
                onChange={setSlug}
                placeholder="thirumala-bakery"
              />

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#393936]">
                  Business type
                </label>

                <select
                  value={businessType}
                  onChange={(event) =>
                    setBusinessType(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-[#deded9] bg-[#fafaf8] px-3 text-sm text-[#333330] outline-none transition focus:border-[#555550] focus:bg-white"
                >
                  <option value="">Select business type</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cloud Kitchen">Cloud Kitchen</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Field
                label="Business email"
                value={email}
                onChange={setEmail}
                placeholder="hello@business.com"
                type="email"
                icon={Mail}
              />

              <Field
                label="Business phone"
                value={phone}
                onChange={setPhone}
                placeholder="+91 98765 43210"
                icon={Phone}
              />
            </div>
          </div>

          {/* Owner */}
          <div className="mt-8 border-t border-[#eeeeea] pt-7">
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999994]">
                Tenant Administrator
              </p>

              <p className="mt-1 text-xs text-[#999994]">
                These credentials will be used by the business owner to
                access their admin panel.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <Field
                label="Owner name"
                required
                value={ownerName}
                onChange={setOwnerName}
                placeholder="Business owner"
                icon={User}
              />

              <Field
                label="Owner email"
                required
                value={ownerEmail}
                onChange={setOwnerEmail}
                placeholder="owner@business.com"
                type="email"
                icon={Mail}
              />

              <Field
                label="Temporary password"
                required
                value={ownerPassword}
                onChange={setOwnerPassword}
                placeholder="Minimum 8 characters"
                type="password"
                icon={ShieldCheck}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#eeeeea] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-[#deded9] bg-white px-5 text-sm font-semibold text-[#666661] transition hover:bg-[#f5f5f2] disabled:opacity-50"
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
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 size={16} />
                  Create Tenant
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon?: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-[#393936]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa9a4]">
            <Icon size={15} />
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={type === "password" ? 8 : undefined}
          className={[
            "h-11 w-full rounded-xl border border-[#deded9] bg-[#fafaf8] pr-3 text-sm text-[#333330] outline-none transition",
            Icon ? "pl-10" : "px-3",
            "placeholder:text-[#aaa9a4] focus:border-[#555550] focus:bg-white focus:ring-4 focus:ring-[#111111]/5",
          ].join(" ")}
        />
      </div>
    </div>
  );
}
