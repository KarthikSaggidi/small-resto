"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/store";

export default function BrandSync() {
  useEffect(() => {
    function applyBranding() {
      const settings = getSettings();

      const companyName =
        settings.companyName || "Thirumala Bakery";

      document.title = companyName;

      document.documentElement.style.setProperty(
        "--brand-primary",
        "#30271f"
      );

      document.documentElement.style.setProperty(
        "--brand-name",
        `"${companyName}"`
      );

      const existingFavicon = document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement | null;

      if (settings.logo || settings.logo) {
        const favicon =
          existingFavicon ||
          document.createElement("link");

        favicon.rel = "icon";
        favicon.href =
          settings.logo || settings.logo || "";

        if (!existingFavicon) {
          document.head.appendChild(favicon);
        }
      }
    }

    applyBranding();

    const handleUpdate = () => {
      applyBranding();
    };

    window.addEventListener(
      "thirumala-store-update",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "thirumala-store-update",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  return null;
}
