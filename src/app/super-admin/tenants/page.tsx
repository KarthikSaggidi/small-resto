import {
  Building2,
  Mail,
  Phone,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";

import TenantsPageClient from "@/components/super-admin/TenantsPageClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      tenantUsers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      },
      subscriptions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          plan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <main className="p-5 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <TenantsPageClient>
          {/* Search / filters */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative max-w-md flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa9a4]"
              />

              <input
                type="search"
                placeholder="Search tenants..."
                className="h-11 w-full rounded-xl border border-[#e5e5e0] bg-white pl-11 pr-4 text-sm text-[#222220] outline-none placeholder:text-[#aaa9a4] focus:border-[#777772]"
              />
            </div>

            <div className="flex h-11 items-center rounded-xl border border-[#e5e5e0] bg-white px-4 text-xs font-medium text-[#666661]">
              {tenants.length}{" "}
              {tenants.length === 1 ? "tenant" : "tenants"}
            </div>
          </div>

          {/* Tenant list */}
          <section className="overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white shadow-sm">
            {tenants.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eeeeeb] text-[#666661]">
                  <Building2 size={23} strokeWidth={1.7} />
                </div>

                <h2 className="mt-5 text-base font-semibold text-[#282825]">
                  No tenants yet
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#999994]">
                  Your businesses will appear here after you create their
                  tenant accounts.
                </p>

                <button
                  type="button"
                  className="mt-6 flex h-10 items-center gap-2 rounded-xl bg-[#111111] px-4 text-xs font-semibold text-white transition hover:bg-[#292927]"
                >
                  <Plus size={15} />
                  Create First Tenant
                </button>
              </div>
            ) : (
              <>
                {/* Desktop header */}
                <div className="hidden grid-cols-[1.7fr_1.2fr_1fr_1fr_120px] gap-4 border-b border-[#eeeeea] bg-[#fafaf8] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#999994] lg:grid">
                  <span>Business</span>
                  <span>Contact</span>
                  <span>Plan</span>
                  <span>Status</span>
                  <span>Users</span>
                </div>

                <div className="divide-y divide-[#eeeeea]">
                  {tenants.map((tenant) => {
                    const subscription = tenant.subscriptions[0];

                    return (
                      <Link
                        key={tenant.id}
                        href={`/super-admin/tenants/${tenant.id}`}
                        className="grid gap-5 px-6 py-5 transition-colors hover:bg-[#fafaf8] lg:grid-cols-[1.7fr_1.2fr_1fr_1fr_120px] lg:items-center lg:gap-4"
                      >
                        {/* Business */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eeeeeb] text-xs font-bold text-[#555550]">
                            {tenant.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#282825]">
                              {tenant.name}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#999994]">
                              {tenant.slug}
                              {tenant.businessType
                                ? ` · ${tenant.businessType}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-1">
                          {tenant.email && (
                            <div className="flex items-center gap-2 text-xs text-[#777772]">
                              <Mail size={13} />
                              <span className="truncate">
                                {tenant.email}
                              </span>
                            </div>
                          )}

                          {tenant.phone && (
                            <div className="flex items-center gap-2 text-xs text-[#777772]">
                              <Phone size={13} />
                              <span>{tenant.phone}</span>
                            </div>
                          )}

                          {!tenant.email && !tenant.phone && (
                            <span className="text-xs text-[#aaa9a4]">
                              No contact details
                            </span>
                          )}
                        </div>

                        {/* Plan */}
                        <div>
                          {subscription?.plan ? (
                            <>
                              <p className="text-xs font-semibold text-[#444440]">
                                {subscription.plan.name}
                              </p>

                              <p className="mt-1 text-[10px] text-[#aaa9a4]">
                                {subscription.status}
                              </p>
                            </>
                          ) : (
                            <span className="text-xs text-[#aaa9a4]">
                              No subscription
                            </span>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <StatusBadge status={tenant.status} />
                        </div>

                        {/* Users */}
                        <div className="flex items-center gap-2 text-xs text-[#666661]">
                          <Users size={14} />
                          <span>{tenant.tenantUsers.length}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </TenantsPageClient>
      </div>
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    TRIAL: "bg-blue-50 text-blue-700",
    SUSPENDED: "bg-red-50 text-red-700",
    INACTIVE: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold",
        styles[status] || "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {status}
    </span>
  );
}