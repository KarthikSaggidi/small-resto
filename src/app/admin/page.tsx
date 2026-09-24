"use client";

import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getOrders,
  getProducts,
  Order,
  Product,
} from "@/lib/store";

type ModalType = "pending" | "bills" | null;

type DashboardData = {
  totalRevenue: number;
  todayRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
  todayBills: number;
  pendingOrders: number;
  activeProducts: number;
  lowStockItems: number;
  totalOrders: number;
};

type SalesDay = {
  label: string;
  value: number;
};

const EMPTY_STATS: DashboardData = {
  totalRevenue: 0,
  todayRevenue: 0,
  onlineRevenue: 0,
  offlineRevenue: 0,
  todayBills: 0,
  pendingOrders: 0,
  activeProducts: 0,
  lowStockItems: 0,
  totalOrders: 0,
};

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function safeNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function orderDate(order: Order) {
  const raw = order.createdAt || "";

  const date = raw
    ? new Date(raw)
    : new Date();

  return Number.isNaN(date.getTime())
    ? new Date()
    : date;
}

function isToday(date: Date) {
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function orderTotal(order: Order) {
  const directTotal =
    safeNumber(
      (
        order as unknown as Record<
          string,
          unknown
        >
      ).total
    ) ||
    safeNumber(
      (
        order as unknown as Record<
          string,
          unknown
        >
      ).grandTotal
    ) ||
    safeNumber(
      (
        order as unknown as Record<
          string,
          unknown
        >
      ).amount
    );

  if (directTotal > 0) {
    return directTotal;
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  return items.reduce(
    (total, item) => {
      const record =
        item as unknown as Record<
          string,
          unknown
        >;

      const price = safeNumber(
        record.price
      );

      const quantity =
        safeNumber(record.quantity) || 1;

      return total + price * quantity;
    },
    0
  );
}

function orderStatus(order: Order) {
  const record =
    order as unknown as Record<
      string,
      unknown
    >;

  return String(
    record.status ||
      record.orderStatus ||
      record.paymentStatus ||
      "pending"
  )
    .trim()
    .toLowerCase();
}

function isPendingOrder(order: Order) {
  const status = orderStatus(order);

  return [
    "pending",
    "pending payment",
    "awaiting",
    "awaiting confirmation",
    "new",
    "processing",
    "confirmed",
  ].includes(status);
}

function isOnlineOrder(order: Order) {
  const record =
    order as unknown as Record<
      string,
      unknown
    >;

  const source = String(
    record.source ||
      record.channel ||
      record.orderType ||
      record.type ||
      record.paymentMethod ||
      ""
  ).toLowerCase();

  return (
    source.includes("online") ||
    source.includes("website") ||
    source.includes("web")
  );
}

function customerName(order: Order) {
  const record =
    order as unknown as Record<
      string,
      unknown
    >;

  return (
    String(
      record.customerName ||
        record.customer ||
        record.name ||
        "Walk-in Customer"
    ).trim() || "Walk-in Customer"
  );
}

function customerPhone(order: Order) {
  const record =
    order as unknown as Record<
      string,
      unknown
    >;

  return String(
    record.mobile ||
      record.phone ||
      record.customerPhone ||
      ""
  ).trim();
}

function orderNumber(
  order: Order,
  index: number
) {
  const record =
    order as unknown as Record<
      string,
      unknown
    >;

  return (
    String(
      record.orderNumber ||
        record.invoiceNumber ||
        record.billNumber ||
        record.id ||
        `ORDER-${index + 1}`
    ).trim() ||
    `ORDER-${index + 1}`
  );
}

function paymentMethod(order: Order) {
  const record =
    order as unknown as Record<
      string,
      unknown
    >;

  return (
    String(
      record.paymentMethod ||
        record.paymentMode ||
        record.paymentType ||
        ""
    )
      .trim()
      .toUpperCase() || "CASH"
  );
}

function itemCount(order: Order) {
  if (!Array.isArray(order.items)) {
    return 0;
  }

  return order.items.reduce(
    (count, item) => {
      const record =
        item as unknown as Record<
          string,
          unknown
        >;

      return (
        count +
        (safeNumber(record.quantity) || 1)
      );
    },
    0
  );
}

/* ---------------------------------------------------------
   PAGE
--------------------------------------------------------- */

export default function AdminDashboard() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [stats, setStats] =
    useState<DashboardData>(
      EMPTY_STATS
    );

  const [modal, setModal] =
    useState<ModalType>(null);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  /* -------------------------------------------------------
     LOAD REAL-TIME DATA
  ------------------------------------------------------- */

  const loadDashboard = useCallback(() => {
    try {
      const nextOrders = getOrders();
      const nextProducts = getProducts();

      const safeOrders = Array.isArray(
        nextOrders
      )
        ? nextOrders
        : [];

      const safeProducts = Array.isArray(
        nextProducts
      )
        ? nextProducts
        : [];

      setOrders(safeOrders);
      setProducts(safeProducts);

      const todayOrders =
        safeOrders.filter((order) =>
          isToday(orderDate(order))
        );

      const pending =
        safeOrders.filter(
          isPendingOrder
        );

      const totalRevenue =
        safeOrders.reduce(
          (sum, order) =>
            sum + orderTotal(order),
          0
        );

      const todayRevenue =
        todayOrders.reduce(
          (sum, order) =>
            sum + orderTotal(order),
          0
        );

      const onlineRevenue =
        safeOrders
          .filter(isOnlineOrder)
          .reduce(
            (sum, order) =>
              sum + orderTotal(order),
            0
          );

      const offlineRevenue =
        safeOrders
          .filter(
            (order) =>
              !isOnlineOrder(order)
          )
          .reduce(
            (sum, order) =>
              sum + orderTotal(order),
            0
          );

      /*
       * The current Product type does not have
       * a status field, so all products currently
       * available from getProducts() are counted
       * as active products.
       */
      const activeProducts =
        safeProducts.length;

      /*
       * The current Product type does not have
       * lowStockThreshold, so the dashboard uses
       * 10 as the default low-stock threshold.
       */
      const lowStockItems =
        safeProducts.filter((product) => {
          const stock = safeNumber(
            product.stock
          );

          return stock <= 10;
        }).length;

      setStats({
        totalRevenue,
        todayRevenue,
        onlineRevenue,
        offlineRevenue,
        todayBills:
          todayOrders.length,
        pendingOrders:
          pending.length,
        activeProducts,
        lowStockItems,
        totalOrders:
          safeOrders.length,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "Unable to load dashboard:",
        error
      );
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const handler = () => {
      loadDashboard();
    };

    window.addEventListener(
      "storage",
      handler
    );

    window.addEventListener(
      "tb-store",
      handler
    );

    window.addEventListener(
      "thirumala-store-update",
      handler
    );

    window.addEventListener(
      "thirumala-orders-updated",
      handler
    );

    window.addEventListener(
      "thirumala-products-updated",
      handler
    );

    const interval =
      window.setInterval(
        loadDashboard,
        1500
      );

    return () => {
      window.removeEventListener(
        "storage",
        handler
      );

      window.removeEventListener(
        "tb-store",
        handler
      );

      window.removeEventListener(
        "thirumala-store-update",
        handler
      );

      window.removeEventListener(
        "thirumala-orders-updated",
        handler
      );

      window.removeEventListener(
        "thirumala-products-updated",
        handler
      );

      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  /* -------------------------------------------------------
     TODAY / PENDING DATA
  ------------------------------------------------------- */

  const pendingOrders = useMemo(() => {
    return orders.filter(isPendingOrder);
  }, [orders]);

  const todayBills = useMemo(() => {
    return orders.filter((order) =>
      isToday(orderDate(order))
    );
  }, [orders]);

  /* -------------------------------------------------------
     LAST 7 DAYS SALES
  ------------------------------------------------------- */

  const salesWeek = useMemo<SalesDay[]>(
    () => {
      const now = new Date();

      return Array.from(
        { length: 7 },
        (_, index) => {
          const date = new Date(now);

          date.setDate(
            now.getDate() -
              (6 - index)
          );

          const total = orders
            .filter((order) => {
              const orderCreated =
                orderDate(order);

              return (
                orderCreated.getFullYear() ===
                  date.getFullYear() &&
                orderCreated.getMonth() ===
                  date.getMonth() &&
                orderCreated.getDate() ===
                  date.getDate()
              );
            })
            .reduce(
              (sum, order) =>
                sum + orderTotal(order),
              0
            );

          return {
            label:
              date.toLocaleDateString(
                "en-IN",
                {
                  weekday: "short",
                }
              ),
            value: total,
          };
        }
      );
    },
    [orders]
  );

  const maxSales = Math.max(
    ...salesWeek.map(
      (day) => day.value
    ),
    1
  );

  /* -------------------------------------------------------
     REFRESH
  ------------------------------------------------------- */

  function handleRefresh() {
    setIsRefreshing(true);

    loadDashboard();

    window.setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }

  return (
    <div className="min-h-full bg-[#f7f3ed] px-5 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-[1500px]">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#98705a]">
                Live Store Overview
              </span>
            </div>

            <h1 className="mt-3 font-sans text-4xl font-bold tracking-tight tabular-nums text-[#30251f] md:text-5xl">
              Good day, Thirumala.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#817269]">
              A live snapshot of your bakery
              sales, orders and inventory
              performance.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div className="hidden rounded-xl border border-[#e3d8ce] bg-white px-4 py-3 md:block">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />

                <span className="text-xs font-semibold text-[#5d4d44]">
                  Live data
                </span>
              </div>

              <p className="mt-1 text-[10px] text-[#9b8b81]">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )}`
                  : "Loading..."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ded1c6] bg-white px-4 py-3 text-sm font-semibold text-[#493930] shadow-sm transition hover:bg-[#fbf8f4]"
            >
              <RefreshCw
                size={16}
                className={
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </header>

        {/* =================================================
            MAIN REVENUE PANEL
        ================================================= */}

        <section className="mt-8 overflow-hidden rounded-[30px] border border-[#e4d8cd] bg-[#30261f] shadow-[0_18px_50px_rgba(61,43,31,0.12)]">

          <div className="grid lg:grid-cols-[1.25fr_.75fr]">

            <div className="relative overflow-hidden p-7 md:p-9">

              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.04]" />

              <div className="absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-[#a66f4c]/10" />

              <div className="relative">

                <div className="flex items-center gap-2">
                  <IndianRupee
                    size={15}
                    className="text-[#c99570]"
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c9a98f]">
                    Total Revenue
                  </span>
                </div>

                <div className="mt-4 font-sans text-5xl font-bold tracking-tight tabular-nums text-white md:text-6xl">
                  {money(
                    stats.totalRevenue
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-[#e4d1c2]">
                    {stats.totalOrders} total
                    orders
                  </span>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">
                    Live
                  </span>
                </div>

                <p className="mt-5 max-w-lg text-sm leading-6 text-[#b9a99e]">
                  Combined revenue generated
                  through online orders and
                  counter billing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-white/10 lg:border-l lg:border-t-0">

              <DarkMetric
                label="Today"
                value={money(
                  stats.todayRevenue
                )}
                icon={
                  <CalendarDays
                    size={17}
                  />
                }
              />

              <DarkMetric
                label="Online"
                value={money(
                  stats.onlineRevenue
                )}
                icon={
                  <ShoppingBag
                    size={17}
                  />
                }
              />

              <DarkMetric
                label="Counter"
                value={money(
                  stats.offlineRevenue
                )}
                icon={
                  <Banknote size={17} />
                }
              />

              <DarkMetric
                label="Products"
                value={String(
                  stats.activeProducts
                )}
                icon={
                  <Package size={17} />
                }
              />
            </div>
          </div>
        </section>

        {/* =================================================
            LIVE OPERATIONS
        ================================================= */}

        <section className="mt-6">

          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a06a4a]">
                Store activity
              </p>

              <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight tabular-nums text-[#382820]">
                Live operations
              </h2>
            </div>

            <span className="hidden text-xs text-[#94847a] md:block">
              Values update automatically
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <DisplayCard
              label="Today's Revenue"
              value={money(
                stats.todayRevenue
              )}
              description="Revenue generated today"
              icon={
                <TrendingUp size={18} />
              }
              trend={
                stats.todayRevenue > 0
                  ? "Active today"
                  : "No sales yet"
              }
            />

            <DisplayCard
              label="Online Sales"
              value={money(
                stats.onlineRevenue
              )}
              description="Website order revenue"
              icon={
                <ShoppingBag size={18} />
              }
              trend="Website"
            />

            <DisplayCard
              label="Counter Sales"
              value={money(
                stats.offlineRevenue
              )}
              description="Offline / POS revenue"
              icon={
                <WalletCards size={18} />
              }
              trend="Counter"
            />

            <DisplayCard
              label="Catalogue Stock"
              value={String(
                stats.activeProducts
              )}
              description="Active products"
              icon={
                <Package size={18} />
              }
              trend={
                stats.lowStockItems > 0
                  ? `${stats.lowStockItems} low stock`
                  : "Stock healthy"
              }
            />
          </div>
        </section>

        {/* =================================================
            INTERACTIVE ACTION CARDS
        ================================================= */}

        <section className="mt-6 grid gap-4 lg:grid-cols-2">

          <button
            type="button"
            onClick={() =>
              setModal("pending")
            }
            className="group rounded-[24px] border border-[#e5d9ce] bg-white p-6 text-left shadow-[0_8px_30px_rgba(75,54,40,0.04)] transition hover:-translate-y-0.5 hover:border-[#c9ad98] hover:shadow-[0_14px_40px_rgba(75,54,40,0.08)]"
          >
            <div className="flex items-start justify-between">

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0e8] text-[#a45e38]">
                <Clock3 size={21} />
              </div>

              <span className="rounded-full bg-[#f7eee8] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#9b6348]">
                Action
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e7b70]">
                  Pending Orders
                </p>

                <p className="mt-2 font-sans text-4xl font-bold tracking-tight tabular-nums text-[#342821]">
                  {stats.pendingOrders}
                </p>

                <p className="mt-2 text-sm text-[#8d7d74]">
                  Orders waiting for attention
                </p>
              </div>

              <div className="rounded-full border border-[#e4d7cc] px-4 py-2 text-xs font-semibold text-[#5c483d] transition group-hover:bg-[#382820] group-hover:text-white">
                View orders
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setModal("bills")
            }
            className="group rounded-[24px] border border-[#e5d9ce] bg-white p-6 text-left shadow-[0_8px_30px_rgba(75,54,40,0.04)] transition hover:-translate-y-0.5 hover:border-[#c9ad98] hover:shadow-[0_14px_40px_rgba(75,54,40,0.08)]"
          >
            <div className="flex items-start justify-between">

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3eee7] text-[#765b48]">
                <CreditCard size={21} />
              </div>

              <span className="rounded-full bg-[#f5f0ea] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#90715c]">
                Today
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8e7b70]">
                  Today's Bills
                </p>

                <p className="mt-2 font-sans text-4xl font-bold tracking-tight tabular-nums text-[#342821]">
                  {stats.todayBills}
                </p>

                <p className="mt-2 text-sm text-[#8d7d74]">
                  Bills generated today
                </p>
              </div>

              <div className="rounded-full border border-[#e4d7cc] px-4 py-2 text-xs font-semibold text-[#5c483d] transition group-hover:bg-[#382820] group-hover:text-white">
                View bills
              </div>
            </div>
          </button>
        </section>

        {/* =================================================
            SALES + INVENTORY
        ================================================= */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">

          {/* SALES */}

          <section className="rounded-[24px] border border-[#e5d9ce] bg-white p-6 shadow-[0_8px_30px_rgba(75,54,40,0.04)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#a06a4a]">
                  Revenue trend
                </p>

                <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight tabular-nums text-[#382820]">
                  Last 7 days
                </h2>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f6eee7] text-[#9a684c]">
                <TrendingUp size={18} />
              </div>
            </div>

            <div className="mt-8 flex h-56 items-end gap-3">

              {salesWeek.map(
                (day, index) => {
                  const height =
                    day.value === 0
                      ? 5
                      : Math.max(
                          8,
                          (day.value /
                            maxSales) *
                            100
                        );

                  return (
                    <div
                      key={`${day.label}-${index}`}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <div className="mb-2 text-[9px] font-semibold text-[#8d796e]">
                        {day.value > 0
                          ? money(
                              day.value
                            )
                          : "—"}
                      </div>

                      <div className="flex h-40 w-full items-end justify-center">
                        <div
                          className="w-full max-w-[46px] rounded-t-xl bg-[#9c684a] transition-all duration-500 hover:bg-[#382820]"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <div className="mt-3 text-[10px] font-medium text-[#8b796f]">
                        {day.label}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          {/* INVENTORY */}

          <section className="rounded-[24px] border border-[#e5d9ce] bg-white p-6 shadow-[0_8px_30px_rgba(75,54,40,0.04)]">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#a06a4a]">
                  Inventory
                </p>

                <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight tabular-nums text-[#382820]">
                  Stock health
                </h2>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f6eee7] text-[#9a684c]">
                <Package size={18} />
              </div>
            </div>

            <div className="mt-7 space-y-3">

              <InventoryRow
                label="Active products"
                value={stats.activeProducts}
                icon={
                  <CheckCircle2
                    size={17}
                  />
                }
                tone="good"
              />

              <InventoryRow
                label="Low stock"
                value={stats.lowStockItems}
                icon={
                  <AlertCircle
                    size={17}
                  />
                }
                tone={
                  stats.lowStockItems > 0
                    ? "warning"
                    : "good"
                }
              />

              <InventoryRow
                label="Total orders"
                value={stats.totalOrders}
                icon={
                  <ShoppingBag
                    size={17}
                  />
                }
                tone="neutral"
              />
            </div>

            <div className="mt-6 rounded-2xl bg-[#faf7f3] p-4">
              <div className="flex items-center gap-3">

                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#9a684c]">
                  <ArrowUpRight
                    size={16}
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#55433a]">
                    Live inventory monitor
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#96867d]">
                    Values refresh automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            FOOT SUMMARY
        ================================================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          <SmallSummary
            label="Online revenue"
            value={money(
              stats.onlineRevenue
            )}
            icon={
              <ShoppingBag size={16} />
            }
          />

          <SmallSummary
            label="Counter revenue"
            value={money(
              stats.offlineRevenue
            )}
            icon={
              <Banknote size={16} />
            }
          />

          <SmallSummary
            label="Average bill"
            value={money(
              stats.todayBills > 0
                ? stats.todayRevenue /
                    stats.todayBills
                : 0
            )}
            icon={
              <IndianRupee size={16} />
            }
          />
        </div>
      </div>

      {/* ===================================================
          PENDING ORDERS MODAL
      =================================================== */}

      {modal === "pending" && (
        <DashboardModal
          title="Pending Orders"
          subtitle={`${pendingOrders.length} order${
            pendingOrders.length === 1
              ? ""
              : "s"
          } waiting for attention`}
          onClose={() =>
            setModal(null)
          }
        >
          {pendingOrders.length === 0 ? (
            <EmptyModal
              icon={
                <CheckCircle2
                  size={25}
                />
              }
              title="No pending orders"
              description="All orders are currently up to date."
            />
          ) : (
            <div className="space-y-3">

              {pendingOrders.map(
                (order, index) => (
                  <OrderModalRow
                    key={String(
                      order.id ||
                        orderNumber(
                          order,
                          index
                        )
                    )}
                    order={order}
                    index={index}
                  />
                )
              )}
            </div>
          )}
        </DashboardModal>
      )}

      {/* ===================================================
          TODAY BILLS MODAL
      =================================================== */}

      {modal === "bills" && (
        <DashboardModal
          title="Today's Bills"
          subtitle={`${todayBills.length} bill${
            todayBills.length === 1
              ? ""
              : "s"
          } generated today`}
          onClose={() =>
            setModal(null)
          }
        >
          {todayBills.length === 0 ? (
            <EmptyModal
              icon={
                <CreditCard
                  size={25}
                />
              }
              title="No bills today"
              description="No orders or bills have been recorded today."
            />
          ) : (
            <div className="space-y-3">

              {todayBills.map(
                (order, index) => (
                  <BillModalRow
                    key={String(
                      order.id ||
                        orderNumber(
                          order,
                          index
                        )
                    )}
                    order={order}
                    index={index}
                  />
                )
              )}
            </div>
          )}
        </DashboardModal>
      )}
    </div>
  );
}

/* =========================================================
   DISPLAY-ONLY CARD
========================================================= */

function DisplayCard({
  label,
  value,
  description,
  icon,
  trend,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#e5d9ce] bg-white p-5 shadow-[0_8px_30px_rgba(75,54,40,0.04)]">

      <div className="flex items-start justify-between">

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7eee7] text-[#9b674a]">
          {icon}
        </div>

        <span className="rounded-full bg-[#faf5ef] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#96745f]">
          Live
        </span>
      </div>

      <p className="mt-5 text-xs font-medium text-[#8c7b71]">
        {label}
      </p>

      <p className="mt-1 font-sans text-3xl font-bold tracking-tight tabular-nums text-[#342821]">
        {value}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#f0e9e3] pt-3">

        <span className="text-[10px] text-[#97877e]">
          {description}
        </span>

        <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-wider text-[#9b684b]">
          {trend}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   DARK METRIC
========================================================= */

function DarkMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-b border-r border-white/10 p-6 last:border-r-0">

      <div className="flex items-center gap-2 text-[#bfa18d]">
        {icon}

        <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
          {label}
        </span>
      </div>

      <p className="mt-3 font-sans text-2xl font-bold tracking-tight tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INVENTORY ROW
========================================================= */

function InventoryRow({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "good" | "warning" | "neutral";
}) {
  const toneClass =
    tone === "warning"
      ? "text-[#b26a42] bg-[#fff2ea]"
      : tone === "good"
      ? "text-[#4e8061] bg-[#eef7f0]"
      : "text-[#8c6c57] bg-[#f6eee7]";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#eee6df] bg-[#fcfaf8] p-4">

      <div className="flex items-center gap-3">

        <div
          className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-[#655249]">
          {label}
        </span>
      </div>

      <span className="font-serif text-xl font-semibold text-[#392c25]">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   SMALL SUMMARY
========================================================= */

function SmallSummary({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e5d9ce] bg-white p-4">

      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f6eee7] text-[#9a684c]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#938077]">
          {label}
        </p>

        <p className="mt-1 font-serif text-xl font-semibold text-[#382820]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function DashboardModal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241b16]/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[#e4d8ce] bg-[#fbf8f4] shadow-[0_30px_100px_rgba(34,24,18,0.28)]">

        <div className="flex items-start justify-between border-b border-[#e8dfd7] bg-white p-6">

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a06a4a]">
              Thirumala Bakery
            </p>

            <h2 className="mt-1 font-sans text-2xl font-bold tracking-tight tabular-nums text-[#382820]">
              {title}
            </h2>

            <p className="mt-1 text-xs text-[#8c7c72]">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#e4d9d0] bg-white text-[#69574c] transition hover:bg-[#f7f1eb]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PENDING ORDER ROW
========================================================= */

function OrderModalRow({
  order,
  index,
}: {
  order: Order;
  index: number;
}) {
  const total = orderTotal(order);
  const name = customerName(order);
  const phone = customerPhone(order);
  const number = orderNumber(
    order,
    index
  );
  const status = orderStatus(order);

  return (
    <div className="rounded-2xl border border-[#e5d9ce] bg-white p-4">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex min-w-0 items-center gap-3">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff0e8] text-[#a45e38]">
            <Clock3 size={18} />
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <span className="text-sm font-semibold text-[#382820]">
                {number}
              </span>

              <span className="rounded-full bg-[#fff1e9] px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-[#a45e38]">
                {status}
              </span>
            </div>

            <p className="mt-1 truncate text-xs text-[#76665d]">
              {name}
              {phone
                ? ` · ${phone}`
                : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 md:justify-end">

          <div className="text-left md:text-right">
            <p className="text-[9px] uppercase tracking-wider text-[#9a8a80]">
              Items
            </p>

            <p className="mt-1 text-sm font-semibold text-[#4c3a31]">
              {itemCount(order)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-[#9a8a80]">
              Amount
            </p>

            <p className="mt-1 font-serif text-lg font-semibold text-[#382820]">
              {money(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#f0e9e3] pt-3 text-[10px] text-[#98877d]">
        {orderDate(order).toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TODAY BILL ROW
========================================================= */

function BillModalRow({
  order,
  index,
}: {
  order: Order;
  index: number;
}) {
  const total = orderTotal(order);
  const name = customerName(order);
  const number = orderNumber(
    order,
    index
  );

  return (
    <div className="rounded-2xl border border-[#e5d9ce] bg-white p-4">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f4eee7] text-[#795d48]">
            <CreditCard size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#382820]">
              {number}
            </p>

            <p className="mt-1 text-xs text-[#7f7067]">
              {name}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-8 sm:justify-end">

          <div>
            <p className="text-[9px] uppercase tracking-wider text-[#9a8a80]">
              Payment
            </p>

            <p className="mt-1 text-xs font-semibold text-[#59473d]">
              {paymentMethod(order)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-[#9a8a80]">
              Total
            </p>

            <p className="mt-1 font-serif text-lg font-semibold text-[#382820]">
              {money(total)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#f0e9e3] pt-3 text-[10px] text-[#98877d]">

        <span>
          {orderDate(
            order
          ).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </span>

        <span className="rounded-full bg-[#eef7f0] px-2.5 py-1 font-semibold text-[#4f7c5d]">
          Recorded
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY MODAL
========================================================= */

function EmptyModal({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">

      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#f4eee8] text-[#987057]">
        {icon}
      </div>

      <h3 className="mt-5 font-serif text-xl font-semibold text-[#382820]">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-[#8d7d74]">
        {description}
      </p>
    </div>
  );
}