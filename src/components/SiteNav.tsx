"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getCart, seedStore } from "@/lib/store";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    seedStore();
    const refresh = () => setCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
    refresh();
    window.addEventListener("tb-store", refresh);
    return () => window.removeEventListener("tb-store", refresh);
  }, []);

  const links = [
    ["Home", "/"],
    ["Cakes", "/cakes"],
    ["Pastries", "/snacks"],
    ["Snacks", "/snacks"],
    ["Contact", "/account"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9dfd2]/70 bg-[#fbf8f2]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="font-serif text-xl font-semibold text-[#33231d]">
          Thirumala <span className="text-[#a56b48]">Bakery</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-[#66564e] md:flex">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-[#a56b48]">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 text-[#4b3931]">
          <button className="hidden rounded-full p-2.5 hover:bg-white md:block" aria-label="Search">
            <Search size={18} />
          </button>
          <Link href="/account" className="rounded-full p-2.5 hover:bg-white" aria-label="Account">
            <UserRound size={18} />
          </Link>
          <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-white" aria-label="Cart">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8f5b3e] px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button className="rounded-full p-2.5 md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#e9dfd2] bg-[#fbf8f2] px-5 py-4 md:hidden">
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block border-b border-[#eee4da] py-3 text-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
