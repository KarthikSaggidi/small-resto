/* =========================================================
   THIRUMALA BAKERY SHARED STORE
   ========================================================= */

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock?: number;
  weight?: string;
  image?: string;
  description?: string;
  featured?: boolean;
  visible?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderItem = {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  size?: string;
  image?: string;
  customText?: string;
  customFlavor?: string;
  customWeight?: string;
};

export type Order = {
  id: string;
  orderNumber?: string;
  billNumber?: string;

  customerName?: string;
  mobile?: string;
  email?: string;
  address?: string;

  items: OrderItem[];

  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;

  payment?: string;
  paymentMethod?: string;
  paymentStatus?: string;

  status?: string;
  type?: string;

  pickup?: boolean;
  delivery?: boolean;

  createdAt: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  id: string;
  name: string;
  active?: boolean;
  createdAt?: string;
};

export type BakerySettings = {
  companyName: string;
  legalName?: string;

  logo?: string;

  phone?: string;
  email?: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  gst?: string;

  website?: string;
  instagram?: string;
  whatsapp?: string;
  facebook?: string;

  username?: string;
  password?: string;

  storeOnline?: boolean;

  taxRate?: number;
  currency?: string;
};

export type CartItem = OrderItem;

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const KEYS = {
  products: "thirumala_products",
  orders: "thirumala_orders",
  banners: "thirumala_banners",
  categories: "thirumala_categories",
  settings: "thirumala_settings",
  cart: "thirumala_cart",
  offlineBills: "thirumala_offline_bills",
  lastBill: "thirumala_last_bill",
};

/* =========================================================
   DEFAULT SETTINGS
   ========================================================= */

const DEFAULT_SETTINGS: BakerySettings = {
  companyName: "Thirumala Bakery",
  legalName: "",
  logo: "",

  phone: "",
  email: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  gst: "",

  website: "",
  instagram: "",
  whatsapp: "",
  facebook: "",

  username: "admin",
  password: "",

  storeOnline: true,

  taxRate: 5,
  currency: "INR",
};

/* =========================================================
   DEFAULT CATEGORIES
   ========================================================= */

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cakes",
    name: "Cakes",
    active: true,
  },
  {
    id: "pastries",
    name: "Pastries",
    active: true,
  },
  {
    id: "snacks",
    name: "Snacks",
    active: true,
  },
  {
    id: "beverages",
    name: "Beverages",
    active: true,
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(
  key: string,
  fallback: T
): T {

  if (!isBrowser()) {
    return fallback;
  }

  try {

    const raw =
      window.localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;

  } catch {

    return fallback;

  }
}

function writeStorage<T>(
  key: string,
  value: T
) {

  if (!isBrowser()) {
    return;
  }

  try {

    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    window.dispatchEvent(
      new Event("thirumala-store-update")
    );

  } catch {}

}

function makeId(prefix: string) {

  return (
    prefix +
    "-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );

}

function toNumber(value: unknown) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;

}

/* =========================================================
   PRODUCT NORMALIZATION
   ========================================================= */

function normalizeProduct(
  product: any,
  index = 0
): Product {

  return {

    id:
      String(
        product?.id ??
        `product-${index + 1}`
      ),

    name:
      String(
        product?.name ??
        "Product"
      ),

    category:
      String(
        product?.category ??
        "Bakery"
      ),

    price:
      toNumber(product?.price),

    stock:
      product?.stock === undefined
        ? 0
        : toNumber(product.stock),

    weight:
      product?.weight
        ? String(product.weight)
        : "",

    image:
      product?.image
        ? String(product.image)
        : "",

    description:
      product?.description
        ? String(product.description)
        : "",

    featured:
      Boolean(product?.featured),

    visible:
      product?.visible === undefined
        ? true
        : Boolean(product.visible),

    active:
      product?.active === undefined
        ? true
        : Boolean(product.active),

    createdAt:
      product?.createdAt,

    updatedAt:
      product?.updatedAt,

  };

}

/* =========================================================
   ORDER NORMALIZATION
   ========================================================= */

function normalizeOrder(
  order: any,
  index = 0
): Order {

  const rawItems =
    Array.isArray(order?.items)
      ? order.items
      : [];

  const items: OrderItem[] =
    rawItems.map(
      (item: any, itemIndex: number) => ({

        id:
          String(
            item?.id ??
            `item-${index}-${itemIndex}`
          ),

        productId:
          item?.productId
            ? String(item.productId)
            : undefined,

        name:
          String(
            item?.name ??
            "Product"
          ),

        price:
          toNumber(item?.price),

        quantity:
          Math.max(
            1,
            toNumber(item?.quantity) || 1
          ),

        weight:
          item?.weight
            ? String(item.weight)
            : "",

      })
    );

  const subtotal =
    toNumber(order?.subtotal) ||
    items.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );

  const discount =
    toNumber(order?.discount);

  const tax =
    toNumber(order?.tax);

  const total =
    toNumber(order?.total) ||
    Math.max(
      0,
      subtotal - discount
    ) + tax;

  return {

    ...order,

    id:
      String(
        order?.id ??
        `order-${index + 1}`
      ),

    orderNumber:
      order?.orderNumber ??
      order?.billNumber,

    items,

    subtotal,

    discount,

    tax,

    total,

    pickup:
      order?.pickup === undefined
        ? undefined
        : Boolean(order.pickup),

    delivery:
      order?.delivery === undefined
        ? undefined
        : Boolean(order.delivery),

    createdAt:
      order?.createdAt ??
      new Date(0).toISOString(),

  };

}

/* =========================================================
   PRODUCTS
   ========================================================= */

export function getProducts(): Product[] {

  const data =
    readStorage<any[]>(
      KEYS.products,
      []
    );

  return Array.isArray(data)
    ? data.map(normalizeProduct)
    : [];

}

export function readProducts(): Product[] {

  return getProducts();

}

export function saveProducts(
  products: Product[]
): Product[] {

  const normalized =
    products.map(
      normalizeProduct
    );

  writeStorage(
    KEYS.products,
    normalized
  );

  return normalized;

}

export function addProduct(
  product: Partial<Product>
): Product {

  const newProduct =
    normalizeProduct({

      ...product,

      id:
        product.id ??
        makeId("product"),

      createdAt:
        new Date().toISOString(),

    });

  saveProducts([
    ...getProducts(),
    newProduct,
  ]);

  return newProduct;

}

export function updateProduct(
  id: string,
  changes: Partial<Product>
): Product | null {

  let updated:
    Product | null = null;

  const products =
    getProducts();

  const next =
    products.map(
      product => {

        if (product.id !== id) {
          return product;
        }

        updated =
          normalizeProduct({

            ...product,
            ...changes,

            id,

            updatedAt:
              new Date().toISOString(),

          });

        return updated;

      }
    );

  saveProducts(next);

  return updated;

}

export function deleteProduct(
  id: string
) {

  saveProducts(
    getProducts().filter(
      product =>
        product.id !== id
    )
  );

}

export function getProductById(
  id: string
) {

  return (
    getProducts().find(
      product =>
        product.id === id
    ) ?? null
  );

}

export function getFeaturedProducts() {

  return getProducts().filter(
    product =>
      product.featured &&
      product.visible !== false &&
      product.active !== false
  );

}

/* =========================================================
   CATEGORIES
   ========================================================= */

export function getCategories(): Category[] {

  const data =
    readStorage<any[]>(
      KEYS.categories,
      DEFAULT_CATEGORIES
    );

  if (!Array.isArray(data)) {
    return DEFAULT_CATEGORIES;
  }

  return data.map(
    (category, index) => ({

      id:
        String(
          category?.id ??
          `category-${index + 1}`
        ),

      name:
        String(
          category?.name ??
          "Category"
        ),

      active:
        category?.active === undefined
          ? true
          : Boolean(category.active),

      createdAt:
        category?.createdAt,

    })
  );

}

export function saveCategories(
  categories: Category[]
) {

  writeStorage(
    KEYS.categories,
    categories
  );

  return categories;

}

export function addCategory(
  category: Partial<Category>
): Category {

  const item: Category = {

    id:
      category.id ??
      makeId("category"),

    name:
      String(
        category.name ??
        "New Category"
      ),

    active:
      category.active !== false,

    createdAt:
      new Date().toISOString(),

  };

  saveCategories([
    ...getCategories(),
    item,
  ]);

  return item;

}

export function updateCategory(
  id: string,
  changes: Partial<Category>
) {

  let updated:
    Category | null = null;

  const next =
    getCategories().map(
      category => {

        if (category.id !== id) {
          return category;
        }

        updated = {
          ...category,
          ...changes,
          id,
        };

        return updated;

      }
    );

  saveCategories(next);

  return updated;

}

export function deleteCategory(
  id: string
) {

  saveCategories(
    getCategories().filter(
      category =>
        category.id !== id
    )
  );

}

/* =========================================================
   ORDERS
   ========================================================= */

export function getOrders(): Order[] {

  const data =
    readStorage<any[]>(
      KEYS.orders,
      []
    );

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(
    normalizeOrder
  );

}

export function saveOrders(
  orders: Order[]
) {

  const normalized =
    orders.map(
      normalizeOrder
    );

  writeStorage(
    KEYS.orders,
    normalized
  );

  return normalized;

}

export function addOrder(
  order: Partial<Order>
): Order {

  const newOrder =
    normalizeOrder({

      ...order,

      id:
        order.id ??
        makeId("order"),

      status:
        order.status ??
        "pending",

      createdAt:
        order.createdAt ??
        new Date().toISOString(),

    });

  saveOrders([
    newOrder,
    ...getOrders(),
  ]);

  return newOrder;

}

export function placeOrder(
  order: Partial<Order>
) {

  return addOrder({

    ...order,

    type:
      order.type ??
      "online",

  });

}

export function updateOrder(
  id: string,
  changes: Partial<Order>
) {

  let updated:
    Order | null = null;

  const next =
    getOrders().map(
      order => {

        if (order.id !== id) {
          return order;
        }

        updated =
          normalizeOrder({

            ...order,
            ...changes,
            id,

          });

        return updated;

      }
    );

  saveOrders(next);

  return updated;

}

export function deleteOrder(
  id: string
) {

  saveOrders(
    getOrders().filter(
      order =>
        order.id !== id
    )
  );

}

/* =========================================================
   BANNERS
   ========================================================= */

export function getBanners(): Banner[] {

  const data =
    readStorage<any[]>(
      KEYS.banners,
      []
    );

  return Array.isArray(data)
    ? data
    : [];

}

export function saveBanners(
  banners: Banner[]
) {

  writeStorage(
    KEYS.banners,
    banners
  );

  return banners;

}

export function addBanner(
  banner: Partial<Banner>
): Banner {
  const item: Banner = {
    id:
      banner.id ??
      makeId("banner"),

    title:
      String(
        banner.title ??
        "New Banner"
      ),

    subtitle:
      String(
        banner.subtitle ??
        ""
      ),

    image:
      String(
        banner.image ??
        ""
      ),

    buttonText:
      String(
        banner.buttonText ??
        "Order Now"
      ),

    buttonLink:
      String(
        banner.buttonLink ??
        "/cakes"
      ),

    active:
      banner.active !== false,

    createdAt:
      new Date().toISOString(),
  };

  saveBanners([
    ...getBanners(),
    item,
  ]);

  return item;
}

export function updateBanner(
  id: string,
  changes: Partial<Banner>
) {

  let updated:
    Banner | null = null;

  const next =
    getBanners().map(
      banner => {

        if (banner.id !== id) {
          return banner;
        }

        updated = {
          ...banner,
          ...changes,
          id,
        };

        return updated;

      }
    );

  saveBanners(next);

  return updated;

}

export function deleteBanner(
  id: string
) {

  saveBanners(
    getBanners().filter(
      banner =>
        banner.id !== id
    )
  );

}

/* =========================================================
   SETTINGS
   ========================================================= */

export function getSettings(): BakerySettings {

  const stored =
    readStorage<
      Partial<BakerySettings>
    >(
      KEYS.settings,
      {}
    );

  return {

    ...DEFAULT_SETTINGS,

    ...(stored || {}),

  };

}

export function saveSettings(
  settings: Partial<BakerySettings>
) {

  const merged = {

    ...getSettings(),

    ...settings,

  };

  writeStorage(
    KEYS.settings,
    merged
  );

  return merged;

}

export function updateSettings(
  settings: Partial<BakerySettings>
) {

  return saveSettings(
    settings
  );

}

/* =========================================================
   CART
   ========================================================= */

export function getCart(): CartItem[] {

  const data =
    readStorage<any[]>(
      KEYS.cart,
      []
    );

  return Array.isArray(data)
    ? data
    : [];

}

export function saveCart(
  items: CartItem[]
) {

  writeStorage(
    KEYS.cart,
    items
  );

  return items;

}

export function addToCart(
  product: Product | CartItem,
  customization?: {
    customText?: string;
    customFlavor?: string;
    customWeight?: string;
  }
) {

  const cart =
    getCart();

  const existing =
    cart.find(
      item =>
        item.id === product.id &&
        item.customText === customization?.customText &&
        item.customFlavor === customization?.customFlavor &&
        item.customWeight === customization?.customWeight
    );

  if (existing) {

    existing.quantity += 1;

    return saveCart([
      ...cart,
    ]);

  }

  return saveCart([

    ...cart,

    {

      id:
        product.id,

      productId:
        product.id,

      name:
        product.name,

      price:
        toNumber(product.price),

      quantity:
        1,

      weight:
        product.weight,

      size:
        "size" in product ? product.size : undefined,

      image:
        "image" in product ? product.image : undefined,

      customText:
        customization?.customText,

      customFlavor:
        customization?.customFlavor,

      customWeight:
        customization?.customWeight,

    },

  ]);

}

export function updateCartItem(
  id: string,
  quantity: number,
  size?: string
) {
  if (quantity <= 0) {
    return removeFromCart(id, size);
  }

  return saveCart(
    getCart().map((item) =>
      item.id === id &&
      (size === undefined || item.size === size)
        ? {
            ...item,
            quantity,
          }
        : item
    )
  );
}

export function updateCartQty(
  id: string,
  quantity: number,
  size?: string
) {
  return updateCartItem(id, quantity, size);
}

export function removeFromCart(
  id: string,
  size?: string
) {
  return saveCart(
    getCart().filter(
      (item) =>
        !(
          item.id === id &&
          (size === undefined || item.size === size)
        )
    )
  );
}

export function clearCart() {

  saveCart([]);

}

/* =========================================================
   OFFLINE BILLS
   ========================================================= */

export function getOfflineBills(): Order[] {

  const data =
    readStorage<any[]>(
      KEYS.offlineBills,
      []
    );

  return Array.isArray(data)
    ? data.map(normalizeOrder)
    : [];

}

export function saveOfflineBill(
  bill: Partial<Order>
) {

  const created =
    normalizeOrder({

      ...bill,

      id:
        bill.id ??
        makeId("TB"),

      type:
        "offline",

      createdAt:
        bill.createdAt ??
        new Date().toISOString(),

    });

  writeStorage(
    KEYS.offlineBills,
    [
      created,
      ...getOfflineBills(),
    ]
  );

  return created;

}

/* =========================================================
   DASHBOARD
   ========================================================= */

export type DashboardStats = {

  totalRevenue: number;

  onlineRevenue: number;

  cashRevenue: number;

  revenue: number;

  totalProducts: number;

  totalOrders: number;

  onlineOrders: number;

  offlineOrders: number;

  pendingOrders: number;

  completedOrders: number;

  cancelledOrders: number;

  totalItemsSold: number;

  averageOrderValue: number;

};

function emptyDashboardStats(): DashboardStats {

  return {

    totalRevenue: 0,

    onlineRevenue: 0,

    cashRevenue: 0,

    revenue: 0,

    totalProducts: 0,

    totalOrders: 0,

    onlineOrders: 0,

    offlineOrders: 0,

    pendingOrders: 0,

    completedOrders: 0,

    cancelledOrders: 0,

    totalItemsSold: 0,

    averageOrderValue: 0,

  };

}

export function getDashboardStats(): DashboardStats {

  /*
   * This is intentionally SSR-safe.
   *
   * Server:
   *   returns stable zero values.
   *
   * Browser:
   *   reads current localStorage values.
   */

  if (!isBrowser()) {

    return emptyDashboardStats();

  }

  const products =
    getProducts();

  const onlineOrders =
    getOrders();

  const offlineBills =
    getOfflineBills();

  const orders = [

    ...onlineOrders,

    ...offlineBills,

  ];

  let totalRevenue = 0;

  let onlineRevenue = 0;

  let cashRevenue = 0;

  let onlineOrderCount = 0;

  let offlineOrderCount = 0;

  let pendingOrders = 0;

  let completedOrders = 0;

  let cancelledOrders = 0;

  let totalItemsSold = 0;

  for (
    const order of orders
  ) {

    const total =
      toNumber(order.total);

    totalRevenue += total;

    const payment =
      String(
        order.paymentMethod ??
        order.payment ??
        ""
      ).toLowerCase();

    const type =
      String(
        order.type ??
        ""
      ).toLowerCase();

    const offline =
      type === "offline" ||
      payment === "cash";

    if (offline) {

      offlineOrderCount++;

      cashRevenue += total;

    } else {

      onlineOrderCount++;

      onlineRevenue += total;

    }

    const status =
      String(
        order.status ??
        ""
      ).toLowerCase();

    if (
      [
        "pending",
        "new",
        "processing",
      ].includes(status)
    ) {

      pendingOrders++;

    }

    if (
      [
        "completed",
        "delivered",
        "paid",
      ].includes(status)
    ) {

      completedOrders++;

    }

    if (
      [
        "cancelled",
        "canceled",
      ].includes(status)
    ) {

      cancelledOrders++;

    }

    const items =
      Array.isArray(order.items)
        ? order.items
        : [];

    for (
      const item of items
    ) {

      totalItemsSold +=
        toNumber(
          item.quantity
        );

    }

  }

  return {

    totalRevenue,

    onlineRevenue,

    cashRevenue,

    revenue:
      totalRevenue,

    totalProducts:
      products.length,

    totalOrders:
      orders.length,

    onlineOrders:
      onlineOrderCount,

    offlineOrders:
      offlineOrderCount,

    pendingOrders,

    completedOrders,

    cancelledOrders,

    totalItemsSold,

    averageOrderValue:
      orders.length
        ? totalRevenue /
          orders.length
        : 0,

  };

}

/* =========================================================
   INITIALIZATION
   ========================================================= */

export function seedStore() {

  if (!isBrowser()) {
    return;
  }

  if (
    window.localStorage.getItem(
      KEYS.products
    ) === null
  ) {
    saveProducts([]);
  }

  if (
    window.localStorage.getItem(
      KEYS.orders
    ) === null
  ) {
    saveOrders([]);
  }

  if (
    window.localStorage.getItem(
      KEYS.banners
    ) === null
  ) {
    saveBanners([]);
  }

  if (
    window.localStorage.getItem(
      KEYS.categories
    ) === null
  ) {
    saveCategories(
      DEFAULT_CATEGORIES
    );
  }

  if (
    window.localStorage.getItem(
      KEYS.settings
    ) === null
  ) {
    saveSettings(
      DEFAULT_SETTINGS
    );
  }

  if (
    window.localStorage.getItem(
      KEYS.cart
    ) === null
  ) {
    saveCart([]);
  }

}

export function resetStore() {

  if (!isBrowser()) {
    return;
  }

  Object.values(
    KEYS
  ).forEach(
    key =>
      window.localStorage.removeItem(
        key
      )
  );

  seedStore();

}

