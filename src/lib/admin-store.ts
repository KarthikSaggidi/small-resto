"use client";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded";

export type Order = {
  id: string;
  customer: string;
  phone: string;
  items: string;
  amount: number;
  payment: PaymentStatus;
  status: OrderStatus;
  type: "Online" | "Pickup";
  date: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  lowStock: number;
  price: number;
  updated: string;
};

export type StoreSettings = {
  bakeryName: string;
  phone: string;
  email: string;
  address: string;
  gst: string;
  currency: string;
  pickupEnabled: boolean;
  onlineOrdersEnabled: boolean;
  deliveryEnabled: boolean;
  notificationsEnabled: boolean;
};

const ORDERS_KEY = "thirumala_orders";
const BANNERS_KEY = "thirumala_banners";
const INVENTORY_KEY = "thirumala_inventory";
const SETTINGS_KEY = "thirumala_settings";

const defaultOrders: Order[] = [
  {
    id: "TB-1001",
    customer: "Ananya Reddy",
    phone: "9876543210",
    items: "Chocolate Truffle Cake × 1",
    amount: 799,
    payment: "Paid",
    status: "Preparing",
    type: "Online",
    date: new Date().toISOString(),
  },
  {
    id: "TB-1002",
    customer: "Rahul Kumar",
    phone: "9123456780",
    items: "White Forest × 1, Veg Puff × 4",
    amount: 839,
    payment: "Paid",
    status: "Confirmed",
    type: "Pickup",
    date: new Date().toISOString(),
  },
  {
    id: "TB-1003",
    customer: "Sneha Sharma",
    phone: "9988776655",
    items: "Red Velvet Cake × 1",
    amount: 899,
    payment: "Pending",
    status: "Pending",
    type: "Online",
    date: new Date().toISOString(),
  },
];

const defaultBanners: Banner[] = [
  {
    id: "banner-1",
    title: "Sweet Moments Made Simple",
    subtitle: "Freshly baked cakes for every celebration.",
    image: "/images/banners/cakes.jpg",
    buttonText: "Order a Cake",
    buttonLink: "/cakes",
    active: true,
  },
  {
    id: "banner-2",
    title: "Fresh From Our Oven",
    subtitle: "Pastries, snacks and more.",
    image: "/images/banners/bakery.jpg",
    buttonText: "Explore Menu",
    buttonLink: "/pastries",
    active: true,
  },
];

const defaultInventory: InventoryItem[] = [
  {
    id: "inv-1",
    name: "Chocolate Truffle Cake",
    category: "Cakes",
    stock: 12,
    unit: "pieces",
    lowStock: 5,
    price: 799,
    updated: new Date().toISOString(),
  },
  {
    id: "inv-2",
    name: "White Forest Cake",
    category: "Cakes",
    stock: 8,
    unit: "pieces",
    lowStock: 5,
    price: 699,
    updated: new Date().toISOString(),
  },
  {
    id: "inv-3",
    name: "Red Velvet Cake",
    category: "Cakes",
    stock: 3,
    unit: "pieces",
    lowStock: 5,
    price: 899,
    updated: new Date().toISOString(),
  },
  {
    id: "inv-4",
    name: "Veg Puff",
    category: "Snacks",
    stock: 45,
    unit: "pieces",
    lowStock: 15,
    price: 35,
    updated: new Date().toISOString(),
  },
  {
    id: "inv-5",
    name: "Chicken Puff",
    category: "Snacks",
    stock: 27,
    unit: "pieces",
    lowStock: 10,
    price: 55,
    updated: new Date().toISOString(),
  },
];

const defaultSettings: StoreSettings = {
  bakeryName: "Thirumala Bakery",
  phone: "+91 79970 05050",
  email: "contact@thirumalabakery.com",
  address: "Bahadurpally, Hyderabad, Telangana",
  gst: "",
  currency: "INR",
  pickupEnabled: true,
  onlineOrdersEnabled: true,
  deliveryEnabled: true,
  notificationsEnabled: true,
};

function browser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!browser()) return fallback;

  try {
    const value = localStorage.getItem(key);

    if (!value) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!browser()) return;

  localStorage.setItem(key, JSON.stringify(value));

  window.dispatchEvent(
    new CustomEvent("thirumala-admin-updated")
  );
}

export function getOrders(): Order[] {
  return read(ORDERS_KEY, defaultOrders);
}

export function saveOrders(orders: Order[]) {
  write(ORDERS_KEY, orders);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus
) {
  const orders = getOrders();

  saveOrders(
    orders.map((order) =>
      order.id === id
        ? { ...order, status }
        : order
    )
  );
}

export function updatePaymentStatus(
  id: string,
  payment: PaymentStatus
) {
  const orders = getOrders();

  saveOrders(
    orders.map((order) =>
      order.id === id
        ? { ...order, payment }
        : order
    )
  );
}

export function getBanners(): Banner[] {
  return read(BANNERS_KEY, defaultBanners);
}

export function saveBanners(banners: Banner[]) {
  write(BANNERS_KEY, banners);
}

export function addBanner(banner: Banner) {
  saveBanners([
    ...getBanners(),
    banner,
  ]);
}

export function updateBanner(
  id: string,
  updates: Partial<Banner>
) {
  saveBanners(
    getBanners().map((banner) =>
      banner.id === id
        ? { ...banner, ...updates }
        : banner
    )
  );
}

export function deleteBanner(id: string) {
  saveBanners(
    getBanners().filter(
      (banner) => banner.id !== id
    )
  );
}

export function getInventory(): InventoryItem[] {
  return read(
    INVENTORY_KEY,
    defaultInventory
  );
}

export function saveInventory(
  inventory: InventoryItem[]
) {
  write(INVENTORY_KEY, inventory);
}

export function updateInventory(
  id: string,
  stock: number
) {
  saveInventory(
    getInventory().map((item) =>
      item.id === id
        ? {
            ...item,
            stock,
            updated:
              new Date().toISOString(),
          }
        : item
    )
  );
}

export function getSettings(): StoreSettings {
  return read(
    SETTINGS_KEY,
    defaultSettings
  );
}

export function saveSettings(
  settings: StoreSettings
) {
  write(SETTINGS_KEY, settings);
}
