"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <Header />
      <main className="bg-[#fbf8f3]">
        <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a26748]">
            We'd love to hear from you
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-0.045em] text-[#342219] md:text-7xl">
            Contact us.
          </h1>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-[30px] bg-[#342219] p-8 text-white md:p-10">
              <h2 className="font-serif text-3xl">Visit Thirumala Bakery</h2>
              <p className="mt-6 text-sm leading-7 text-[#d9c9bb]">
                SLN Green Space
                <br />
                Ground Floor
                <br />
                Bahadurpally, Hyderabad
                <br />
                Telangana 500043
              </p>

              <a
                href="tel:+917997005050"
                className="mt-7 block text-sm font-semibold text-[#e7b996]"
              >
                +91 79970 05050
              </a>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-[30px] border border-[#e4d8ca] bg-white p-7 md:p-10"
            >
              {sent ? (
                <div className="py-10 text-center">
                  <div className="font-serif text-3xl text-[#342219]">
                    Thank you!
                  </div>
                  <p className="mt-3 text-sm text-[#806b5d]">
                    Your message has been received.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-3xl text-[#342219]">
                    Send a message
                  </h2>

                  <div className="mt-7 space-y-4">
                    <input
                      required
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-[#e3d6c8] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none"
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email address"
                      className="w-full rounded-2xl border border-[#e3d6c8] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none"
                    />
                    <input
                      placeholder="Phone number"
                      className="w-full rounded-2xl border border-[#e3d6c8] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none"
                    />
                    <textarea
                      required
                      placeholder="How can we help?"
                      rows={5}
                      className="w-full resize-none rounded-2xl border border-[#e3d6c8] bg-[#fcfaf7] px-4 py-3.5 text-sm outline-none"
                    />
                  </div>

                  <button className="mt-5 w-full rounded-full bg-[#342219] py-3.5 text-sm font-bold text-white hover:bg-[#9b5938]">
                    Send Message
                  </button>
                </>
              )}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
