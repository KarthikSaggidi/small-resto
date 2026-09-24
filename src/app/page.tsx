"use client";

import Link from "next/link";
import {
  ArrowRight,
  CakeSlice,
  Check,
  Clock3,
  Heart,
  MapPin,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f3eb] text-[#30251f]">
      {/* =========================
          HEADER
      ========================== */}
      <header className="sticky top-0 z-50 border-b border-[#30251f]/[0.08] bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-[78px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-16">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-[19px] tracking-[0.12em] text-[#30251f] no-underline md:text-[21px]"
          >
            <span className="font-bold">THIRUMALA</span>{" "}
            <span className="font-normal">BAKERY</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link href="/" className={navStyle}>
              Home
            </Link>

            <Link href="/cakes" className={navStyle}>
              Cakes
            </Link>

            <Link href="/pastries" className={navStyle}>
              Pastries
            </Link>

            <Link href="/snacks" className={navStyle}>
              Snacks
            </Link>

            <Link href="/contact" className={navStyle}>
              Contact
            </Link>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-4 md:gap-5">
            <Link
              href="/search"
              aria-label="Search"
              className="text-[#30251f] transition-opacity hover:opacity-60"
            >
              <Search size={19} strokeWidth={1.7} />
            </Link>

            <Link
              href="/account"
              aria-label="Account"
              className="hidden text-[#30251f] transition-opacity hover:opacity-60 sm:block"
            >
              <UserRound size={19} strokeWidth={1.7} />
            </Link>

            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative text-[#30251f] transition-opacity hover:opacity-60"
            >
              <ShoppingBag size={20} strokeWidth={1.7} />

              <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#30251f] px-1 text-[9px] font-semibold text-white">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================
          HERO
      ========================== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid min-h-[680px] max-w-[1440px] items-center gap-14 px-6 py-16 md:px-10 md:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:px-16 lg:py-24">
          {/* Hero Content */}
          <div className="relative z-10 max-w-[650px]">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-9 bg-[#30251f]/40" />

              <p className="m-0 text-[10px] font-bold tracking-[0.32em] text-[#756960]">
                BAKED WITH LOVE
              </p>
            </div>

            <h1 className="m-0 font-serif text-[54px] font-normal leading-[0.98] tracking-[-0.035em] md:text-[70px] lg:text-[82px]">
              Sweet Moments
              <br />
              <span className="italic">Made Simple</span>
            </h1>

            <p className="mt-7 max-w-[520px] text-[15px] leading-8 text-[#756960] md:text-[17px]">
              Freshly baked cakes, pastries and snacks made to make your
              moments special. Order online and pick up your favourites fresh
              from Thirumala Bakery.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/cakes" className={primaryButton}>
                Order a Cake
                <ArrowRight size={17} strokeWidth={1.8} />
              </Link>

              <Link href="/cart" className={secondaryButton}>
                Place a Pickup Order
              </Link>
            </div>

            {/* Small Trust Details */}
            <div className="mt-11 flex flex-wrap gap-x-7 gap-y-4 text-[12px] text-[#756960]">
              <div className="flex items-center gap-2">
                <Check size={14} />
                Freshly baked
              </div>

              <div className="flex items-center gap-2">
                <Check size={14} />
                Quality ingredients
              </div>

              <div className="flex items-center gap-2">
                <Check size={14} />
                Easy pickup
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative flex min-h-[430px] items-center justify-center md:min-h-[520px]">
            {/* Background Glow */}
            <div className="absolute h-[400px] w-[400px] rounded-full bg-[#eadfd2]/70 blur-3xl md:h-[520px] md:w-[520px]" />

            {/* Glass Frame */}
            <div className="relative h-[390px] w-full max-w-[560px] overflow-hidden rounded-[36px] border border-white/70 bg-white/35 shadow-[0_30px_100px_rgba(65,45,30,0.10)] backdrop-blur-xl md:h-[500px]">
              {/* Decorative circles */}
              <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full border border-white/60" />

              <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border border-white/50" />

              {/* Cake */}
              <div className="absolute left-1/2 top-1/2 w-[250px] -translate-x-1/2 -translate-y-1/2 md:w-[310px]">
                {/* Cake top */}
                <div className="relative z-20 h-[105px] rounded-[50%] bg-gradient-to-b from-[#fffdfa] to-[#f1e6da] shadow-[0_25px_35px_rgba(70,45,30,0.13)] md:h-[125px]">
                  <div className="absolute left-[17%] right-[17%] top-[27px] h-[38px] rounded-[50%] bg-[#f1d8c7]/80" />

                  <div className="absolute left-[27%] top-[18px] h-3 w-3 rounded-full bg-[#b88c73]/70" />
                  <div className="absolute left-[40%] top-[13px] h-2 w-2 rounded-full bg-[#b88c73]/60" />
                  <div className="absolute right-[28%] top-[22px] h-3 w-3 rounded-full bg-[#b88c73]/60" />
                </div>

                {/* Cake body */}
                <div className="-mt-8 h-[105px] rounded-b-[42px] bg-gradient-to-b from-[#f6eadf] to-[#dfc8b5] shadow-[0_30px_40px_rgba(70,45,30,0.16)] md:h-[130px]" />

                {/* Plate */}
                <div className="absolute -bottom-8 left-1/2 h-7 w-[310px] -translate-x-1/2 rounded-[50%] bg-white/80 shadow-[0_15px_25px_rgba(60,40,25,0.12)] md:w-[370px]" />
              </div>

              {/* Floating Label */}
              <div className="absolute bottom-6 left-6 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 shadow-lg backdrop-blur-xl md:bottom-8 md:left-8">
                <p className="m-0 text-[9px] font-bold tracking-[0.22em] text-[#8a786c]">
                  TODAY'S FAVOURITE
                </p>

                <p className="mt-1 font-serif text-[17px] text-[#30251f]">
                  Fresh Cream Cake
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TRUST STRIP
      ========================== */}
      <section className="border-y border-[#30251f]/[0.07] bg-white/35">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
          <TrustItem
            icon={<CakeSlice size={20} strokeWidth={1.5} />}
            title="Freshly Baked"
            text="Made fresh for you"
          />

          <TrustItem
            icon={<Heart size={20} strokeWidth={1.5} />}
            title="Made With Love"
            text="For every celebration"
          />

          <TrustItem
            icon={<Clock3 size={20} strokeWidth={1.5} />}
            title="Easy Pickup"
            text="Order ahead & collect"
          />

          <TrustItem
            icon={<Sparkles size={20} strokeWidth={1.5} />}
            title="Quality First"
            text="Carefully selected ingredients"
          />
        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================== */}
      <section className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28 lg:px-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-[#8a786c]">
              EXPLORE OUR MENU
            </p>

            <h2 className="m-0 font-serif text-[40px] font-normal tracking-[-0.025em] md:text-[50px]">
              Something for every moment.
            </h2>
          </div>

          <Link
            href="/cakes"
            className="group inline-flex items-center gap-2 text-sm text-[#30251f]"
          >
            View all
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <CategoryCard
            href="/cakes"
            number="01"
            title="Cakes"
            description="Beautiful cakes made for birthdays, celebrations and special moments."
            visual="cake"
          />

          <CategoryCard
            href="/pastries"
            number="02"
            title="Pastries"
            description="Freshly baked favourites for your morning, evening or anytime craving."
            visual="pastry"
          />

          <CategoryCard
            href="/snacks"
            number="03"
            title="Snacks"
            description="Delicious savoury bites prepared fresh for every little break."
            visual="snack"
          />
        </div>
      </section>

      {/* =========================
          FEATURED CTA
      ========================== */}
      <section className="px-6 pb-20 md:px-10 md:pb-28 lg:px-16">
        <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-[32px] bg-[#30251f] md:grid-cols-[1.15fr_0.85fr]">
          <div className="px-7 py-14 md:px-12 md:py-16 lg:px-16">
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#d8ccc4]">
              FOR YOUR SPECIAL DAY
            </p>

            <h2 className="mt-5 max-w-[620px] font-serif text-[40px] font-normal leading-[1.05] text-white md:text-[52px]">
              Make your celebration a little sweeter.
            </h2>

            <p className="mt-5 max-w-[530px] text-[14px] leading-7 text-[#d8ccc4]">
              From simple family celebrations to unforgettable milestones,
              choose a cake made especially for your moment.
            </p>

            <Link
              href="/cakes/customize"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm text-[#30251f] no-underline transition-transform hover:-translate-y-0.5"
            >
              Customize Your Cake
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative min-h-[300px] overflow-hidden bg-[#e8d8c9]">
            <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-2xl" />

            <div className="absolute left-1/2 top-1/2 h-[150px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-white shadow-[0_30px_50px_rgba(50,30,20,0.15)]">
              <div className="absolute left-8 right-8 top-7 h-9 rounded-[50%] bg-[#f1d8c7]" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          PICKUP CTA
      ========================== */}
      <section className="border-t border-[#30251f]/[0.07] bg-white/30">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-10 lg:px-16">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-[#8a786c]">
              <MapPin size={13} />
              PICKUP FROM THIRUMALA BAKERY
            </p>

            <h2 className="font-serif text-[34px] font-normal md:text-[42px]">
              Order ahead. Pick up fresh.
            </h2>

            <p className="mt-3 max-w-[520px] text-sm leading-7 text-[#756960]">
              Skip the wait and have your favourite cakes, pastries and snacks
              ready when you arrive.
            </p>
          </div>

          <Link href="/cart" className={primaryButton}>
            Start Your Order
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="bg-[#30251f] text-white">
        <div className="mx-auto max-w-[1440px] px-6 py-14 md:px-10 md:py-16 lg:px-16">
          <div className="grid gap-12 md:grid-cols-[1.5fr_0.7fr_0.7fr_1fr]">
            {/* Brand */}
            <div>
              <Link
                href="/"
                className="text-[20px] tracking-[0.12em] text-white no-underline"
              >
                <span className="font-bold">THIRUMALA</span>{" "}
                <span className="font-normal">BAKERY</span>
              </Link>

              <p className="mt-5 max-w-[380px] text-sm leading-7 text-[#d8ccc4]">
                Freshly baked cakes, pastries and snacks made with care for
                life's sweetest moments.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.22em] text-white">
                EXPLORE
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm">
                <FooterLink href="/" label="Home" />
                <FooterLink href="/cakes" label="Cakes" />
                <FooterLink href="/pastries" label="Pastries" />
                <FooterLink href="/snacks" label="Snacks" />
              </div>
            </div>

            {/* Customer */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.22em] text-white">
                CUSTOMER
              </h3>

              <div className="mt-5 flex flex-col gap-3 text-sm">
                <FooterLink href="/account" label="My Account" />
                <FooterLink href="/cart" label="Cart" />
                <FooterLink href="/search" label="Search" />
                <FooterLink href="/contact" label="Contact" />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[11px] font-bold tracking-[0.22em] text-white">
                CONTACT
              </h3>

              <div className="mt-5 space-y-3 text-sm text-[#d8ccc4]">
                <p className="leading-6">
                  Thirumala Bakery
                  <br />
                  Freshly baked. Made with love.
                </p>

                <p>Call us for orders & enquiries</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#bfb2aa] md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Thirumala Bakery. All rights reserved.</p>

            <div className="flex gap-5">
              <Link
                href="/contact"
                className="text-[#bfb2aa] no-underline hover:text-white"
              >
                Privacy
              </Link>

              <Link
                href="/contact"
                className="text-[#bfb2aa] no-underline hover:text-white"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 border-r border-[#30251f]/[0.06] px-5 py-7 last:border-r-0 md:px-8">
      <div className="shrink-0 text-[#30251f]">{icon}</div>

      <div>
        <p className="m-0 text-[12px] font-semibold">{title}</p>

        <p className="mt-1 text-[10px] text-[#8a786c]">{text}</p>
      </div>
    </div>
  );
}

function CategoryCard({
  href,
  number,
  title,
  description,
  visual,
}: {
  href: string;
  number: string;
  title: string;
  description: string;
  visual: "cake" | "pastry" | "snack";
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[360px] overflow-hidden rounded-[28px] border border-[#30251f]/[0.07] bg-white/55 p-7 no-underline shadow-[0_15px_50px_rgba(65,45,30,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/75"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#9a897d]">
          {number}
        </span>

        <ArrowRight
          size={18}
          className="text-[#30251f] transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>

      {/* Minimal visual */}
      <div className="relative flex h-[175px] items-center justify-center">
        {visual === "cake" && (
          <div className="relative w-[180px]">
            <div className="h-[65px] rounded-[50%] bg-white shadow-[0_15px_25px_rgba(70,45,30,0.10)]" />
            <div className="-mt-4 h-[65px] rounded-b-[30px] bg-[#ead8c8]" />
            <div className="absolute left-1/2 top-[17px] h-3 w-3 -translate-x-1/2 rounded-full bg-[#c29a80]" />
          </div>
        )}

        {visual === "pastry" && (
          <div className="relative h-[110px] w-[190px] rotate-[-8deg] rounded-[55%] bg-gradient-to-br from-[#f8eee4] to-[#dcbda6] shadow-[0_20px_30px_rgba(70,45,30,0.12)]">
            <div className="absolute left-7 top-7 h-2 w-[150px] rounded-full bg-white/70" />
            <div className="absolute left-10 top-14 h-2 w-[125px] rounded-full bg-white/50" />
          </div>
        )}

        {visual === "snack" && (
          <div className="relative flex items-center gap-[-10px]">
            <div className="h-[105px] w-[105px] rotate-[-15deg] rounded-[35%] bg-[#dfc3a9] shadow-[0_20px_30px_rgba(70,45,30,0.12)]" />
            <div className="-ml-7 h-[105px] w-[105px] rotate-[12deg] rounded-[35%] bg-[#eddcc9] shadow-[0_20px_30px_rgba(70,45,30,0.12)]" />
          </div>
        )}
      </div>

      <div>
        <h3 className="font-serif text-[30px] font-normal text-[#30251f]">
          {title}
        </h3>

        <p className="mt-2 max-w-[320px] text-[13px] leading-6 text-[#756960]">
          {description}
        </p>
      </div>
    </Link>
  );
}

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="text-[#d8ccc4] no-underline transition-colors hover:text-white"
    >
      {label}
    </Link>
  );
}

/* =========================================================
   STYLES
========================================================= */

const navStyle =
  "text-[#6b5143] no-underline text-sm transition-colors";

const primaryButton =
  "flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2f251f] text-white no-underline text-sm transition-all";

const secondaryButton =
  "flex items-center justify-center px-6 py-3.5 rounded-xl border border-[#d8cfc7] text-[#2f251f] no-underline text-sm bg-white";