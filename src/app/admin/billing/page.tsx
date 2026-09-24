"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  UserRound,
  ShoppingBag,
  X,
  Printer,
  Check,
  RotateCcw,
} from "lucide-react";
import styles from "./Billing.module.css";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
};

type BillItem = Product & {
  quantity: number;
};

const fallbackProducts: Product[] = [
  { id: "cake-1", name: "Black Forest Cake", price: 650, category: "Cakes" },
  { id: "cake-2", name: "White Forest Cake", price: 700, category: "Cakes" },
  { id: "cake-3", name: "Chocolate Truffle Cake", price: 850, category: "Cakes" },
  { id: "cake-4", name: "Red Velvet Cake", price: 900, category: "Cakes" },
  { id: "cake-5", name: "Butterscotch Cake", price: 750, category: "Cakes" },
  { id: "cake-6", name: "Pineapple Cake", price: 600, category: "Cakes" },
  { id: "snack-1", name: "Chicken Puff", price: 55, category: "Snacks" },
  { id: "snack-2", name: "Veg Puff", price: 35, category: "Snacks" },
  { id: "snack-3", name: "Egg Puff", price: 45, category: "Snacks" },
  { id: "snack-4", name: "Veg Sandwich", price: 80, category: "Snacks" },
  { id: "snack-5", name: "Chicken Sandwich", price: 110, category: "Snacks" },
  { id: "snack-6", name: "Samosa", price: 25, category: "Snacks" },
  { id: "pastry-1", name: "Chocolate Pastry", price: 80, category: "Pastries" },
  { id: "pastry-2", name: "Red Velvet Pastry", price: 95, category: "Pastries" },
  { id: "pastry-3", name: "Black Forest Pastry", price: 85, category: "Pastries" },
  { id: "pastry-4", name: "Pineapple Pastry", price: 75, category: "Pastries" },
  { id: "drink-1", name: "Cold Coffee", price: 90, category: "Beverages" },
  { id: "drink-2", name: "Fresh Lime", price: 50, category: "Beverages" },
];

function readProducts(): Product[] {
  if (typeof window === "undefined") return fallbackProducts;

  const keys = [
    "thirumala_products",
    "thirumala_bakery_products",
    "bakery_products",
    "products",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed) || parsed.length === 0) continue;

      const normalized = parsed
        .map((item: any, index: number) => ({
          id: String(item.id ?? item._id ?? `${key}-${index}`),
          name: String(item.name ?? item.title ?? "Unnamed Product"),
          price: Number(item.price ?? item.sellingPrice ?? item.salePrice ?? 0),
          category: String(
            item.category ?? item.categoryName ?? "Other"
          ),
          stock:
            item.stock === undefined || item.stock === null
              ? undefined
              : Number(item.stock),
        }))
        .filter((item: Product) => item.name && item.price >= 0);

      if (normalized.length) return normalized;
    } catch {
      continue;
    }
  }

  return fallbackProducts;
}

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [items, setItems] = useState<BillItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [discount, setDiscount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [billNumber, setBillNumber] = useState("");

  useEffect(() => {
    const load = () => {
      setProducts(readProducts());
    };

    load();

    const interval = window.setInterval(load, 1500);

    const handleStorage = () => load();

    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const categories = useMemo(() => {
    const values = products.map((product) => product.category);
    return ["All", ...Array.from(new Set(values))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Number(discount) || 0)
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const tax = taxableAmount * 0.05;

  const total = taxableAmount + tax;

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function addProduct(product: Product) {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function decreaseProduct(id: string) {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function increaseProduct(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function removeProduct(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function clearBill() {
    setItems([]);
    setCustomerName("");
    setMobile("");
    setDiscount("");
    setPayment("Cash");
  }

  function completeBill() {
    if (!items.length) return;

    const generatedNumber =
      "TB-" +
      Date.now().toString().slice(-8);

    const bill = {
      id: generatedNumber,
      billNumber: generatedNumber,
      customerName,
      mobile,
      payment,
      items,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      createdAt: new Date().toISOString(),
      type: "offline",
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("thirumala_offline_bills") || "[]"
      );

      localStorage.setItem(
        "thirumala_offline_bills",
        JSON.stringify([bill, ...existing])
      );

      localStorage.setItem(
        "thirumala_last_bill",
        JSON.stringify(bill)
      );
    } catch {}

    setBillNumber(generatedNumber);
    setShowReceipt(true);
  }

  function printReceipt() {
    window.print();
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.workspace}>
          <section className={styles.productsPanel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Products</h2>
                <span>{filteredProducts.length} products</span>
              </div>

              <div className={styles.itemsBadge}>
                {totalItems} items in bill
              </div>
            </div>

            <div className={styles.searchBox}>
              <Search size={19} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products by name or category..."
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={styles.clearSearch}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.categoryRow}>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    category === item
                      ? styles.categoryActive
                      : styles.categoryButton
                  }
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.productGrid}>
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className={styles.productCard}
                  onClick={() => addProduct(product)}
                >
                  <span className={styles.productName}>
                    {product.name}
                  </span>

                  <span className={styles.productBottom}>
                    <strong>₹{product.price.toLocaleString("en-IN")}</strong>

                    <span className={styles.addCircle}>
                      <Plus size={15} />
                    </span>
                  </span>
                </button>
              ))}

              {!filteredProducts.length && (
                <div className={styles.emptyProducts}>
                  <ShoppingBag size={28} />
                  <strong>No products found</strong>
                  <span>
                    Try another search or category.
                  </span>
                </div>
              )}
            </div>
          </section>

          <aside className={styles.billPanel}>
            <div className={styles.billHeader}>
              <div>
                <div className={styles.billTitleRow}>
                  <Receipt size={21} />
                  <h2>Bill Summary</h2>
                </div>
                <span>
                  {totalItems} {totalItems === 1 ? "item" : "items"} in
                  current bill
                </span>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  className={styles.removeAll}
                  onClick={clearBill}
                >
                  Clear
                </button>
              )}
            </div>

            <div className={styles.billItems}>
              {items.length === 0 ? (
                <div className={styles.emptyBill}>
                  <div className={styles.emptyBillIcon}>
                    <ShoppingBag size={23} />
                  </div>
                  <strong>No items added</strong>
                  <span>
                    Select a product to start the bill.
                  </span>
                </div>
              ) : (
                items.map((item) => (
                  <div className={styles.billItem} key={item.id}>
                    <div className={styles.billItemInfo}>
                      <strong>{item.name}</strong>
                      <span>
                        ₹{item.price.toLocaleString("en-IN")} each
                      </span>
                    </div>

                    <div className={styles.billItemRight}>
                      <strong>
                        ₹
                        {(item.price * item.quantity).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <div className={styles.quantityRow}>
                        <button
                          type="button"
                          onClick={() => decreaseProduct(item.id)}
                        >
                          <Minus size={14} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseProduct(item.id)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.removeItem}
                        onClick={() => removeProduct(item.id)}
                      >
                        <Trash2 size={13} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className={styles.customerSection}>
              <div className={styles.sectionLabel}>
                CUSTOMER
              </div>

              <div className={styles.customerGrid}>
                <label className={styles.inputWrap}>
                  <UserRound size={15} />
                  <input
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                    placeholder="Customer name"
                  />
                </label>

                <input
                  className={styles.plainInput}
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value)
                  }
                  placeholder="Mobile"
                  inputMode="numeric"
                />
              </div>

              <div className={styles.sectionLabel}>
                PAYMENT METHOD
              </div>

              <div className={styles.paymentGrid}>
                <button
                  type="button"
                  className={
                    payment === "Cash"
                      ? styles.paymentActive
                      : styles.paymentButton
                  }
                  onClick={() => setPayment("Cash")}
                >
                  <Banknote size={17} />
                  Cash
                </button>

                <button
                  type="button"
                  className={
                    payment === "UPI"
                      ? styles.paymentActive
                      : styles.paymentButton
                  }
                  onClick={() => setPayment("UPI")}
                >
                  <Smartphone size={17} />
                  UPI
                </button>

                <button
                  type="button"
                  className={
                    payment === "Card"
                      ? styles.paymentActive
                      : styles.paymentButton
                  }
                  onClick={() => setPayment("Card")}
                >
                  <CreditCard size={17} />
                  Card
                </button>
              </div>

              <div className={styles.discountRow}>
                <span>Discount</span>

                <div className={styles.discountInput}>
                  <span>₹</span>
                  <input
                    value={discount}
                    onChange={(event) =>
                      setDiscount(
                        event.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            <div className={styles.totals}>
              <div>
                <span>Subtotal</span>
                <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>

              {discountAmount > 0 && (
                <div className={styles.discountTotal}>
                  <span>Discount</span>
                  <strong>
                    -₹{discountAmount.toLocaleString("en-IN")}
                  </strong>
                </div>
              )}

              <div>
                <span>GST 5%</span>
                <strong>₹{tax.toLocaleString("en-IN")}</strong>
              </div>

              <div className={styles.grandTotal}>
                <span>Total</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <button
              type="button"
              className={styles.completeButton}
              onClick={completeBill}
              disabled={!items.length}
            >
              <Check size={19} />
              Complete Bill
            </button>

            <div className={styles.billFooter}>
              Offline POS • Bill is saved automatically
            </div>
          </aside>
        </div>
      </div>

      {showReceipt && (
        <div className={styles.modalBackdrop}>
          <div className={styles.receiptModal}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => {
                setShowReceipt(false);
                clearBill();
              }}
            >
              <X size={19} />
            </button>

            <div className={styles.successIcon}>
              <Check size={26} />
            </div>

            <div className={styles.receiptHeading}>
              <span>THIRUMALA BAKERY</span>
              <h2>Bill Completed</h2>
              <p>{billNumber}</p>
            </div>

            <div className={styles.receiptSummary}>
              <div>
                <span>Customer</span>
                <strong>{customerName || "Walk-in Customer"}</strong>
              </div>

              <div>
                <span>Payment</span>
                <strong>{payment}</strong>
              </div>

              <div>
                <span>Amount Paid</span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.printButton}
                onClick={printReceipt}
              >
                <Printer size={17} />
                Print Receipt
              </button>

              <button
                type="button"
                className={styles.newBillButton}
                onClick={() => {
                  setShowReceipt(false);
                  clearBill();
                }}
              >
                New Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
