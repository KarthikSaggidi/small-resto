"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProducts, Product } from "@/lib/store";

export default function PastriesPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => setProducts(getProducts()), []);

  return (
    <>
      <Header />
      <main className="bg-[#fbf8f3]">
        <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a26748]">
            Fresh from the oven
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.045em] text-[#342219] md:text-7xl">
            Pastries
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#786457]">
            Small indulgences, freshly prepared for your coffee breaks,
            celebrations and cravings.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products
              .filter(p => p.category === "pastries")
              .map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
