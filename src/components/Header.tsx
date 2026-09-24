"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X
} from "lucide-react";
import { getCart } from "@/lib/store";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = () => {
    setCartCount(
      getCart().reduce((sum, item) => sum + item.quantity, 0)
    );
  };

  useEffect(() => {
    refreshCart();

    window.addEventListener("thirumala-cart-updated", refreshCart);
    return () =>
      window.removeEventListener("thirumala-cart-updated", refreshCart);
  }, []);

  const links = [
    ["Home", "/"],
    ["Cakes", "/cakes"],
    ["Pastries", "/pastries"],
    ["Snacks", "/snacks"],
    ["Contact", "/contact"]
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#eadfd0]/80 bg-[#fbf8f3]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[78px] max-w-[1400px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="group">
          <div className="font-serif text-[25px] font-bold tracking-[-0.03em] text-[#342219]">
            Thirumala
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.32em] text-[#9a7358]">
            Bakery
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-[13px] font-medium text-[#604a3b] transition hover:text-[#a35f3b]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="rounded-full p-2.5 text-[#4b382d] transition hover:bg-[#efe5d9]"
          >
            <Search size={19} strokeWidth={1.7} />
          </Link>

          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-full p-2.5 text-[#4b382d] transition hover:bg-[#efe5d9] sm:block"
          >
            <UserRound size={19} strokeWidth={1.7} />
          </Link>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2.5 text-[#4b382d] transition hover:bg-[#efe5d9]"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#9b5938] px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full p-2.5 text-[#4b382d] md:hidden"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#eadfd0] bg-[#fbf8f3] px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-[#604a3b]"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-[#604a3b]"
            >
              My Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
