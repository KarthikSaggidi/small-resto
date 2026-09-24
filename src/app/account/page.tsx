"use client";

import Link from "next/link";
import { Package, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { getOrders, Order } from "@/lib/store";

export default function AccountPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = () => setOrders(getOrders());
    load();
    window.addEventListener("tb-store", load);
    return () => window.removeEventListener("tb-store", load);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <div className="rounded-[28px] bg-[#eee3d7] p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white"><UserRound size={20} /></div>
        <p className="mt-5 text-[10px] tracking-[.25em] text-[#8f5b3e]">MY BAKERY</p>
        <h1 className="mt-2 font-serif text-5xl">Your orders</h1>
        <p className="mt-3 text-sm text-[#77655c]">Track pickup orders placed from this browser.</p>
      </div>

      <div className="mt-8 space-y-3">
        {!orders.length ? (
          <div className="rounded-2xl border border-[#e6d9cd] bg-white p-8 text-center">
            <Package className="mx-auto text-[#9a725b]" />
            <p className="mt-3 text-sm text-[#806e65]">No orders yet.</p>
            <Link href="/cakes" className="mt-5 inline-block rounded-full bg-[#382820] px-5 py-3 text-sm text-white">Start shopping</Link>
          </div>
        ) : orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-[#e6d9cd] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-semibold">{o.id}</p><p className="mt-1 text-xs text-[#88756d]">{new Date(o.createdAt).toLocaleString()}</p></div>
              <span className="rounded-full bg-[#f4e9df] px-3 py-1 text-xs font-semibold text-[#8f5b3e]">{o.status}</span>
            </div>
            <div className="mt-4 flex justify-between gap-2 text-sm"><span>{o.items.reduce((s, i) => s + i.quantity, 0)} items · Pickup</span><strong>₹{o.total}</strong></div>
          </div>
        ))}
      </div>
    </main>
  );
}
