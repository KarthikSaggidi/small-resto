"use client";

import {
  Package,
  ShoppingBag,
  ReceiptIndianRupee,
  Image as ImageIcon,
  Boxes,
  Settings,
} from "lucide-react";

type ModuleType =
  | "orders"
  | "products"
  | "billing"
  | "banners"
  | "inventory"
  | "settings";

const moduleData = {
  orders: {
    title: "Online Orders",
    description: "Manage customer orders and order status.",
    icon: ShoppingBag,
  },
  products: {
    title: "Products",
    description: "Manage cakes, pastries, snacks and bakery products.",
    icon: Package,
  },
  billing: {
    title: "Billing",
    description: "Monitor sales, payments and revenue.",
    icon: ReceiptIndianRupee,
  },
  banners: {
    title: "Banners",
    description: "Control promotional banners shown on the website.",
    icon: ImageIcon,
  },
  inventory: {
    title: "Inventory",
    description: "Monitor stock and product availability.",
    icon: Boxes,
  },
  settings: {
    title: "Settings",
    description: "Configure your bakery and website.",
    icon: Settings,
  },
};

export default function AdminModule({
  type,
}: {
  type: ModuleType;
}) {
  const data = moduleData[type];
  const Icon = data.icon;

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">THIRUMALA BAKERY</div>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
      </div>

      <div className="admin-empty-card">
        <div className="admin-empty-icon">
          <Icon size={24} />
        </div>

        <h2>{data.title}</h2>
        <p>Module loading.</p>
      </div>
    </section>
  );
}
