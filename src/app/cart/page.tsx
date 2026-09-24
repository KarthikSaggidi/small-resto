"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CartItem, getCart, removeFromCart, updateCartQty } from "@/lib/store";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const load = () => setCart(getCart());
    load();
    window.addEventListener("tb-store", load);
    return () => window.removeEventListener("tb-store", load);
  }, []);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = subtotal >= 999 || subtotal === 0 ? 0 : 49;

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <p className="text-[10px] tracking-[.25em] text-[#a06a4a]">YOUR BAG</p>
      <h1 className="mt-2 font-serif text-5xl">Cart</h1>

      {!cart.length ? (
        <div className="mt-10 rounded-[28px] border border-[#e6d9cd] bg-white p-12 text-center">
          <ShoppingBag className="mx-auto text-[#a06a4a]" size={36} />
          <h2 className="mt-4 font-serif text-3xl">Your cart is empty</h2>
          <p className="mt-2 text-sm text-[#85736b]">Add a cake or a fresh snack to get started.</p>
          <Link href="/cakes" className="mt-6 inline-block rounded-full bg-[#382820] px-6 py-3 text-sm font-semibold text-white">Browse cakes</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size || ""}`} className="flex gap-4 rounded-2xl border border-[#e8ddd2] bg-white p-3">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.size && <p className="mt-1 text-xs text-[#8b7870]">Size: {item.size}</p>}
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-[#9a7561]"><Trash2 size={16} /></button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-[#ded2c7]">
                      <button onClick={() => updateCartQty(item.id, item.quantity - 1, item.size)} className="p-2"><Minus size={13} /></button>
                      <span className="w-7 text-center text-xs">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, item.quantity + 1, item.size)} className="p-2"><Plus size={13} /></button>
                    </div>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-[26px] bg-[#382820] p-6 text-white">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <div className="mt-6 space-y-3 text-sm text-[#d9c8be]">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span>Pickup / delivery</span><span>{delivery ? `₹${delivery}` : "Free"}</span></div>
            </div>
            <div className="my-5 border-t border-white/15" />
            <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>₹{subtotal + delivery}</span></div>
            <Link href="/checkout" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#382820]">
              Checkout <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
