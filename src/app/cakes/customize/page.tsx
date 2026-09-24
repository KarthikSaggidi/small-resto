"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { addToCart, Product } from "@/lib/store";

const flavours = [
  { name: "Chocolate Truffle", price: 899 },
  { name: "Vanilla", price: 699 },
  { name: "Red Velvet", price: 999 },
  { name: "Butterscotch", price: 799 },
  { name: "Strawberry", price: 849 }
];

const weights = [
  { name: "0.5 KG", multiplier: 0.6 },
  { name: "1 KG", multiplier: 1 },
  { name: "1.5 KG", multiplier: 1.45 },
  { name: "2 KG", multiplier: 1.85 },
  { name: "3 KG", multiplier: 2.65 }
];

export default function CustomizePage() {
  const [flavour, setFlavour] = useState(flavours[0]);
  const [weight, setWeight] = useState(weights[1]);
  const [message, setMessage] = useState("Happy Birthday!");
  const [theme, setTheme] = useState("Classic");

  const price = useMemo(
    () => Math.round(flavour.price * weight.multiplier),
    [flavour, weight]
  );

  const product: Product = {
    id: `custom-${flavour.name.toLowerCase().replaceAll(" ", "-")}-${weight.name}`,
    name: `Custom ${flavour.name} Cake`,
    category: "cakes",
    price,
    image:
      flavour.name === "Chocolate Truffle"
        ? "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1000&q=90"
        : "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&q=90",
    description: `Custom ${flavour.name} cake in ${weight.name} size.`,
  };

  return (
    <>
      <Header />

      <main className="bg-[#f7f2eb]">
        <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a26748]">
              Cake Studio
            </p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.045em] text-[#342219] md:text-6xl">
              Design your cake.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#786457]">
              Build your cake on the left and see your creation come together
              instantly on the right.
            </p>
          </div>

          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[32px] border border-[#e3d6c8] bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-serif text-2xl text-[#342219]">
                Choose your details
              </h2>

              <div className="mt-7">
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#70584a]">
                  Flavour
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {flavours.map(item => (
                    <button
                      key={item.name}
                      onClick={() => setFlavour(item)}
                      className={`rounded-2xl border p-3 text-left text-sm transition ${
                        flavour.name === item.name
                          ? "border-[#9b5938] bg-[#f7ebe1] text-[#7e4c35]"
                          : "border-[#e7dbce] text-[#6d584b]"
                      }`}
                    >
                      <span className="block font-semibold">{item.name}</span>
                      <span className="mt-1 block text-xs opacity-70">
                        From ₹{item.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#70584a]">
                  Weight
                </label>
                <div className="flex flex-wrap gap-2">
                  {weights.map(item => (
                    <button
                      key={item.name}
                      onClick={() => setWeight(item)}
                      className={`rounded-full px-4 py-2.5 text-xs font-bold ${
                        weight.name === item.name
                          ? "bg-[#342219] text-white"
                          : "border border-[#e2d5c7] bg-[#fcfaf7] text-[#6b5548]"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7">
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#70584a]">
                  Cake theme
                </label>
                <select
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="w-full rounded-2xl border border-[#e2d5c7] bg-[#fcfaf7] px-4 py-3 text-sm text-[#4e3a2f] outline-none"
                >
                  <option>Classic</option>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Kids</option>
                  <option>Elegant</option>
                  <option>Floral</option>
                </select>
              </div>

              <div className="mt-7">
                <label className="mb-3 block text-xs font-bold uppercase tracking-[0.16em] text-[#70584a]">
                  Cake message
                </label>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={40}
                  placeholder="Enter message"
                  className="w-full rounded-2xl border border-[#e2d5c7] bg-[#fcfaf7] px-4 py-3 text-sm text-[#4e3a2f] outline-none focus:border-[#a26748]"
                />
              </div>

              <button
                onClick={() =>
                  addToCart(product, {
                    customText: message,
                    customFlavor: flavour.name,
                    customWeight: weight.name
                  })
                }
                className="mt-8 w-full rounded-full bg-[#342219] py-4 text-sm font-bold text-white transition hover:bg-[#9b5938]"
              >
                Add Custom Cake — ₹{price}
              </button>
            </div>

            <div className="sticky top-28 h-fit overflow-hidden rounded-[32px] bg-[#eee3d7] p-6 md:p-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#92715d]">
                    Live Preview
                  </p>
                  <h2 className="mt-1 font-serif text-2xl text-[#342219]">
                    {theme} Cake
                  </h2>
                </div>

                <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-[#8e563c]">
                  ₹{price}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[26px] bg-white">
                <img
                  src={product.image}
                  alt="Cake preview"
                  className="aspect-[4/3] w-full object-cover"
                />

                <div className="absolute inset-x-0 bottom-8 flex justify-center">
                  <span className="rounded-full bg-white/90 px-5 py-2.5 font-serif text-lg font-semibold text-[#4a3023] shadow-xl backdrop-blur">
                    {message || "Your message"}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/70 p-3 text-center">
                  <span className="block text-[9px] uppercase tracking-widest text-[#92715d]">
                    Flavour
                  </span>
                  <span className="mt-1 block text-xs font-bold text-[#4b382d]">
                    {flavour.name}
                  </span>
                </div>
                <div className="rounded-2xl bg-white/70 p-3 text-center">
                  <span className="block text-[9px] uppercase tracking-widest text-[#92715d]">
                    Size
                  </span>
                  <span className="mt-1 block text-xs font-bold text-[#4b382d]">
                    {weight.name}
                  </span>
                </div>
                <div className="rounded-2xl bg-white/70 p-3 text-center">
                  <span className="block text-[9px] uppercase tracking-widest text-[#92715d]">
                    Theme
                  </span>
                  <span className="mt-1 block text-xs font-bold text-[#4b382d]">
                    {theme}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
