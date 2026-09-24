"use client";

"use client";

import {
  Package,
  Boxes,
  Search,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  PackagePlus,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Product,
  getProducts,
  saveProducts,
  updateProduct,
} from "@/lib/store";

const ROWS_PER_PAGE = 10;

type ImportRow = {
  name: string;
  category: string;
  stock: number;
  price: number;
  image?: string;
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    salePrice: "",
    stock: "",
    weight: "",
    unit: "Piece",
    lowStockThreshold: "10",
    sku: "",
    status: "active",
    featured: false,
    slug: "",
    image: "",
    description: "",
  });

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
  });

  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importError, setImportError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    try {
      setProducts(getProducts());
    } catch (error) {
      console.error("Unable to load inventory:", error);
      setProducts([]);
    }
  }

  useEffect(() => {
    load();

    const handler = () => {
      load();
    };

    window.addEventListener("thirumala-store-update", handler);

    window.addEventListener("storage", handler);

    const interval = window.setInterval(load, 1500);

    return () => {
      window.removeEventListener(
        "thirumala-store-update",
        handler
      );

      window.removeEventListener("storage", handler);

      window.clearInterval(interval);
    };
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)).sort(),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / ROWS_PER_PAGE
    )
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startIndex =
    (page - 1) * ROWS_PER_PAGE;

  const endIndex =
    startIndex + ROWS_PER_PAGE;

  const visibleProducts =
    filteredProducts.slice(
      startIndex,
      endIndex
    );

  /*
   * Keep the table height stable even when the
   * final page contains fewer products.
   */
  const emptyRows =
    Math.max(
      0,
      ROWS_PER_PAGE - visibleProducts.length
    );

  function openEdit(product: Product) {
    setOpenMenuId(null);
    const item = product as Product & Record<string, unknown>;
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      salePrice: String(item.salePrice ?? ""),
      stock: String(product.stock ?? 0),
      weight: String(item.weight ?? ""),
      unit: String(item.unit ?? "Piece"),
      lowStockThreshold: String(item.lowStockThreshold ?? 10),
      sku: String(item.sku ?? ""),
      status: String(item.status ?? "active"),
      featured: Boolean(item.featured),
      slug: String(item.slug ?? ""),
      image: String(product.image ?? ""),
      description: String(item.description ?? ""),
    });
  }

  function closeEdit() {
    setEditingProduct(null);
    setOpenMenuId(null);
  }

  function handleEditImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((current) => ({
        ...current,
        image: typeof reader.result === "string" ? reader.result : current.image,
      }));
    };
    reader.readAsDataURL(file);
  }

  function saveEditedProduct() {
    if (!editingProduct) return;

    const name = editForm.name.trim();
    const itemCategory = editForm.category.trim();
    const price = Number(editForm.price);
    const stock = Number(editForm.stock);

    if (!name || !itemCategory) {
      alert("Please enter the product name and category.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      alert("Please enter a valid price.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    const updates = {
      name,
      category: itemCategory,
      price,
      salePrice: editForm.salePrice.trim()
        ? Number(editForm.salePrice)
        : undefined,
      stock,
      image: editForm.image,
      weight: editForm.weight.trim(),
      unit: editForm.unit.trim() || "Piece",
      lowStockThreshold: Number(editForm.lowStockThreshold) || 10,
      sku: editForm.sku.trim(),
      status: editForm.status === "inactive" ? "inactive" : "active",
      featured: editForm.featured,
      slug: editForm.slug.trim(),
      description: editForm.description.trim(),
    } as Partial<Product>;

    updateProduct(editingProduct.id, updates);
    load();
    window.dispatchEvent(new Event("thirumala-store-update"));
    closeEdit();
  }

  function deleteInventoryItem(product: Product) {
    setOpenMenuId(null);
    setShowDeleteConfirm(product);
  }

  function confirmDelete() {
    if (!showDeleteConfirm) return;

    try {
      const current = getProducts();
      const remaining = current.filter(
        (product) => product.id !== showDeleteConfirm.id
      );
      saveProducts(remaining);
      setProducts(remaining);
      window.dispatchEvent(new Event("thirumala-store-update"));
    } catch (error) {
      console.error("Unable to delete inventory item:", error);
      alert("Unable to delete this item.");
    }

    setShowDeleteConfirm(null);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategory(value: string) {
    setCategory(value);
    setPage(1);
  }

  function resetAddForm() {
    setNewItem({
      name: "",
      category: "",
      stock: "",
      price: "",
    });
  }

  /*
   * Adds an inventory item using the existing product
   * store. This intentionally uses updateProduct/getProducts
   * rather than creating another storage system.
   */
  function addInventoryItem() {
    const name = newItem.name.trim();
    const itemCategory =
      newItem.category.trim();

    const stock = Number(newItem.stock);
    const price = Number(newItem.price);

    if (!name) {
      alert("Please enter the product name.");
      return;
    }

    if (!itemCategory) {
      alert("Please enter the category.");
      return;
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      alert("Please enter a valid stock quantity.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert("Please enter a valid price.");
      return;
    }

    /*
     * Because the current store API exposes updateProduct
     * but not addProduct in this page, we first look for
     * an existing product with the same name.
     *
     * If your store already exposes addProduct, the page
     * can be switched to it directly.
     */
    const existing = products.find(
      (product) =>
        product.name.trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (existing) {
      updateProduct(existing.id, {
        stock:
          Number(existing.stock || 0) + stock,
        price,
        category: itemCategory,
      });

      load();

      window.dispatchEvent(
        new Event("thirumala-store-update")
      );

      resetAddForm();
      setShowAdd(false);
      return;
    }

    alert(
      "This inventory store currently supports updating existing products. Add the product from Products first, then manage its inventory here."
    );
  }

  function downloadTemplate() {
    const csv = [
      "name,category,stock,price,image",
      "Chocolate Cake,Cakes,20,650,",
      "Veg Puff,Snacks,50,35,",
      "Black Forest Cake,Cakes,15,750,",
    ].join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "thirumala-inventory-template.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string): ImportRow[] {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error(
        "The file does not contain inventory rows."
      );
    }

    const headers = lines[0]
      .split(",")
      .map((header) =>
        header.trim().toLowerCase()
      );

    const nameIndex =
      headers.indexOf("name");

    const categoryIndex =
      headers.indexOf("category");

    const stockIndex =
      headers.indexOf("stock");

    const priceIndex =
      headers.indexOf("price");

    const imageIndex =
      headers.indexOf("image");

    if (
      nameIndex === -1 ||
      categoryIndex === -1 ||
      stockIndex === -1 ||
      priceIndex === -1
    ) {
      throw new Error(
        "Required columns: name, category, stock, price"
      );
    }

    return lines
      .slice(1)
      .map((line) => {
        const columns =
          line.split(",").map((value) =>
            value.trim()
          );

        return {
          name:
            columns[nameIndex] || "",
          category:
            columns[categoryIndex] || "",
          stock:
            Number(
              columns[stockIndex] || 0
            ),
          price:
            Number(
              columns[priceIndex] || 0
            ),
          image:
            imageIndex >= 0
              ? columns[imageIndex] || ""
              : "",
        };
      })
      .filter((row) => row.name);
  }

  async function handleImportFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setImportError("");

    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase();

      if (
        extension !== "csv" &&
        extension !== "xlsx" &&
        extension !== "xls"
      ) {
        throw new Error(
          "Please upload a CSV, XLS or XLSX file."
        );
      }

      /*
       * CSV is handled without another dependency.
       *
       * Excel files require SheetJS. If it is installed
       * in the project, XLS/XLSX files are processed below.
       */
      if (extension === "csv") {
        const text =
          await file.text();

        const rows =
          parseCSV(text);

        setImportRows(rows);
        setShowImportPreview(true);
        return;
      }

      try {
        const XLSX =
          await import("xlsx");

        const buffer =
          await file.arrayBuffer();

        const workbook =
          XLSX.read(buffer, {
            type: "array",
          });

        const firstSheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        const rows =
          XLSX.utils.sheet_to_json<
            Record<string, unknown>
          >(firstSheet);

        const parsed: ImportRow[] =
          rows
            .map((row) => ({
              name:
                String(
                  row.name ??
                    row.Name ??
                    ""
                ).trim(),

              category:
                String(
                  row.category ??
                    row.Category ??
                    ""
                ).trim(),

              stock:
                Number(
                  row.stock ??
                    row.Stock ??
                    0
                ),

              price:
                Number(
                  row.price ??
                    row.Price ??
                    0
                ),

              image:
                String(
                  row.image ??
                    row.Image ??
                    ""
                ).trim(),
            }))
            .filter(
              (row) => row.name
            );

        if (!parsed.length) {
          throw new Error(
            "No valid inventory rows were found."
          );
        }

        setImportRows(parsed);
        setShowImportPreview(true);
      } catch (error) {
        console.error(error);

        throw new Error(
          "Excel import requires the xlsx package. Run: npm install xlsx"
        );
      }
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Unable to import file."
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function applyImportedInventory() {
    if (!importRows.length) return;

    let updatedCount = 0;

    importRows.forEach((row) => {
      const existing =
        products.find(
          (product) =>
            product.name
              .trim()
              .toLowerCase() ===
            row.name
              .trim()
              .toLowerCase()
        );

      if (existing) {
        updateProduct(
          existing.id,
          {
            stock: Math.max(
              0,
              Number(row.stock) || 0
            ),
            price: Math.max(
              0,
              Number(row.price) || 0
            ),
            category:
              row.category ||
              existing.category,
            ...(row.image
              ? {
                  image: row.image,
                }
              : {}),
          }
        );

        updatedCount++;
      }
    });

    load();

    window.dispatchEvent(
      new Event("thirumala-store-update")
    );

    setShowImportPreview(false);
    setImportRows([]);

    alert(
      `${updatedCount} existing inventory items updated successfully.`
    );
  }

  const firstShown =
    filteredProducts.length === 0
      ? 0
      : startIndex + 1;

  const lastShown =
    Math.min(
      endIndex,
      filteredProducts.length
    );

  return (
    <section className="inventory-page">
      {/* HEADER */}

      <div className="admin-page-header inventory-header">
        <div>
          <div className="admin-eyebrow">
            STOCK CONTROL
          </div>

          <h1>Inventory</h1>

          <p>
            Monitor stock, availability and
            inventory levels.
          </p>
        </div>

        <div className="inventory-header-actions">
          <button
            className="inventory-secondary-btn"
            onClick={downloadTemplate}
          >
            <Download size={16} />
            Template
          </button>

          <button
            className="inventory-secondary-btn"
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            <Upload size={16} />
            Import
          </button>

          <button
            className="inventory-primary-btn"
            onClick={() => {
              resetAddForm();
              setShowAdd(true);
            }}
          >
            <PackagePlus size={17} />
            Add Item
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </div>

      {/* TOOLBAR */}

      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              handleSearch(
                event.target.value
              )
            }
            placeholder="Search inventory..."
          />

          {search && (
            <button
              onClick={() =>
                handleSearch("")
              }
            >
              <X size={15} />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(event) =>
            handleCategory(
              event.target.value
            )
          }
          className="inventory-category"
        >
          {categories.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <div className="inventory-count">
          {filteredProducts.length} items
        </div>
      </div>

      {/* TABLE */}

      <div className="inventory-table-card">
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th className="col-product">
                  PRODUCT
                </th>

                <th>
                  CATEGORY
                </th>

                <th>
                  PRICE
                </th>

                <th>
                  STOCK
                </th>

                <th>
                  STATUS
                </th>

                <th className="col-action">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleProducts.map(
                (product) => {
                  const stock =
                    Number(
                      product.stock || 0
                    );

                  const status =
                    stock === 0
                      ? "Out of stock"
                      : stock < 5
                      ? "Low stock"
                      : "In stock";

                  return (
                    <tr
                      key={product.id}
                    >
                      <td>
                        <div className="inventory-product-cell">
                          <div className="inventory-product-image">
                            {product.image ? (
                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.name
                                }
                              />
                            ) : (
                              <Package
                                size={18}
                              />
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            {product.weight && (
                              <small>
                                {
                                  product.weight
                                }
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="inventory-category-text">
                          {
                            product.category
                          }
                        </span>
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            product.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong
                          className={
                            stock < 5
                              ? "stock-low-number"
                              : "stock-number"
                          }
                        >
                          {stock}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`inventory-status ${
                            stock === 0
                              ? "out"
                              : stock < 5
                              ? "low"
                              : "good"
                          }`}
                        >
                          <span />
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-action-wrap">
                          <button
                            className="inventory-more-btn"
                            aria-label={`Open actions for ${product.name}`}
                            onClick={() =>
                              setOpenMenuId((current) =>
                                current === product.id ? null : product.id
                              )
                            }
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openMenuId === product.id && (
                            <div className="inventory-action-menu">
                              <button onClick={() => openEdit(product)}>
                                <Pencil size={15} />
                                Edit
                              </button>
                              <button
                                className="danger"
                                onClick={() => deleteInventoryItem(product)}
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                              <button onClick={() => setOpenMenuId(null)}>
                                <ArrowLeft size={15} />
                                Back
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                }
              )}

              {emptyRows > 0 &&
                Array.from({
                  length: emptyRows,
                }).map(
                  (_, index) => (
                    <tr
                      className="inventory-empty-row"
                      key={`empty-${index}`}
                    >
                      <td colSpan={6}>
                        &nbsp;
                      </td>
                    </tr>
                  )
                )}

              {!filteredProducts.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="inventory-no-results"
                  >
                    <Boxes
                      size={26}
                    />

                    <strong>
                      No inventory items
                    </strong>

                    <span>
                      Try another search or
                      add products first.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="inventory-pagination">
          <div>
            Showing{" "}
            <strong>
              {firstShown}
            </strong>{" "}
            –{" "}
            <strong>
              {lastShown}
            </strong>{" "}
            of{" "}
            <strong>
              {filteredProducts.length}
            </strong>
          </div>

          <div className="inventory-page-controls">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span>
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              disabled={
                page === totalPages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                )
              }
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEdit();
          }}
        >
          <div className="inventory-edit-modal">
            <div className="inventory-modal-header">
              <div>
                <div className="admin-eyebrow">INVENTORY</div>
                <h2>Edit Product</h2>
                <p>Update complete product details and quantity.</p>
              </div>
              <button onClick={closeEdit} aria-label="Close edit window">
                <X size={19} />
              </button>
            </div>

            <div className="inventory-edit-body">
              <div className="inventory-edit-image-column">
                <div className="inventory-edit-image-preview">
                  {editForm.image ? (
                    <img src={editForm.image} alt={editForm.name || "Product"} />
                  ) : (
                    <PackagePlus size={28} />
                  )}
                </div>
                <label className="inventory-upload-image-btn">
                  <Upload size={15} />
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleEditImage}
                  />
                </label>
              </div>

              <div className="inventory-edit-fields">
                <div className="inventory-edit-field-full">
                  <label>Product Name</label>
                  <input
                    value={editForm.name}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Chocolate Cake"
                  />
                </div>

                <div className="inventory-edit-field-grid">
                  <div>
                    <label>Category</label>
                    <input
                      value={editForm.category}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          category: event.target.value,
                        }))
                      }
                      placeholder="Cakes"
                    />
                  </div>
                  <div>
                    <label>Price</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="inventory-edit-field-grid">
                  <div>
                    <label>Sale Price</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.salePrice}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          salePrice: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label>Unit</label>
                    <select
                      value={editForm.unit}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          unit: event.target.value,
                        }))
                      }
                    >
                      <option>Piece</option>
                      <option>Box</option>
                      <option>Kg</option>
                      <option>Gram</option>
                      <option>Pack</option>
                      <option>Dozen</option>
                      <option>Liter</option>
                    </select>
                  </div>
                </div>

                <div className="inventory-edit-field-grid">
                  <div>
                    <label>Quantity / Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          stock: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label>Weight</label>
                    <input
                      value={editForm.weight}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          weight: event.target.value,
                        }))
                      }
                      placeholder="500 g / 1 kg"
                    />
                  </div>
                </div>

                <div className="inventory-edit-field-grid">
                  <div>
                    <label>SKU</label>
                    <input
                      value={editForm.sku}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          sku: event.target.value,
                        }))
                      }
                      placeholder="Optional SKU"
                    />
                  </div>
                  <div>
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.lowStockThreshold}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          lowStockThreshold: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="inventory-edit-field-grid">
                  <div>
                    <label>Slug</label>
                    <input
                      value={editForm.slug}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          slug: event.target.value,
                        }))
                      }
                      placeholder="product-slug"
                    />
                  </div>
                  <div>
                    <label>Status</label>
                    <select
                      value={editForm.status}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <label className="inventory-featured-check">
                  <input
                    type="checkbox"
                    checked={editForm.featured}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        featured: event.target.checked,
                      }))
                    }
                  />
                  <span>Featured product</span>
                </label>

                <div className="inventory-edit-field-full">
                  <label>Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Product description"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="inventory-modal-actions">
              <button className="inventory-cancel-btn" onClick={closeEdit}>
                <ArrowLeft size={15} />
                Back
              </button>
              <button className="inventory-primary-btn" onClick={saveEditedProduct}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDeleteConfirm && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowDeleteConfirm(null);
          }}
        >
          <div className="inventory-delete-modal">
            <div className="inventory-delete-icon">
              <Trash2 size={22} />
            </div>
            <h2>Delete Product?</h2>
            <p>
              Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="inventory-modal-actions">
              <button
                className="inventory-cancel-btn"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Back
              </button>
              <button className="inventory-delete-btn" onClick={confirmDelete}>
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}

      {showAdd && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowAdd(false);
            }
          }}
        >
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <div>
                <div className="admin-eyebrow">
                  INVENTORY
                </div>

                <h2>
                  Add Inventory Item
                </h2>

                <p>
                  Add stock to an existing
                  product.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowAdd(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="inventory-form">
              <label>
                Product Name
                <input
                  value={
                    newItem.name
                  }
                  onChange={(event) =>
                    setNewItem(
                      (current) => ({
                        ...current,
                        name:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Chocolate Cake"
                />
              </label>

              <label>
                Category
                <input
                  value={
                    newItem.category
                  }
                  onChange={(event) =>
                    setNewItem(
                      (current) => ({
                        ...current,
                        category:
                          event.target
                            .value,
                      })
                    )
                  }
                  placeholder="Cakes"
                />
              </label>

              <div className="inventory-form-row">
                <label>
                  Stock Quantity
                  <input
                    type="number"
                    min="0"
                    value={
                      newItem.stock
                    }
                    onChange={(
                      event
                    ) =>
                      setNewItem(
                        (current) => ({
                          ...current,
                          stock:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="25"
                  />
                </label>

                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    value={
                      newItem.price
                    }
                    onChange={(
                      event
                    ) =>
                      setNewItem(
                        (current) => ({
                          ...current,
                          price:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="650"
                  />
                </label>
              </div>

              <div className="inventory-form-note">
                <AlertCircle
                  size={15}
                />
                Products should be created
                from the Products section.
                This form updates their
                inventory quantity.
              </div>
            </div>

            <div className="inventory-modal-actions">
              <button
                className="inventory-cancel-btn"
                onClick={() =>
                  setShowAdd(false)
                }
              >
                Cancel
              </button>

              <button
                className="inventory-primary-btn"
                onClick={
                  addInventoryItem
                }
              >
                <PackagePlus
                  size={16}
                />
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT PREVIEW */}

      {showImportPreview && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowImportPreview(
                false
              );
            }
          }}
        >
          <div className="inventory-import-modal">
            <div className="inventory-modal-header">
              <div>
                <div className="admin-eyebrow">
                  IMPORT
                </div>

                <h2>
                  Import Inventory
                </h2>

                <p>
                  Review the rows before
                  updating inventory.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowImportPreview(
                    false
                  )
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="import-preview-info">
              <FileSpreadsheet
                size={18}
              />

              <span>
                {importRows.length} rows
                detected
              </span>
            </div>

            <div className="import-preview-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      Product
                    </th>
                    <th>
                      Category
                    </th>
                    <th>
                      Stock
                    </th>
                    <th>
                      Price
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {importRows
                    .slice(0, 8)
                    .map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            index
                          }
                        >
                          <td>
                            {
                              row.name
                            }
                          </td>

                          <td>
                            {
                              row.category
                            }
                          </td>

                          <td>
                            {
                              row.stock
                            }
                          </td>

                          <td>
                            ₹
                            {row.price.toLocaleString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>

              {importRows.length >
                8 && (
                <div className="import-more">
                  +{" "}
                  {importRows.length -
                    8}{" "}
                  more rows
                </div>
              )}
            </div>

            <div className="inventory-modal-actions">
              <button
                className="inventory-cancel-btn"
                onClick={() => {
                  setShowImportPreview(
                    false
                  );
                  setImportRows([]);
                }}
              >
                Cancel
              </button>

              <button
                className="inventory-primary-btn"
                onClick={
                  applyImportedInventory
                }
              >
                <CheckCircle2
                  size={16}
                />
                Import Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <div className="inventory-import-error">
          <AlertCircle size={17} />
          {importError}

          <button
            onClick={() =>
              setImportError("")
            }
          >
            <X size={15} />
          </button>
        </div>
      )}

      <style jsx>{`
        .inventory-page {
          width: 100%;
        }

        .inventory-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .inventory-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .inventory-primary-btn,
        .inventory-secondary-btn,
        .inventory-cancel-btn {
          height: 42px;
          border-radius: 10px;
          padding: 0 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: 0.18s ease;
          white-space: nowrap;
        }

        .inventory-primary-btn {
          border: 1px solid #3b2920;
          background: #3b2920;
          color: #fffaf5;
        }

        .inventory-primary-btn:hover {
          background: #2c1e18;
          transform: translateY(-1px);
        }

        .inventory-secondary-btn {
          border: 1px solid #ded4cb;
          background: #fffdfa;
          color: #46362e;
        }

        .inventory-secondary-btn:hover {
          background: #f7f1eb;
          border-color: #cfc1b6;
        }

        .inventory-toolbar {
          min-height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px;
          border: 1px solid #e7ded7;
          border-radius: 14px;
          background: rgba(255, 253, 250, 0.88);
          margin-bottom: 14px;
        }

        .inventory-search {
          height: 40px;
          min-width: 280px;
          flex: 1;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #ded4cb;
          border-radius: 9px;
          background: #fff;
          color: #89796f;
        }

        .inventory-search:focus-within {
          border-color: #a99588;
          box-shadow: 0 0 0 3px rgba(90, 66, 52, 0.06);
        }

        .inventory-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 13px;
          color: #34271f;
        }

        .inventory-search input::placeholder {
          color: #a99d95;
        }

        .inventory-search button {
          border: 0;
          background: transparent;
          color: #8e8179;
          display: flex;
          cursor: pointer;
          padding: 3px;
        }

        .inventory-category {
          height: 40px;
          min-width: 145px;
          padding: 0 12px;
          border: 1px solid #ded4cb;
          border-radius: 9px;
          background: #fff;
          color: #4a3930;
          outline: 0;
          font-size: 13px;
        }

        .inventory-count {
          padding: 0 8px;
          color: #8a7c73;
          font-size: 12px;
          white-space: nowrap;
        }

        .inventory-table-card {
          border: 1px solid #e5dcd5;
          border-radius: 15px;
          background: #fffdfa;
          overflow: hidden;
          box-shadow: 0 8px 28px rgba(60, 43, 32, 0.035);
        }

        .inventory-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .inventory-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .inventory-table thead {
          height: 48px;
          background: #f8f3ee;
        }

        .inventory-table th {
          padding: 0 18px;
          text-align: left;
          color: #88786e;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e7ded7;
        }

        .inventory-table td {
          height: 67px;
          padding: 8px 18px;
          border-bottom: 1px solid #eee7e2;
          color: #493930;
          font-size: 13px;
          vertical-align: middle;
        }

        .inventory-table tbody tr {
          transition: background 0.15s ease;
        }

        .inventory-table tbody tr:hover {
          background: #fcf9f6;
        }

        .inventory-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .col-product {
          width: 30%;
        }

        .col-action {
          width: 105px;
          text-align: center;
        }

        .inventory-product-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .inventory-product-image {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          border-radius: 9px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1e9e2;
          color: #846f62;
        }

        .inventory-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inventory-product-cell > div:last-child {
          min-width: 0;
        }

        .inventory-product-cell strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #3c2d26;
          font-size: 13px;
          font-weight: 650;
        }

        .inventory-product-cell small {
          display: block;
          margin-top: 3px;
          color: #9a8d85;
          font-size: 11px;
        }

        .inventory-category-text {
          color: #776960;
        }

        .stock-number {
          color: #44332b;
        }

        .stock-low-number {
          color: #b05e35;
        }

        .inventory-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 650;
        }

        .inventory-status > span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .inventory-status.good {
          background: #edf6ef;
          color: #477453;
        }

        .inventory-status.good > span {
          background: #579466;
        }

        .inventory-status.low {
          background: #fff4e9;
          color: #a76735;
        }

        .inventory-status.low > span {
          background: #cf803e;
        }

        .inventory-status.out {
          background: #fceeed;
          color: #a45149;
        }

        .inventory-status.out > span {
          background: #bd6258;
        }

        .inventory-action-wrap {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .inventory-more-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ded4cb;
          border-radius: 8px;
          background: #fff;
          color: #5f4d43;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .inventory-more-btn:hover {
          background: #f7f1eb;
          border-color: #cfc1b6;
        }

        .inventory-action-menu {
          position: absolute;
          top: calc(100% + 7px);
          right: 0;
          z-index: 30;
          width: 145px;
          padding: 5px;
          border: 1px solid #e1d7cf;
          border-radius: 10px;
          background: #fffdfa;
          box-shadow: 0 14px 35px rgba(48, 33, 25, 0.14);
        }

        .inventory-action-menu button {
          width: 100%;
          height: 34px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 9px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #56453c;
          font-size: 12px;
          cursor: pointer;
          text-align: left;
        }

        .inventory-action-menu button:hover {
          background: #f7f1eb;
        }

        .inventory-action-menu button.danger {
          color: #a45149;
        }

        .inventory-action-menu button.danger:hover {
          background: #fff1ef;
        }

        .inventory-empty-row td {
          height: 67px;
          background: #fffdfa;
        }

        .inventory-no-results {
          height: 300px !important;
          text-align: center;
          color: #95877e !important;
        }

        .inventory-no-results svg {
          display: block;
          margin: 0 auto 10px;
          color: #b19f93;
        }

        .inventory-no-results strong,
        .inventory-no-results span {
          display: block;
        }

        .inventory-no-results strong {
          color: #5b4940;
          margin-bottom: 4px;
        }

        .inventory-pagination {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 17px;
          border-top: 1px solid #e7ded7;
          color: #91837a;
          font-size: 11px;
        }

        .inventory-page-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .inventory-page-controls button {
          height: 32px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #ded4cb;
          border-radius: 8px;
          background: #fff;
          color: #5d4b42;
          font-size: 11px;
          cursor: pointer;
        }

        .inventory-page-controls button:hover:not(:disabled) {
          background: #f7f1eb;
        }

        .inventory-page-controls button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .inventory-page-controls > span {
          min-width: 85px;
          text-align: center;
          color: #786a62;
          font-size: 11px;
        }

        .inventory-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(39, 28, 22, 0.36);
          backdrop-filter: blur(4px);
        }

        .inventory-edit-modal {
          width: min(850px, 100%);
          max-height: min(88vh, 760px);
          border: 1px solid #e5dcd5;
          border-radius: 17px;
          background: #fffdfa;
          box-shadow: 0 24px 70px rgba(38, 27, 20, 0.2);
          overflow: auto;
        }

        .inventory-edit-body {
          display: grid;
          grid-template-columns: 185px 1fr;
          gap: 24px;
          padding: 22px 24px;
        }

        .inventory-edit-image-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .inventory-edit-image-preview {
          width: 100%;
          aspect-ratio: 1;
          border: 1px solid #e3d9d1;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4ede7;
          color: #8c776a;
        }

        .inventory-edit-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .inventory-upload-image-btn {
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #ded4cb;
          border-radius: 8px;
          background: #fff;
          color: #5d4b42;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }

        .inventory-edit-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .inventory-edit-field-full,
        .inventory-edit-field-grid > div {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .inventory-edit-field-full label,
        .inventory-edit-field-grid label {
          color: #635149;
          font-size: 11px;
          font-weight: 700;
        }

        .inventory-edit-field-full input,
        .inventory-edit-field-grid input,
        .inventory-edit-field-grid select,
        .inventory-edit-field-full textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ddd3cb;
          border-radius: 9px;
          outline: 0;
          background: #fff;
          color: #3e2e26;
          font-size: 13px;
          padding: 10px 11px;
          font-family: inherit;
        }

        .inventory-edit-field-full input,
        .inventory-edit-field-grid input {
          height: 40px;
        }

        .inventory-edit-field-full textarea {
          resize: vertical;
          min-height: 90px;
          line-height: 1.45;
        }

        .inventory-edit-field-full input:focus,
        .inventory-edit-field-grid input:focus,
        .inventory-edit-field-grid select:focus,
        .inventory-edit-field-full textarea:focus {
          border-color: #a99588;
          box-shadow: 0 0 0 3px rgba(90, 66, 52, 0.06);
        }

        .inventory-edit-field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .inventory-featured-check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #635149;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }

        .inventory-featured-check input {
          width: 15px;
          height: 15px;
          margin: 0;
          accent-color: #3b2920;
        }

        .inventory-delete-modal {
          width: min(420px, 100%);
          padding: 27px;
          border: 1px solid #e5dcd5;
          border-radius: 17px;
          background: #fffdfa;
          box-shadow: 0 24px 70px rgba(38, 27, 20, 0.2);
          text-align: center;
        }

        .inventory-delete-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff0ed;
          color: #a45149;
        }

        .inventory-delete-modal h2 {
          margin: 0 0 7px;
          color: #3d2d25;
          font-size: 19px;
        }

        .inventory-delete-modal p {
          margin: 0;
          color: #8b7c73;
          font-size: 12px;
          line-height: 1.6;
        }

        .inventory-delete-modal .inventory-modal-actions {
          margin: 20px -27px -27px;
        }

        .inventory-delete-btn {
          height: 42px;
          padding: 0 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #a45149;
          border-radius: 10px;
          background: #a45149;
          color: #fff;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
        }

        .inventory-delete-btn:hover {
          background: #8f4039;
        }

        .inventory-modal,
        .inventory-import-modal {
          width: min(520px, 100%);
          border: 1px solid #e5dcd5;
          border-radius: 17px;
          background: #fffdfa;
          box-shadow: 0 24px 70px rgba(38, 27, 20, 0.2);
          overflow: hidden;
        }

        .inventory-import-modal {
          width: min(760px, 100%);
        }

        .inventory-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 23px 24px 18px;
          border-bottom: 1px solid #eee6e0;
        }

        .inventory-modal-header h2 {
          margin: 3px 0 4px;
          color: #3d2d25;
          font-size: 20px;
          font-weight: 700;
        }

        .inventory-modal-header p {
          margin: 0;
          color: #95877e;
          font-size: 12px;
        }

        .inventory-modal-header > button {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4dad2;
          border-radius: 8px;
          background: #fff;
          color: #76675e;
          cursor: pointer;
        }

        .inventory-form {
          padding: 21px 24px;
        }

        .inventory-form label {
          display: block;
          margin-bottom: 15px;
          color: #635149;
          font-size: 12px;
          font-weight: 650;
        }

        .inventory-form input {
          width: 100%;
          height: 41px;
          margin-top: 7px;
          padding: 0 11px;
          border: 1px solid #ddd3cb;
          border-radius: 9px;
          outline: 0;
          background: #fff;
          color: #3e2e26;
          font-size: 13px;
          box-sizing: border-box;
        }

        .inventory-form input:focus {
          border-color: #a99588;
          box-shadow: 0 0 0 3px rgba(90, 66, 52, 0.06);
        }

        .inventory-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .inventory-form-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 11px;
          border-radius: 9px;
          background: #f8f3ee;
          color: #81736b;
          font-size: 11px;
          line-height: 1.5;
        }

        .inventory-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
          padding: 14px 24px;
          border-top: 1px solid #eee6e0;
          background: #fcf9f6;
        }

        .inventory-cancel-btn {
          border: 1px solid #ded4cb;
          background: #fff;
          color: #66564d;
        }

        .inventory-cancel-btn:hover {
          background: #f7f1eb;
        }

        .import-preview-info {
          margin: 17px 24px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #67564d;
          font-size: 12px;
          font-weight: 650;
        }

        .import-preview-table {
          margin: 0 24px 18px;
          border: 1px solid #e6ddd6;
          border-radius: 10px;
          overflow: hidden;
        }

        .import-preview-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .import-preview-table th {
          height: 37px;
          padding: 0 11px;
          text-align: left;
          background: #f7f2ed;
          color: #86776e;
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        .import-preview-table td {
          height: 39px;
          padding: 0 11px;
          border-top: 1px solid #eee7e1;
          color: #55443b;
          font-size: 11px;
        }

        .import-more {
          padding: 9px;
          text-align: center;
          border-top: 1px solid #eee7e1;
          color: #93857c;
          font-size: 11px;
        }

        .inventory-import-error {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 1200;
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 430px;
          padding: 12px 14px;
          border: 1px solid #e8cbc7;
          border-radius: 10px;
          background: #fff6f5;
          color: #984d46;
          box-shadow: 0 12px 35px rgba(62, 36, 30, 0.12);
          font-size: 12px;
        }

        .inventory-import-error button {
          margin-left: 6px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          display: flex;
        }

        @media (max-width: 900px) {
          .inventory-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .inventory-header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .inventory-toolbar {
            flex-wrap: wrap;
          }

          .inventory-search {
            min-width: 100%;
          }
        }

        @media (max-width: 600px) {
          .inventory-header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .inventory-primary-btn {
            grid-column: 1 / -1;
          }

          .inventory-pagination {
            padding: 0 10px;
          }

          .inventory-pagination > div:first-child {
            display: none;
          }

          .inventory-form-row,
          .inventory-edit-field-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .inventory-edit-body {
            grid-template-columns: 1fr;
          }

          .inventory-edit-image-column {
            max-width: 180px;
          }

          .inventory-modal-backdrop {
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}
