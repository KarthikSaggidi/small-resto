"use client";

import {
  BarChart3,
  CalendarDays,
  Download,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getOrders,
  getProducts,
  Order,
  Product,
} from "@/lib/store";

type RangeKey = "today" | "7days" | "30days" | "all";

type ReportRow = {
  name: string;
  quantity: number;
  revenue: number;
};

function getOrderDate(order: Order) {
  const raw = order.createdAt || "";

  if (!raw) {
    return new Date();
  }

  const date = new Date(raw);

  return Number.isNaN(date.getTime())
    ? new Date()
    : date;
}

function getOrderTotal(order: Order) {
  if (typeof order.total === "number") {
    return order.total;
  }

  const items = order.items || [];

  return items.reduce((sum, item) => {
    const price =
      typeof item.price === "number"
        ? item.price
        : Number(item.price || 0);

    const quantity =
      typeof item.quantity === "number"
        ? item.quantity
        : Number(item.quantity || 1);

    return sum + price * quantity;
  }, 0);
}

function getPaymentMethod(order: Order) {
  const value = String(
    order.paymentMethod || ""
  ).toLowerCase();

  if (value.includes("cash")) {
    return "Cash";
  }

  if (value.includes("upi")) {
    return "UPI";
  }

  if (value.includes("card")) {
    return "Card";
  }

  if (value.includes("online")) {
    return "Online";
  }

  return "Other";
}

function getRangeStart(range: RangeKey) {
  const now = new Date();

  if (range === "all") {
    return null;
  }

  const start = new Date(now);

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (range === "7days") {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  start.setDate(start.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  return start;
}

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function downloadCSV(
  filename: string,
  rows: string[][]
) {
  const csv = rows
    .map((row) =>
      row
        .map(
          (value) =>
            `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [range, setRange] =
    useState<RangeKey>("30days");

  useEffect(() => {
    const load = () => {
      setOrders(getOrders());
      setProducts(getProducts());
    };

    load();

    window.addEventListener("storage", load);
    window.addEventListener("tb-store", load);
    window.addEventListener(
      "thirumala-orders-updated",
      load
    );
    window.addEventListener(
      "thirumala-products-updated",
      load
    );

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("tb-store", load);
      window.removeEventListener(
        "thirumala-orders-updated",
        load
      );
      window.removeEventListener(
        "thirumala-products-updated",
        load
      );
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const start = getRangeStart(range);

    return orders.filter((order) => {
      const date = getOrderDate(order);

      if (!start) {
        return true;
      }

      return date >= start;
    });
  }, [orders, range]);

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let onlineRevenue = 0;
    let cashRevenue = 0;
    let upiRevenue = 0;
    let cardRevenue = 0;
    let otherRevenue = 0;

    filteredOrders.forEach((order) => {
      const total = getOrderTotal(order);
      const payment = getPaymentMethod(order);

      totalRevenue += total;

      if (payment === "Cash") {
        cashRevenue += total;
      } else if (payment === "UPI") {
        upiRevenue += total;
      } else if (payment === "Card") {
        cardRevenue += total;
      } else if (payment === "Online") {
        onlineRevenue += total;
      } else {
        otherRevenue += total;
      }
    });

    return {
      totalRevenue,
      onlineRevenue,
      cashRevenue,
      upiRevenue,
      cardRevenue,
      otherRevenue,
      orders: filteredOrders.length,
      averageOrder:
        filteredOrders.length > 0
          ? totalRevenue / filteredOrders.length
          : 0,
    };
  }, [filteredOrders]);

  const productSales = useMemo<ReportRow[]>(() => {
    const map = new Map<string, ReportRow>();

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Product";

        const quantity =
          typeof item.quantity === "number"
            ? item.quantity
            : Number(item.quantity || 1);

        const price =
          typeof item.price === "number"
            ? item.price
            : Number(item.price || 0);

        const existing = map.get(name);

        if (existing) {
          existing.quantity += quantity;
          existing.revenue += price * quantity;
        } else {
          map.set(name, {
            name,
            quantity,
            revenue: price * quantity,
          });
        }
      });
    });

    return Array.from(map.values())
      .sort(
        (a, b) => b.revenue - a.revenue
      )
      .slice(0, 10);
  }, [filteredOrders]);

  const categorySales = useMemo<ReportRow[]>(() => {
    const map = new Map<string, ReportRow>();

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const product = products.find(
          (product) =>
            product.id === item.productId ||
            product.name === item.name
        );

        const category =
          product?.category ||
          "Other";

        const quantity =
          typeof item.quantity === "number"
            ? item.quantity
            : Number(item.quantity || 1);

        const price =
          typeof item.price === "number"
            ? item.price
            : Number(item.price || 0);

        const existing = map.get(category);

        if (existing) {
          existing.quantity += quantity;
          existing.revenue += price * quantity;
        } else {
          map.set(category, {
            name: category,
            quantity,
            revenue: price * quantity,
          });
        }
      });
    });

    return Array.from(map.values()).sort(
      (a, b) => b.revenue - a.revenue
    );
  }, [filteredOrders, products]);

  const dailySales = useMemo(() => {
    const map = new Map<string, number>();

    filteredOrders.forEach((order) => {
      const date = getOrderDate(order);

      const key = date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      );

      map.set(
        key,
        (map.get(key) || 0) +
          getOrderTotal(order)
      );
    });

    return Array.from(map.entries()).slice(-14);
  }, [filteredOrders]);

  const maxDailyRevenue = Math.max(
    ...dailySales.map(([, value]) => value),
    1
  );

  const exportReport = () => {
    const rows: string[][] = [
      ["Thirumala Bakery - Sales Report"],
      ["Report Range", range],
      [],

      ["Summary"],
      ["Metric", "Value"],
      [
        "Total Revenue",
        stats.totalRevenue.toString(),
      ],
      [
        "Online Revenue",
        stats.onlineRevenue.toString(),
      ],
      [
        "Cash Revenue",
        stats.cashRevenue.toString(),
      ],
      [
        "UPI Revenue",
        stats.upiRevenue.toString(),
      ],
      [
        "Card Revenue",
        stats.cardRevenue.toString(),
      ],
      ["Orders", stats.orders.toString()],
      [
        "Average Order Value",
        stats.averageOrder.toString(),
      ],
      [],

      ["Top Products"],
      ["Product", "Quantity", "Revenue"],

      ...productSales.map((item) => [
        item.name,
        item.quantity.toString(),
        item.revenue.toString(),
      ]),

      [],

      ["Category Sales"],
      ["Category", "Quantity", "Revenue"],

      ...categorySales.map((item) => [
        item.name,
        item.quantity.toString(),
        item.revenue.toString(),
      ]),
    ];

    downloadCSV(
      `thirumala-bakery-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      rows
    );
  };

  return (
    <div className="min-h-full bg-[#f8f4ee] p-5 md:p-7">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9a684c]">
              Business analytics
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold text-[#382820] md:text-4xl">
              Reports
            </h1>

            <p className="mt-2 text-sm text-[#806f66]">
              Track sales, orders, products and payment performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center rounded-xl border border-[#dfd3c8] bg-white px-3">
              <CalendarDays
                size={16}
                className="mr-2 text-[#8f5b3e]"
              />

              <select
                value={range}
                onChange={(e) =>
                  setRange(
                    e.target.value as RangeKey
                  )
                }
                className="bg-transparent py-3 text-sm font-medium text-[#49382f] outline-none"
              >
                <option value="today">
                  Today
                </option>
                <option value="7days">
                  Last 7 days
                </option>
                <option value="30days">
                  Last 30 days
                </option>
                <option value="all">
                  All time
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={exportReport}
              className="inline-flex items-center rounded-xl bg-[#382820] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4a3429]"
            >
              <Download
                size={16}
                className="mr-2"
              />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(
              stats.totalRevenue
            )}
            subtitle={`${stats.orders} orders`}
            icon={
              <IndianRupee size={19} />
            }
          />

          <StatCard
            title="Online Revenue"
            value={formatCurrency(
              stats.onlineRevenue
            )}
            subtitle="Website orders"
            icon={
              <ShoppingBag size={19} />
            }
          />

          <StatCard
            title="Cash Revenue"
            value={formatCurrency(
              stats.cashRevenue
            )}
            subtitle="Offline billing"
            icon={
              <WalletCards size={19} />
            }
          />

          <StatCard
            title="Average Order"
            value={formatCurrency(
              stats.averageOrder
            )}
            subtitle="Average order value"
            icon={
              <TrendingUp size={19} />
            }
          />
        </div>

        {/* Sales chart */}
        <section className="mt-5 rounded-2xl border border-[#e5dacf] bg-white p-5 shadow-[0_10px_30px_rgba(77,55,43,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#382820]">
                Sales Overview
              </h2>

              <p className="mt-1 text-xs text-[#8b796f]">
                Revenue generated during the selected period.
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9de] text-[#8f5b3e]">
              <BarChart3 size={18} />
            </div>
          </div>

          {dailySales.length > 0 ? (
            <div className="mt-8 flex h-64 items-end gap-2 overflow-x-auto pb-7">
              {dailySales.map(
                ([label, value]) => {
                  const height = Math.max(
                    8,
                    (value /
                      maxDailyRevenue) *
                      100
                  );

                  return (
                    <div
                      key={label}
                      className="flex min-w-[45px] flex-1 flex-col items-center justify-end"
                    >
                      <div className="mb-2 text-[9px] font-semibold text-[#856f63]">
                        {formatCurrency(value)}
                      </div>

                      <div className="flex h-40 w-full items-end justify-center">
                        <div
                          className="w-7 rounded-t-lg bg-[#9a684c] transition-all duration-500 hover:bg-[#382820]"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${label}: ${formatCurrency(
                            value
                          )}`}
                        />
                      </div>

                      <div className="mt-2 whitespace-nowrap text-[9px] text-[#8b796f]">
                        {label}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="grid h-56 place-items-center text-sm text-[#8b796f]">
              No sales data available for this period.
            </div>
          )}
        </section>

        {/* Product + category reports */}
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <ReportTable
            title="Top Selling Products"
            subtitle="Products generating the most revenue."
            icon={<Package size={18} />}
            rows={productSales}
          />

          <ReportTable
            title="Category Performance"
            subtitle="Revenue grouped by product category."
            icon={<BarChart3 size={18} />}
            rows={categorySales}
          />
        </div>

        {/* Payment summary */}
        <section className="mt-5 rounded-2xl border border-[#e5dacf] bg-white p-5 shadow-[0_10px_30px_rgba(77,55,43,0.04)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9de] text-[#8f5b3e]">
              <WalletCards size={18} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#382820]">
                Payment Summary
              </h2>

              <p className="text-xs text-[#8b796f]">
                Revenue grouped by payment method.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PaymentCard
              label="Cash"
              amount={stats.cashRevenue}
            />

            <PaymentCard
              label="UPI"
              amount={stats.upiRevenue}
            />

            <PaymentCard
              label="Card"
              amount={stats.cardRevenue}
            />

            <PaymentCard
              label="Online"
              amount={stats.onlineRevenue}
            />
          </div>
        </section>

        {/* Inventory snapshot */}
        <section className="mt-5 rounded-2xl border border-[#e5dacf] bg-white p-5 shadow-[0_10px_30px_rgba(77,55,43,0.04)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9de] text-[#8f5b3e]">
              <Package size={18} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#382820]">
                Inventory Snapshot
              </h2>

              <p className="text-xs text-[#8b796f]">
                Current product availability.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniMetric
              label="Total Products"
              value={products.length}
            />

            <MiniMetric
              label="Active Products"
              value={products.length}
            />

            <MiniMetric
              label="Low Stock"
              value={
                products.filter(
                  (product) => {
                    const stock = Number(
                      product.stock || 0
                    );

                    const threshold = 10;

                    return stock <= threshold;
                  }
                ).length
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e5dacf] bg-white p-5 shadow-[0_10px_30px_rgba(77,55,43,0.04)]">
      <div className="flex items-start justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9de] text-[#8f5b3e]">
          {icon}
        </div>

        <span className="rounded-full bg-[#f8f2eb] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#9a684c]">
          Report
        </span>
      </div>

      <p className="mt-5 text-xs text-[#8b796f]">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight text-[#382820]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-[#9a8a81]">
        {subtitle}
      </p>
    </div>
  );
}

function ReportTable({
  title,
  subtitle,
  icon,
  rows,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  rows: ReportRow[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5dacf] bg-white shadow-[0_10px_30px_rgba(77,55,43,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#eee5dd] p-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f4e9de] text-[#8f5b3e]">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-xl font-semibold text-[#382820]">
            {title}
          </h2>

          <p className="text-xs text-[#8b796f]">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-[#eee5dd] bg-[#fbf8f3] text-left">
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#907d72]">
                Name
              </th>

              <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#907d72]">
                Qty
              </th>

              <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-[#907d72]">
                Revenue
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-[#f1eae4] last:border-0"
                >
                  <td className="px-5 py-4 font-medium text-[#49382f]">
                    {row.name}
                  </td>

                  <td className="px-5 py-4 text-right text-[#806f66]">
                    {row.quantity}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-[#382820]">
                    {formatCurrency(
                      row.revenue
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-12 text-center text-sm text-[#8b796f]"
                >
                  No sales data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaymentCard({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <div className="rounded-xl border border-[#e8ded5] bg-[#fcfaf7] p-4">
      <p className="text-xs text-[#8b796f]">
        {label}
      </p>

      <p className="mt-1 text-xl font-semibold text-[#382820]">
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#e8ded5] bg-[#fcfaf7] p-4">
      <p className="text-xs text-[#8b796f]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold text-[#382820]">
        {value}
      </p>
    </div>
  );
}