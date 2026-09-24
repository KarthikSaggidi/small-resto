"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import AddTenantModal from "@/components/super-admin/AddTenantModal";

export default function TenantsPageClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999994]">
            Platform
          </p>

          <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.045em] text-[#171717]">
            Tenants
          </h1>

          <p className="mt-2 text-sm text-[#777772]">
            Manage every business using the DropXcorp platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#292927]"
        >
          <Plus size={17} />
          Add Tenant
        </button>
      </div>

      {children}

      <AddTenantModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
