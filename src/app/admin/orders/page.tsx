"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  PackageCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  X,
  Send,
} from "lucide-react";

import {
  getOrders,
  updateOrder,
  type Order,
} from "@/lib/store";

const statuses = [
  "All",
  "Pending",
  "Confirmed",
  "Preparing",
  "Packed",
  "Ready for Pickup",
  "Completed",
  "Cancelled",
];

const ROWS_PER_PAGE = 8;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  // Rejection modal state
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  function load() {
    try {
      setOrders(getOrders());
    } catch (error) {
      console.error("Unable to load orders:", error);
      setOrders([]);
    }
  }

  useEffect(() => {
    load();

    const interval = window.setInterval(load, 1500);

    const handler = () => load();

    window.addEventListener("storage", handler);
    window.addEventListener("thirumala-store-update", handler);

    return () => {
      window.clearInterval(interval);

      window.removeEventListener("storage", handler);
      window.removeEventListener("thirumala-store-update", handler);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const orderNumber = order.orderNumber ?? "";
      const customerName = order.customerName ?? "";
      const mobile = order.mobile ?? "";

      const matchesSearch =
        !query ||
        orderNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        mobile.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" ||
        order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ROWS_PER_PAGE)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // Correct pagination calculation
  const startIndex = (page - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;

  const visibleOrders = filtered.slice(startIndex, endIndex);

  const emptyRows = Math.max(
    0,
    ROWS_PER_PAGE - visibleOrders.length
  );

  function changeStatus(
    id: string,
    value: Order["status"]
  ) {
    updateOrder(id, {
      status: value,
    });

    load();

    window.dispatchEvent(
      new Event("thirumala-store-update")
    );
  }

  function handleAccept(orderId: string) {
    changeStatus(orderId, "Confirmed");
  }

  function handleConfirmReject() {
    if (!rejectingOrder) return;

    if (!rejectionNote.trim()) {
      alert("Please provide a note/reason for rejection.");
      return;
    }

    updateOrder(rejectingOrder.id, {
      status: "Cancelled",
    });

    load();

    window.dispatchEvent(
      new Event("thirumala-store-update")
    );

    const orderNumber =
      rejectingOrder.orderNumber ?? "—";

    const customerName =
      rejectingOrder.customerName ?? "customer";

    // Simulate sending email notification to the user
    alert(
      `Order #${orderNumber} rejected.\nEmail notification sent to customer (${customerName}) with note:\n"${rejectionNote}"`
    );

    setRejectingOrder(null);
    setRejectionNote("");
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function exportToCSV() {
    if (!filtered.length) {
      alert("No orders available to export.");
      return;
    }

    const headers = [
      "Order Number",
      "Customer Name",
      "Mobile",
      "Status",
      "Items Count",
      "Total Amount (INR)",
      "Date",
    ];

    const rows = filtered.map((order) => [
      `"${order.orderNumber ?? ""}"`,
      `"${(order.customerName ?? "").replace(
        /"/g,
        '""'
      )}"`,
      `"${order.mobile ?? ""}"`,
      `"${order.status}"`,
      order.items.length,
      order.total,
      `"${new Date(order.createdAt).toLocaleString(
        "en-IN"
      )}"`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `thirumala-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  const firstShown =
    filtered.length === 0
      ? 0
      : startIndex + 1;

  const lastShown = Math.min(
    endIndex,
    filtered.length
  );

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-8 text-[#30271f]">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#927d6a]">
              Orders
            </div>

            <h1 className="font-serif text-4xl font-semibold md:text-5xl">
              Online Orders
            </h1>

            <p className="mt-2 text-[#786d63]">
              Manage incoming customer orders,
              fulfillment stages, and notifications
              in real-time.
            </p>
          </div>

          <div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 rounded-xl border border-[#ded3c8] bg-white px-5 py-3 text-sm font-semibold text-[#46362e] shadow-sm transition hover:bg-[#f7f1eb]"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94877b]"
            />

            <input
              value={search}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              placeholder="Search order number, customer or mobile..."
              className="h-12 w-full rounded-2xl border border-[#ded3c8] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#8d7762]"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              handleStatus(event.target.value)
            }
            className="h-12 cursor-pointer rounded-2xl border border-[#ded3c8] bg-white px-4 text-sm outline-none"
          >
            {statuses.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE WRAPPER */}
        <div className="overflow-hidden rounded-3xl border border-[#e3d9cf] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eee6dd] bg-[#f8f3ee] text-[10px] font-bold uppercase tracking-[0.1em] text-[#88786e]">
                  <th className="w-16 px-6 py-4">
                    S.No
                  </th>

                  <th className="px-6 py-4">
                    Order ID
                  </th>

                  <th className="px-6 py-4">
                    Customer
                  </th>

                  <th className="px-6 py-4">
                    Date & Time
                  </th>

                  <th className="px-6 py-4">
                    Items Summary
                  </th>

                  <th className="px-6 py-4">
                    Total
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions / Workflow
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eee6dd]">
                {visibleOrders.map(
                  (order, index) => {
                    const serialNumber =
                      startIndex + index + 1;

                    const isPending =
                      order.status === "Pending";

                    return (
                      <tr
                        key={order.id}
                        className="transition hover:bg-[#fcfaf7]"
                      >
                        <td className="px-6 py-4 text-xs font-semibold text-[#8e8179]">
                          {serialNumber < 10
                            ? `0${serialNumber}`
                            : serialNumber}
                        </td>

                        <td className="px-6 py-4 font-semibold text-[#30271f]">
                          {order.orderNumber ?? "—"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-[#30271f]">
                            {order.customerName ??
                              "Unknown Customer"}
                          </div>

                          <div className="text-xs text-[#9a8e83]">
                            {order.mobile ??
                              "No mobile"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs text-[#766b61]">
                          {new Date(
                            order.createdAt
                          ).toLocaleString("en-IN")}
                        </td>

                        <td className="px-6 py-4 text-sm text-[#766b61]">
                          <span className="font-semibold text-[#30271f]">
                            {order.items.reduce(
                              (acc, item) =>
                                acc + item.quantity,
                              0
                            )}{" "}
                            items
                          </span>

                          <div className="max-w-[200px] truncate text-xs text-[#9a8e83]">
                            {order.items
                              .map(
                                (item) =>
                                  `${item.name} (${item.quantity})`
                              )
                              .join(", ")}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-semibold text-[#30271f]">
                          ₹
                          {Number(
                            order.total
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={order.status}
                          />
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleAccept(
                                    order.id
                                  )
                                }
                                className="rounded-xl bg-[#477453] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#3c6146]"
                              >
                                Accept
                              </button>

                              <button
                                onClick={() =>
                                  setRejectingOrder(
                                    order
                                  )
                                }
                                className="rounded-xl bg-[#a45149] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#8e443e]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : order.status ===
                              "Cancelled" ||
                            order.status ===
                              "Completed" ? (
                            <span className="text-xs font-medium italic text-[#9a8e83]">
                              No actions
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={order.status}
                                onChange={(event) =>
                                  changeStatus(
                                    order.id,
                                    event.target
                                      .value as Order["status"]
                                  )
                                }
                                className="h-10 cursor-pointer rounded-xl border border-[#ddd2c6] bg-[#fffdfa] px-3 text-xs font-medium outline-none transition hover:border-[#8d7762]"
                              >
                                <option value="Confirmed">
                                  Confirmed
                                </option>

                                <option value="Preparing">
                                  Preparing
                                </option>

                                <option value="Packed">
                                  Packed
                                </option>

                                <option value="Ready for Pickup">
                                  Ready for Pickup
                                </option>

                                <option value="Completed">
                                  Completed
                                </option>

                                <option value="Cancelled">
                                  Cancelled
                                </option>
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}

                {/* EMPTY FIXED ROWS PADDING */}
                {emptyRows > 0 &&
                  Array.from({
                    length: emptyRows,
                  }).map((_, index) => (
                    <tr
                      key={`empty-${index}`}
                      className="bg-white"
                    >
                      <td
                        colSpan={8}
                        className="px-6 py-4"
                      >
                        &nbsp;
                      </td>
                    </tr>
                  ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center"
                    >
                      <PackageCheck
                        size={42}
                        className="mx-auto mb-4 text-[#b5a99e]"
                      />

                      <h2 className="font-serif text-2xl font-semibold">
                        No online orders found
                      </h2>

                      <p className="mt-2 text-sm text-[#8b7f74]">
                        Orders placed from the
                        website or matching
                        filters will appear here
                        automatically.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-[#e3d9cf] bg-[#f8f3ee] px-6 py-4">
            <div className="text-xs text-[#88786e]">
              Showing{" "}
              <strong className="text-[#30271f]">
                {firstShown}
              </strong>
              –
              <strong className="text-[#30271f]">
                {lastShown}
              </strong>{" "}
              of{" "}
              <strong className="text-[#30271f]">
                {filtered.length}
              </strong>{" "}
              orders
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
                className="flex items-center gap-1 rounded-xl border border-[#ded3c8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5e534b] shadow-sm transition hover:bg-[#f5efe9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span className="min-w-[85px] text-center text-xs font-medium text-[#786d63]">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
                className="flex items-center gap-1 rounded-xl border border-[#ded3c8] bg-white px-3.5 py-2 text-xs font-semibold text-[#5e534b] shadow-sm transition hover:bg-[#f5efe9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REJECTION NOTE MODAL */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#e3d9cf] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eee6dd] pb-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#30271f]">
                  Reject Order #
                  {rejectingOrder.orderNumber ??
                    "—"}
                </h3>

                <p className="text-xs text-[#786d63]">
                  Provide a note explaining why
                  this order is being rejected.
                  This will be sent to the user
                  via email.
                </p>
              </div>

              <button
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionNote("");
                }}
                className="rounded-xl border border-[#ded3c8] p-2 text-[#786d63] hover:bg-[#f7f1eb]"
                aria-label="Close rejection modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4">
              <label className="mb-2 block text-xs font-semibold text-[#5e534b]">
                Rejection Reason / Note *
              </label>

              <textarea
                rows={4}
                value={rejectionNote}
                onChange={(event) =>
                  setRejectionNote(
                    event.target.value
                  )
                }
                placeholder="e.g., Sorry, item is currently out of stock or bakery is closed..."
                className="w-full rounded-2xl border border-[#ded3c8] p-3 text-sm outline-none focus:border-[#8d7762]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#eee6dd] pt-3">
              <button
                onClick={() => {
                  setRejectingOrder(null);
                  setRejectionNote("");
                }}
                className="rounded-xl border border-[#ded3c8] bg-white px-4 py-2.5 text-xs font-semibold text-[#5e534b] hover:bg-[#f7f1eb]"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmReject}
                className="flex items-center gap-1.5 rounded-xl bg-[#a45149] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#8e443e]"
              >
                <Send size={14} />
                Confirm Rejection & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Order["status"];
}) {
  const icon =
    status === "Completed" ? (
      <CheckCircle2 size={13} />
    ) : status === "Cancelled" ? (
      <XCircle size={13} />
    ) : status === "Preparing" ||
      status === "Packed" ||
      status === "Ready for Pickup" ? (
      <PackageCheck size={13} />
    ) : (
      <Clock3 size={13} />
    );

  const badgeColor =
    status === "Completed"
      ? "bg-[#edf6ef] text-[#477453]"
      : status === "Cancelled"
      ? "bg-[#fceeed] text-[#a45149]"
      : status === "Preparing" ||
        status === "Packed" ||
        status === "Ready for Pickup"
      ? "bg-[#fff4e9] text-[#a76735]"
      : "bg-[#f1ebe3] text-[#5e534b]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
    >
      {icon}
      {status}
    </span>
  );
}