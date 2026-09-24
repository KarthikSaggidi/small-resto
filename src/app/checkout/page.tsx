"use client";

import Link from "next/link";
import { Check, CreditCard, MapPin } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { CartItem, getCart, placeOrder } from "@/lib/store";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [done, setDone] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  useEffect(() => setCart(getCart()), []);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= 999 ? 0 : 49;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!cart.length) return;
    const order = placeOrder({
      customerName: form.name,
      mobile: form.phone,
      email: form.email,
      address: form.address,
      items: cart,
      subtotal,
      delivery: true,
      total: subtotal + deliveryFee,
      payment: "Cash on Pickup",
      pickup: true,
    });
    setDone(order.id);
  }

  if (done) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e8f1e8] text-[#4d754f]"><Check /></div>
        <p className="mt-5 text-[10px] tracking-[.25em] text-[#a06a4a]">ORDER PLACED</p>
        <h1 className="mt-2 font-serif text-5xl">Thank you.</h1>
        <p className="mt-4 text-sm leading-7 text-[#806e65]">Your pickup order <strong>{done}</strong> has been received. The bakery team can update its status from the admin panel.</p>
        <Link href="/account" className="mt-7 inline-block rounded-full bg-[#382820] px-6 py-3 text-sm font-semibold text-white">View my order</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-[10px] tracking-[.25em] text-[#a06a4a]">CHECKOUT</p>
      <h1 className="mt-2 font-serif text-5xl">Place your order</h1>

      {!cart.length ? (
        <div className="mt-8 rounded-3xl border border-[#e6d9cd] bg-white p-10 text-center">
          Your cart is empty. <Link className="text-[#8f5b3e]" href="/cakes">Shop cakes</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="rounded-[28px] border border-[#e6d9cd] bg-white p-6 md:p-8">
            <div className="flex items-center gap-3"><MapPin size={20} /><h2 className="font-serif text-2xl">Pickup details</h2></div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["name", "Full name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["address", "Pickup note / address"],
              ].map(([key, label]) => (
                <label key={key} className={key === "address" ? "md:col-span-2" : ""}>
                  <span className="mb-2 block text-xs font-semibold text-[#6e5a51]">{label}</span>
                  <input
                    required={key !== "email"}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl border border-[#ded2c7] bg-[#fcfaf7] px-4 py-3 text-sm outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-7 rounded-2xl bg-[#f8f2ec] p-4 text-xs text-[#79675e]">
              <CreditCard size={15} className="mr-2 inline" /> Payment: <strong>Cash on Pickup</strong>
            </div>
            <button className="mt-6 w-full rounded-full bg-[#382820] py-3.5 text-sm font-semibold text-white">Place pickup order</button>
          </form>

          <aside className="h-fit rounded-[28px] bg-[#382820] p-6 text-white">
            <h2 className="font-serif text-2xl">Summary</h2>
            <div className="mt-5 space-y-3 text-sm text-[#dac9bf]">
              {cart.map((i) => (
                <div className="flex justify-between gap-3" key={`${i.id}-${i.size}`}>
                  <span>{i.name} × {i.quantity}</span><span>₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>
            <div className="my-5 border-t border-white/15" />
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="mt-2 flex justify-between text-sm"><span>Pickup</span><span>{deliveryFee ? `₹${deliveryFee}` : "Free"}</span></div>
            <div className="mt-5 flex justify-between text-lg font-semibold"><span>Total</span><span>₹{subtotal + deliveryFee}</span></div>
          </aside>
        </div>
      )}
    </main>
  );
}
