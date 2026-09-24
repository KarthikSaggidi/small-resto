"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/store";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => setProducts(getProducts()), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [query, products]);

  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[#fbf8f3]">
        <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a26748]">
            Find your favourite
          </p>
          <h1 className="mt-3 font-serif text-5xl text-[#342219]">
            Search
          </h1>

          <div className="relative mt-8">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9a8172]"
            />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cakes, pastries, snacks..."
              className="w-full rounded-full border border-[#e0d3c5] bg-white py-4 pl-14 pr-5 text-sm outline-none focus:border-[#a26748]"
            />
          </div>

          {query && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {query && !results.length && (
            <div className="mt-16 text-center text-sm text-[#806b5d]">
              No products found for “{query}”.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
