import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#eadfd0] bg-[#f4eee6]">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-serif text-2xl font-bold text-[#342219]">
              Thirumala
            </div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-[#9a7358]">
              Bakery
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-[#715b4e]">
              Fresh Bakes. Happier Days. Beautiful cakes and bakery favourites
              made with care.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#342219]">
              Shop
            </h3>
            <div className="flex flex-col gap-3 text-sm text-[#715b4e]">
              <Link href="/cakes">Cakes</Link>
              <Link href="/pastries">Pastries</Link>
              <Link href="/snacks">Snacks</Link>
              <Link href="/cart">Cart</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#342219]">
              Company
            </h3>
            <div className="flex flex-col gap-3 text-sm text-[#715b4e]">
              <Link href="/">About Us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/account">My Account</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#342219]">
              Visit Us
            </h3>
            <p className="text-sm leading-7 text-[#715b4e]">
              SLN Green Space
              <br />
              Bahadurpally
              <br />
              Hyderabad, Telangana
              <br />
              India
            </p>
            <a
              href="tel:+917997005050"
              className="mt-3 block text-sm font-semibold text-[#9b5938]"
            >
              +91 79970 05050
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-[#dfd2c4] pt-6 text-xs text-[#806a5c] md:flex-row">
          <span>© 2026 Thirumala Bakery. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/contact">Privacy</Link>
            <Link href="/contact">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
