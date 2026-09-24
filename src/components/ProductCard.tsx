"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { addToCart, Product } from "@/lib/store";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  function add() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  }

  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#eadfd4] bg-white shadow-[0_8px_30px_rgba(78,50,35,.05)]">
      <div className="overflow-hidden bg-[#f4eee7]">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3 md:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-semibold text-[#382820]">{product.name}</h3>
          <span className="whitespace-nowrap text-sm font-semibold text-[#8f5b3e]">₹{product.price}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 min-h-8 text-[11px] leading-4 text-[#8a7770]">{product.description}</p>
        <button
          onClick={add}
          disabled={(product.stock ?? 0) <= 0}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#382820] py-2.5 text-xs font-medium text-white hover:bg-[#8f5b3e] disabled:opacity-40"
        >
          <ShoppingBag size={13} />
          {added ? "Added to cart" : (product.stock ?? 0) > 0 ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </article>
  );
}
