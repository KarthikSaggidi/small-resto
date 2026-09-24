"use client";

import { useEffect, useMemo, useState } from "react";
import { getProducts, Product, seedStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

export default function SnacksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    seedStore();
    const load = () => setProducts(getProducts().filter((p) => p.category === "snacks"));
    load();
    window.addEventListener("tb-store", load);
    return () => window.removeEventListener("tb-store", load);
  }, []);

  const list = useMemo(() => products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [products, q]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[.28em] text-[#8f5b3e]">FROM THE OVEN</p>
          <h1 className="mt-2 font-serif text-5xl md:text-6xl">Pastries & snacks</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#806e65]">Small treats, fresh bakes and everyday favourites. Perfect for pickup on the way home.</p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search snacks..." className="w-full rounded-full border border-[#ded2c7] bg-white px-5 py-3 text-sm outline-none md:w-64" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </main>
  );
}
