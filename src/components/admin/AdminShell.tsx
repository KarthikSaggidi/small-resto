"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ReceiptIndianRupee,
  ShoppingBag,
  Package,
  Image as ImageIcon,
  Boxes,
  Settings,
  ExternalLink,
  Store,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings, BakerySettings } from "@/lib/store";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Online Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        label: "Billing",
        href: "/admin/billing",
        icon: ReceiptIndianRupee,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Banners",
        href: "/admin/banners",
        icon: ImageIcon,
      },
      {
        label: "Inventory",
        href: "/admin/inventory",
        icon: Boxes,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
      label: "Reports",
      href: "/admin/reports",
      icon: ReceiptIndianRupee,
    },
    {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<BakerySettings | null>(null);

  function loadSettings() {
    setSettings(getSettings());
  }

  useEffect(() => {
    loadSettings();

    const handler = () => loadSettings();

    window.addEventListener("thirumala-store-update", handler);

    return () => {
      window.removeEventListener("thirumala-store-update", handler);
    };
  }, []);

  const sidebar = (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.companyName} />
          ) : (
            <Store size={20} />
          )}
        </div>

        <div>
          <strong>{settings?.companyName || "Thirumala Bakery"}</strong>
          <span>Admin Console</span>
        </div>
      </div>

      <nav className="admin-nav">
        {navigation.map((section) => (
          <div className="admin-nav-section" key={section.label}>
            <p>{section.label}</p>

            {section.items.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`admin-nav-item ${
                    active ? "active" : ""
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>

                  {active && <ChevronRight size={15} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <Link href="/" target="_blank" className="admin-site-link">
          <ExternalLink size={16} />
          View Website
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="admin-app">
      {mobileOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`admin-mobile-sidebar ${
          mobileOpen ? "open" : ""
        }`}
      >
        <button
          className="admin-mobile-close"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>

        {sidebar}
      </div>

      <div className="admin-desktop-sidebar">{sidebar}</div>

      <main className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={21} />
          </button>

          <div className="admin-breadcrumb">
            <span>Thirumala Bakery</span>
            <ChevronRight size={15} />
            <strong>
              {pathname === "/admin"
                ? "Dashboard"
                : pathname
                    .split("/")
                    .filter(Boolean)
                    .pop()
                    ?.replace(/^\w/, (c) => c.toUpperCase())}
            </strong>
          </div>

          <div className="admin-topbar-actions">
            <span className="admin-live">
              <span />
              Store Online
            </span>

            <Link href="/" target="_blank" className="admin-view-store">
              <Store size={16} />
              Website
            </Link>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
