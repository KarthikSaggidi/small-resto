"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  Building2,
  ImagePlus,
  Save,
  ShieldCheck,
  Store,
  Phone,
  Mail,
  MapPin,
  Globe,
} from "lucide-react";
import {
  BakerySettings,
  getSettings,
  saveSettings,
} from "@/lib/store";

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<BakerySettings>(getSettings());

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function update(
    key: keyof BakerySettings,
    value: string | number | boolean
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  function uploadLogo(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Please select an image below 3 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      update("logo", String(reader.result || ""));
    };

    reader.readAsDataURL(file);
  }

  function save() {
    const updated = saveSettings(settings);

    setSettings(updated);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-8 text-[#30271f]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#927d6a]">
            System
          </div>

          <h1 className="font-serif text-5xl font-semibold">
            Settings
          </h1>

          <p className="mt-2 text-[#786d63]">
            Set up your bakery details, branding and admin
            account.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[#e5dcd1] bg-white p-7 shadow-[0_10px_40px_rgba(48,39,31,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#f2ebe2] p-3">
                <Building2 size={20} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Company Setup
                </h2>

                <p className="text-sm text-[#82766b]">
                  These details will be used throughout the
                  bakery website and admin panel.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Company Name"
                value={settings.companyName}
                onChange={(value) =>
                  update("companyName", value)
                }
                placeholder="Thirumala Bakery"
              />

              <Field
                label="Legal Name"
                value={settings.legalName || ""}
                onChange={(value) =>
                  update("legalName", value)
                }
                placeholder="Registered company name"
              />

              <Field
                label="GST Number"
                value={settings.gst || ""}
                onChange={(value) =>
                  update("gst", value)
                }
                placeholder="GSTIN"
              />

            </div>
          </section>

          <section className="rounded-3xl border border-[#e5dcd1] bg-white p-7 shadow-[0_10px_40px_rgba(48,39,31,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#f2ebe2] p-3">
                <ImagePlus size={20} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Brand Logo
                </h2>

                <p className="text-sm text-[#82766b]">
                  Upload the logo that should appear across
                  the bakery.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-[#e4d9cd] bg-[#faf7f2]">
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt="Company logo"
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="text-center text-xs text-[#9a8d81]">
                    No logo
                  </div>
                )}
              </div>

              <label className="cursor-pointer rounded-2xl border border-[#d9cec2] bg-[#fffdfa] px-5 py-3 text-sm font-semibold transition hover:bg-[#f6efe7]">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadLogo}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5dcd1] bg-white p-7 shadow-[0_10px_40px_rgba(48,39,31,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#f2ebe2] p-3">
                <Phone size={20} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Contact Details
                </h2>

                <p className="text-sm text-[#82766b]">
                  Used for customer communication and website
                  contact information.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Phone"
                value={settings.phone || ""}
                onChange={(value) =>
                  update("phone", value)
                }
                placeholder="+91"
              />

              <Field
                label="WhatsApp"
                value={settings.whatsapp || ""}
                onChange={(value) =>
                  update("whatsapp", value)
                }
                placeholder="+91"
              />

              <Field
                label="Email"
                value={settings.email || ""}
                onChange={(value) =>
                  update("email", value)
                }
                placeholder="hello@example.com"
              />

              <Field
                label="Website"
                value={settings.website || ""}
                onChange={(value) =>
                  update("website", value)
                }
                placeholder="https://"
              />

              <div className="md:col-span-2">
                <Field
                  label="Address"
                  value={settings.address || ""}
                  onChange={(value) =>
                    update("address", value)
                  }
                  placeholder="Complete bakery address"
                />
              </div>

              <Field
                label="City"
                value={settings.city || ""}
                onChange={(value) =>
                  update("city", value)
                }
                placeholder="Hyderabad"
              />

              <Field
                label="State"
                value={settings.state || ""}
                onChange={(value) =>
                  update("state", value)
                }
                placeholder="Telangana"
              />

              <Field
                label="Pincode"
                value={settings.pincode || ""}
                onChange={(value) =>
                  update("pincode", value)
                }
                placeholder="500000"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5dcd1] bg-white p-7 shadow-[0_10px_40px_rgba(48,39,31,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#f2ebe2] p-3">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Admin Account
                </h2>

                <p className="text-sm text-[#82766b]">
                  Configure the vendor's admin login.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Username"
                value={settings.username || ""}
                onChange={(value) =>
                  update("username", value)
                }
                placeholder="admin"
              />

              <Field
                label="Password"
                type="password"
                value={settings.password || ""}
                onChange={(value) =>
                  update("password", value)
                }
                placeholder="Create password"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-[#faf6f0] p-4 text-sm text-[#796d62]">
              For this local prototype the credentials are
              stored in browser storage. For production,
              move authentication to the backend/database
              before deployment.
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5dcd1] bg-white p-7 shadow-[0_10px_40px_rgba(48,39,31,0.04)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-[#f2ebe2] p-3">
                <Store size={20} />
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold">
                  Store & Orders
                </h2>

                <p className="text-sm text-[#82766b]">
                  Control how customers can order.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Toggle
                label="Store Online"
                value={Boolean(settings.storeOnline)}
                onChange={(value) =>
                  update("storeOnline", value)
                }
              />

              <Toggle
                label="Online Orders"
                value={Boolean(settings.storeOnline)}
                onChange={(value) =>
                  update("storeOnline", value)
                }
              />

              <Toggle
                label="Pickup Orders"
                value={Boolean(settings.storeOnline)}
                onChange={(value) =>
                  update("storeOnline", value)
                }
              />
            </div>
          </section>

          <div className="sticky bottom-5 flex items-center justify-end gap-4 rounded-3xl border border-[#e5dcd1] bg-white/95 p-4 shadow-xl backdrop-blur">
            {saved && (
              <span className="text-sm font-medium text-green-700">
                Settings saved successfully.
              </span>
            )}

            <button
              onClick={save}
              className="flex items-center gap-2 rounded-2xl bg-[#30271f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#211b16]"
            >
              <Save size={17} />
              Save Company Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#55493f]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-[#ddd2c6] bg-[#fffdfa] px-4 text-sm outline-none transition placeholder:text-[#aaa095] focus:border-[#8d7762] focus:ring-4 focus:ring-[#8d7762]/10"
      />
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between rounded-2xl border border-[#e2d8ce] bg-[#fffdfa] p-4 text-left"
    >
      <span className="text-sm font-semibold">
        {label}
      </span>

      <span
        className={`relative h-6 w-11 rounded-full transition ${
          value
            ? "bg-[#30271f]"
            : "bg-[#d8cec3]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}
