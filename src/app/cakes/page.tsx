"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CakeSlice, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProducts, Product, seedStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";

export default function CakesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    seedStore();

    const load = () => {
      const cakes = getProducts().filter(
        (p) => p.category?.toLowerCase() === "cakes"
      );

      setProducts(cakes);
    };

    load();

    window.addEventListener("tb-store", load);
    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("tb-store", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const list = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return products;

    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    });
  }, [products, q]);

  return (
    <main className="min-h-screen bg-[#f8f3eb] text-[#30251f]">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-6 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14 lg:px-16">
          <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/45 px-7 py-12 shadow-[0_25px_80px_rgba(65,45,30,0.06)] backdrop-blur-xl md:px-12 md:py-16 lg:px-16 lg:py-20">
            {/* Decorative background */}
            <div className="pointer-events-none absolute -right-28 -top-28 h-[300px] w-[300px] rounded-full border border-white/70" />

            <div className="pointer-events-none absolute -bottom-40 right-10 h-[320px] w-[320px] rounded-full bg-[#eadfd2]/60 blur-3xl" />

            <div className="relative z-10 max-w-[760px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-8 bg-[#30251f]/40" />

                <p className="m-0 text-[10px] font-bold tracking-[0.3em] text-[#8a786c]">
                  THE CAKE COUNTER
                </p>
              </div>

              <h1 className="m-0 font-serif text-[48px] font-normal leading-[1.02] tracking-[-0.035em] md:text-[66px] lg:text-[76px]">
                Cakes made for
                <br />
                <span className="italic">your moment.</span>
              </h1>

              <p className="mt-6 max-w-[610px] text-[14px] leading-7 text-[#756960] md:text-[16px]">
                From classic favourites to cakes made especially for your
                celebration, discover freshly baked cakes prepared with care
                at Thirumala Bakery.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#cakes"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#30251f] px-6 py-3.5 text-[13px] text-white no-underline transition-transform hover:-translate-y-0.5"
                >
                  Explore Cakes
                  <ArrowRight size={16} strokeWidth={1.8} />
                </Link>

                <Link
                  href="#custom"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#30251f]/25 bg-white/45 px-6 py-3.5 text-[13px] text-[#30251f] no-underline backdrop-blur-md transition-colors hover:bg-white/70"
                >
                  Create a Custom Cake
                  <ArrowUpRight size={16} strokeWidth={1.7} />
                </Link>
              </div>
            </div>

            {/* Minimal cake visual */}
            <div className="absolute bottom-[-35px] right-[5%] hidden h-[270px] w-[310px] items-center justify-center lg:flex">
              <div className="absolute h-[250px] w-[250px] rounded-full bg-[#eadfd2]/70 blur-3xl" />

              <div className="relative w-[230px]">
                {/* Cake top */}
                <div className="relative z-20 h-[88px] rounded-[50%] bg-gradient-to-b from-white to-[#f2e6da] shadow-[0_22px_30px_rgba(60,40,25,0.12)]">
                  <div className="absolute left-[18%] right-[18%] top-[27px] h-[31px] rounded-[50%] bg-[#f1d8c7]" />

                  <span className="absolute left-[28%] top-[18px] h-2.5 w-2.5 rounded-full bg-[#b88c73]/60" />
                  <span className="absolute right-[28%] top-[24px] h-2.5 w-2.5 rounded-full bg-[#b88c73]/60" />
                </div>

                {/* Cake body */}
                <div className="-mt-6 h-[100px] rounded-b-[35px] bg-gradient-to-b from-[#f4e8dd] to-[#dcc2ae] shadow-[0_28px_35px_rgba(60,40,25,0.14)]" />

                {/* Plate */}
                <div className="absolute -bottom-7 left-1/2 h-6 w-[285px] -translate-x-1/2 rounded-[50%] bg-white/80 shadow-[0_12px_20px_rgba(60,40,25,0.10)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK INFO
      ====================================================== */}
      <section className="border-y border-[#30251f]/[0.07] bg-white/30">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
          <InfoItem
            number="01"
            title="Freshly Baked"
            text="Prepared fresh"
          />

          <InfoItem
            number="02"
            title="Classic Flavours"
            text="Made for everyone"
          />

          <InfoItem
            number="03"
            title="Custom Designs"
            text="Made for your event"
          />

          <InfoItem
            number="04"
            title="Easy Pickup"
            text="Order ahead"
          />
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}
      <section
        id="cakes"
        className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-24 lg:px-16"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-[#9a6950]">
              FRESH TODAY
            </p>

            <h2 className="m-0 font-serif text-[40px] font-normal tracking-[-0.025em] md:text-[48px]">
              Our cakes
            </h2>

            <p className="mt-3 max-w-[500px] text-sm leading-7 text-[#756960]">
              Choose from our freshly baked favourites and find something
              perfect for your celebration.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-[290px]">
            <Search
              size={17}
              strokeWidth={1.7}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a786c]"
            />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cakes..."
              className="h-[48px] w-full rounded-full border border-[#ded2c7] bg-white/65 pl-11 pr-5 text-sm text-[#30251f] outline-none backdrop-blur-xl transition-all placeholder:text-[#9a8a80] focus:border-[#30251f]/30 focus:bg-white"
            />
          </div>
        </div>

        {/* Product count */}
        <div className="mt-8 flex items-center justify-between border-b border-[#30251f]/[0.07] pb-4">
          <p className="m-0 text-[11px] tracking-[0.12em] text-[#8a786c]">
            {list.length} {list.length === 1 ? "CAKE" : "CAKES"}
          </p>

          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="border-0 bg-transparent text-[11px] text-[#756960] underline underline-offset-4"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Product grid */}
        {list.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[28px] border border-[#e2d7cd] bg-white/55 px-6 py-16 text-center backdrop-blur-xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f0e4d9] text-[#8f6751]">
              <CakeSlice size={23} strokeWidth={1.5} />
            </div>

            <h3 className="mt-5 font-serif text-2xl">
              No cakes found
            </h3>

            <p className="mx-auto mt-2 max-w-[400px] text-sm leading-6 text-[#806e65]">
              We couldn't find a cake matching your search. Try another name
              or browse all our cakes.
            </p>

            <button
              type="button"
              onClick={() => setQ("")}
              className="mt-6 rounded-full bg-[#30251f] px-5 py-3 text-xs font-semibold text-white"
            >
              View all cakes
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          CUSTOM CAKE
      ====================================================== */}
      <section
        id="custom"
        className="px-6 pb-20 md:px-10 md:pb-28 lg:px-16"
      >
        <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[32px] bg-[#30251f]">
          <div className="grid md:grid-cols-[1.1fr_0.9fr]">
            {/* Content */}
            <div className="px-7 py-12 md:px-12 md:py-14 lg:px-16 lg:py-16">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white">
                <CakeSlice size={21} strokeWidth={1.5} />
              </div>

              <p className="mt-7 text-[10px] font-bold tracking-[0.3em] text-[#d8ccc4]">
                CUSTOM CAKE
              </p>

              <h2 className="mt-4 max-w-[600px] font-serif text-[38px] font-normal leading-[1.05] text-white md:text-[50px]">
                Tell us what
                <br />
                you&apos;re celebrating.
              </h2>

              <p className="mt-5 max-w-[540px] text-sm leading-7 text-[#d8ccc4]">
                For custom themes, names and photo cakes, submit a request and
                we&apos;ll confirm the design and final price with you.
              </p>

              <Link
                href="/cakes/customize"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[13px] font-medium text-[#30251f] no-underline transition-transform hover:-translate-y-0.5"
              >
                Request a Custom Cake
                <Sparkles size={15} strokeWidth={1.7} />
              </Link>
            </div>

            {/* Steps */}
            <div className="border-t border-white/10 bg-white/[0.035] p-7 md:border-l md:border-t-0 md:p-10">
              <div className="flex h-full flex-col justify-center gap-3">
                <CustomStep
                  number="01"
                  title="Choose your size"
                  description="Select the cake size that fits your celebration."
                />

                <CustomStep
                  number="02"
                  title="Choose your style"
                  description="Classic, photo, theme or something completely yours."
                />

                <CustomStep
                  number="03"
                  title="Confirm your design"
                  description="We’ll connect with you and finalise the details."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}
      <section className="border-t border-[#30251f]/[0.07] bg-white/30">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-7 px-6 py-16 md:flex-row md:items-center md:px-10 lg:px-16">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[0.28em] text-[#8a786c]">
              READY TO ORDER?
            </p>

            <h2 className="font-serif text-[34px] font-normal md:text-[42px]">
              Your perfect cake is waiting.
            </h2>

            <p className="mt-2 text-sm text-[#756960]">
              Pick your favourite and place your pickup order.
            </p>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-3 rounded-full bg-[#30251f] px-6 py-3.5 text-[13px] text-white no-underline transition-transform hover:-translate-y-0.5"
          >
            Place a Pickup Order
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="border-r border-[#30251f]/[0.06] px-5 py-7 last:border-r-0 md:px-8">
      <p className="m-0 text-[9px] font-bold tracking-[0.2em] text-[#a06a4a]">
        {number}
      </p>

      <p className="mt-2 text-[12px] font-semibold text-[#30251f]">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-[#8a786c]">{text}</p>
    </div>
  );
}

/* =========================================================
   CUSTOM STEP
========================================================= */

function CustomStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start gap-4">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#c9b7aa]">
          {number}
        </span>

        <div>
          <h3 className="m-0 text-sm font-semibold text-white">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-[#bfb1a9]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}