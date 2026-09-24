import type { Metadata } from "next";
import "./globals.css";
import BrandSync from "@/components/site/BrandSync";

export const metadata: Metadata = {
  title: "Thirumala Bakery",
  description:
    "Freshly baked cakes, pastries, snacks and bakery treats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <BrandSync />
        {children}
      </body>
    </html>
  );
}
