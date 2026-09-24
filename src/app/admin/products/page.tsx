"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  Product,
  getProducts,
  saveProducts,
  seedStore,
} from "@/lib/store";


/* =========================================================
   CATEGORIES
========================================================= */

const DEFAULT_CATEGORIES = [
  "Cakes",
  "Pastries",
  "Snacks",
  "Breads",
  "Cookies",
  "Beverages",
  "Other",
];

const ROWS_PER_PAGE = 8;


/* =========================================================
   FORM
========================================================= */

type ProductForm = {
  name: string;
  category: string;
  price: string;
  stock: string;
  weight: string;
  unit: string;
  image: string;
  description: string;
  featured: boolean;
  visible: boolean;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  category: "Cakes",
  price: "",
  stock: "",
  weight: "",
  unit: "Piece",
  image: "",
  description: "",
  featured: false,
  visible: true,
};


/* =========================================================
   HELPERS
========================================================= */

function createId() {
  return (
    "product-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}


function safeNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


/*
  Compress uploaded images before storing them.
*/
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const MAX_SIZE = 1200;

        let width = image.width;
        let height = image.height;

        if (
          width > MAX_SIZE ||
          height > MAX_SIZE
        ) {
          if (width >= height) {
            height = Math.round(
              (height / width) * MAX_SIZE
            );

            width = MAX_SIZE;
          } else {
            width = Math.round(
              (width / height) * MAX_SIZE
            );

            height = MAX_SIZE;
          }
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context =
          canvas.getContext("2d");

        if (!context) {
          reject(
            new Error(
              "Unable to process image."
            )
          );

          return;
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const result =
          canvas.toDataURL(
            "image/webp",
            0.82
          );

        resolve(result);
      };

      image.onerror = () => {
        reject(
          new Error(
            "Invalid image file."
          )
        );
      };

      image.src =
        reader.result as string;
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Unable to read image."
        )
      );
    };

    reader.readAsDataURL(file);
  });
}


/* =========================================================
   PAGE
========================================================= */

export default function ProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductForm>(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);

  const [imageLoading, setImageLoading] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);


  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    try {
      seedStore();
    } catch {
      // Store may already be initialized.
    }

    try {
      setProducts(getProducts());
    } catch {
      setProducts([]);
    }


    const reloadProducts = () => {
      try {
        setProducts(getProducts());
      } catch {
        // Ignore storage refresh errors.
      }
    };


    window.addEventListener(
      "storage",
      reloadProducts
    );

    window.addEventListener(
      "thirumala-products-updated",
      reloadProducts
    );


    return () => {
      window.removeEventListener(
        "storage",
        reloadProducts
      );

      window.removeEventListener(
        "thirumala-products-updated",
        reloadProducts
      );
    };
  }, []);


  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const existing =
      products
        .map((product) =>
          String(
            product.category || ""
          ).trim()
        )
        .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set([
          ...DEFAULT_CATEGORIES,
          ...existing,
        ])
      ),
    ];
  }, [products]);


  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();


    return products.filter(
      (product) => {
        const name =
          String(
            product.name || ""
          ).toLowerCase();

        const productCategory =
          String(
            product.category || ""
          ).toLowerCase();


        const matchesSearch =
          !query ||
          name.includes(query) ||
          productCategory.includes(
            query
          );


        const matchesCategory =
          category === "All" ||
          product.category ===
            category;


        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    products,
    search,
    category,
  ]);


  /* =======================================================
     PAGINATION LOGIC
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ROWS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredProducts.slice(
      start,
      start + ROWS_PER_PAGE
    );
  }, [filteredProducts, currentPage]);

  const emptyRows = Math.max(
    0,
    ROWS_PER_PAGE - paginatedProducts.length
  );


  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalProducts =
    products.length;

  const visibleProducts =
    products.filter(
      (product) =>
        product.visible !== false
    ).length;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured === true
    ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        safeNumber(
          product.stock
        ) <= 5
    ).length;


  /* =======================================================
     MODAL
  ======================================================= */

  function openAddModal() {
    setEditingProduct(null);

    setForm({
      ...EMPTY_FORM,
    });

    setShowModal(true);
  }


  function openEditModal(
    product: Product
  ) {
    setEditingProduct(product);

    setForm({
      name:
        product.name || "",

      category:
        product.category ||
        "Cakes",

      price:
        String(
          product.price ?? ""
        ),

      stock:
        String(
          product.stock ?? ""
        ),

      weight:
        String(
          product.weight || ""
        ),

      unit: "Piece",

      image:
        product.image || "",

      description:
        product.description ||
        "",

      featured:
        Boolean(
          product.featured
        ),

      visible:
        product.visible !==
        false,
    });

    setShowModal(true);
  }


  function closeModal() {
    if (
      saving ||
      imageLoading
    ) {
      return;
    }

    setShowModal(false);

    setEditingProduct(null);

    setForm({
      ...EMPTY_FORM,
    });
  }


  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select a valid image."
      );

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Please select an image smaller than 10 MB."
      );

      return;
    }


    try {
      setImageLoading(true);

      const compressed =
        await compressImage(
          file
        );


      setForm(
        (current) => ({
          ...current,
          image: compressed,
        })
      );
    } catch {
      alert(
        "Unable to process this image. Please try another image."
      );
    } finally {
      setImageLoading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }


  function removeImage() {
    setForm(
      (current) => ({
        ...current,
        image: "",
      })
    );
  }


  function updateField<
    K extends keyof ProductForm
  >(
    field: K,
    value: ProductForm[K]
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }


  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  function handleSave() {
    const name =
      form.name.trim();


    if (!name) {
      alert(
        "Please enter the product name."
      );

      return;
    }


    const price =
      Number(form.price);


    if (
      form.price === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert(
        "Please enter a valid product price."
      );

      return;
    }


    const stock =
      Number(form.stock);


    if (
      form.stock === "" ||
      !Number.isFinite(stock) ||
      stock < 0
    ) {
      alert(
        "Please enter a valid stock quantity."
      );

      return;
    }


    setSaving(true);


    const product = {
      id:
        editingProduct?.id ||
        createId(),

      name,

      category:
        form.category ||
        "Other",

      price,

      stock,

      weight:
        form.weight.trim(),

      unit:
        form.unit || "Piece",

      image:
        form.image,

      description:
        form.description.trim(),

      featured:
        form.featured,

      visible:
        form.visible,
    } as Product;


    const nextProducts =
      editingProduct
        ? products.map(
            (item) =>
              item.id ===
              product.id
                ? product
                : item
          )
        : [
            product,
            ...products,
          ];


    try {
      saveProducts(
        nextProducts
      );

      setProducts(
        nextProducts
      );


      window.dispatchEvent(
        new Event(
          "thirumala-products-updated"
        )
      );


      setShowModal(false);

      setEditingProduct(
        null
      );

      setForm({
        ...EMPTY_FORM,
      });
    } catch {
      alert(
        "Unable to save the product."
      );
    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     DELETE
  ======================================================= */

  function handleDelete(
    product: Product
  ) {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`
      );


    if (!confirmed) {
      return;
    }


    const nextProducts =
      products.filter(
        (item) =>
          item.id !==
          product.id
      );


    try {
      saveProducts(
        nextProducts
      );

      setProducts(
        nextProducts
      );


      window.dispatchEvent(
        new Event(
          "thirumala-products-updated"
        )
      );
    } catch {
      alert(
        "Unable to delete the product."
      );
    }
  }


  /* =======================================================
     VISIBILITY
  ======================================================= */

  function toggleVisibility(
    product: Product
  ) {
    const updated = {
      ...product,

      visible:
        product.visible ===
        false,
    };


    const nextProducts =
      products.map(
        (item) =>
          item.id ===
          product.id
            ? updated
            : item
      );


    try {
      saveProducts(
        nextProducts
      );

      setProducts(
        nextProducts
      );


      window.dispatchEvent(
        new Event(
          "thirumala-products-updated"
        )
      );
    } catch {
      alert(
        "Unable to update product visibility."
      );
    }
  }


  /* =======================================================
     UI
  ======================================================= */

  const firstShown =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) * ROWS_PER_PAGE + 1;

  const lastShown =
    Math.min(
      currentPage * ROWS_PER_PAGE,
      filteredProducts.length
    );

  return (
    <div className="min-h-screen bg-[#f5f0e9] text-[#302820] inventory-page">

      <main className="px-5 py-7 lg:px-8 lg:py-8">


        {/* PAGE INTRO */}

        <div className="mb-7">

          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a08f80]">
            Catalog Management
          </p>

          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">

            <div>

              <h2 className="font-serif text-[40px] leading-none tracking-[-0.02em] text-[#302820] lg:text-[46px]">
                Product Library
              </h2>

              <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#81766d]">
                Manage every cake, pastry,
                snack, bread and beverage
                available through your bakery.
              </p>

            </div>


            {/* SUMMARY */}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

              <div className="rounded-xl border border-[#ded4ca] bg-white px-4 py-3">

                <p className="text-[10px] uppercase tracking-[0.12em] text-[#988b80]">
                  Products
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {totalProducts}
                </p>

              </div>


              <div className="rounded-xl border border-[#ded4ca] bg-white px-4 py-3">

                <p className="text-[10px] uppercase tracking-[0.12em] text-[#988b80]">
                  Visible
                </p>

                <p className="mt-1 text-lg font-semibold text-[#50765a]">
                  {visibleProducts}
                </p>

              </div>


              <div className="rounded-xl border border-[#ded4ca] bg-white px-4 py-3">

                <p className="text-[10px] uppercase tracking-[0.12em] text-[#988b80]">
                  Featured
                </p>

                <p className="mt-1 text-lg font-semibold text-[#a66f43]">
                  {featuredProducts}
                </p>

              </div>


              <div className="rounded-xl border border-[#ded4ca] bg-white px-4 py-3">

                <p className="text-[10px] uppercase tracking-[0.12em] text-[#988b80]">
                  Low Stock
                </p>

                <p className="mt-1 text-lg font-semibold text-[#a65d52]">
                  {lowStockProducts}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            TOOLBAR & FILTER BAR
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-[#ded5cb] bg-[#fffdfa] p-4 shadow-[0_8px_30px_rgba(70,50,30,0.035)]">

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl bg-[#9b623f] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(120,70,40,0.14)] transition hover:bg-[#805033] active:scale-[0.98]"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>

          <div className="flex flex-col gap-3 xl:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9d9187]"
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products by name or category..."
                className="h-12 w-full rounded-xl border border-[#ded4ca] bg-[#fbf8f4] pl-11 pr-4 text-sm text-[#302820] outline-none transition placeholder:text-[#aaa097] focus:border-[#a96843] focus:bg-white focus:ring-4 focus:ring-[#a96843]/5"
              />

              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9d9187]"
                >
                  <X size={15} />
                </button>
              )}

            </div>


            {/* CATEGORY */}

            <div className="relative xl:w-[210px]">

              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-12 w-full appearance-none rounded-xl border border-[#ded4ca] bg-[#fbf8f4] px-4 pr-10 text-sm text-[#4d433b] outline-none transition focus:border-[#a96843] focus:bg-white"
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

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9a8d82]">
                ▾
              </span>

            </div>

          </div>


          <div className="mt-3 flex items-center justify-between">

            <p className="text-xs text-[#8f8379]">

              Showing{" "}

              <span className="font-semibold text-[#574c43]">
                {filteredProducts.length > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0}
              </span>

              {" "}–{" "}

              <span className="font-semibold text-[#574c43]">
                {Math.min(currentPage * ROWS_PER_PAGE, filteredProducts.length)}
              </span>

              {" "}of{" "}

              <span className="font-semibold text-[#574c43]">
                {filteredProducts.length}
              </span>

              {" "}filtered products

            </p>


            {(search ||
              category !==
                "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory(
                    "All"
                  );
                  setCurrentPage(1);
                }}
                className="text-xs font-semibold text-[#9b623f] hover:underline"
              >
                Clear filters
              </button>
            )}

          </div>

        </section>


        {/* =================================================
            PRODUCT TABLE WITH SERIAL NUMBERS & FIXED ROWS
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-[#ded5cb] bg-white shadow-[0_8px_35px_rgba(70,50,30,0.035)] inventory-table-card">


          {/* TABLE */}

          <div className="inventory-table-wrap">

            <table className="inventory-table">

              <thead>

                <tr>
                  <th className="col-sno">S.NO</th>
                  <th className="col-product">PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th className="col-action text-right">ACTIONS</th>
                </tr>

              </thead>


              <tbody>

                {paginatedProducts.map(
                  (
                    product,
                    index
                  ) => {
                    const serialNumber = (currentPage - 1) * ROWS_PER_PAGE + index + 1;
                    const stock = safeNumber(product.stock);
                    const status = stock === 0 ? "Out of stock" : stock <= 5 ? "Low stock" : "In stock";

                    return (

                      <tr
                        key={product.id}
                        className={index % 2 === 1 ? "bg-[#fffefa]" : "bg-white"}
                      >

                        {/* SERIAL NUMBER */}

                        <td className="font-semibold text-[#8e8179]">
                          {serialNumber < 10 ? `0${serialNumber}` : serialNumber}
                        </td>


                        {/* PRODUCT */}

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

                                <div className="flex h-full w-full items-center justify-center text-[#a69688]">

                                  <ImageIcon
                                    size={20}
                                  />

                                </div>

                              )}

                            </div>


                            <div className="min-w-0">

                              <div className="flex items-center gap-2">

                                <strong className="truncate text-[15px] font-semibold text-[#302820]">
                                  {
                                    product.name
                                  }
                                </strong>


                                {product.featured && (

                                  <Star
                                    size={14}
                                    fill="currentColor"
                                    className="shrink-0 text-[#b57a4e]"
                                  />

                                )}

                              </div>


                              <small className="mt-1 block truncate text-xs text-[#91857c]">

                                {product.weight
  ? `${product.weight} Piece`
  : "Weight not specified"}

                              </small>

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="inline-flex rounded-full bg-[#f4eee8] px-3 py-1.5 text-xs font-medium text-[#75685e]">

                            {
                              product.category ||
                              "Other"
                            }

                          </span>

                        </td>


                        {/* PRICE */}

                        <td>

                          <strong className="font-semibold text-[#302820]">

                            ₹
                            {safeNumber(
                              product.price
                            ).toLocaleString(
                              "en-IN"
                            )}

                          </strong>

                        </td>


                        {/* STOCK */}

                        <td>

                          <span
                            className={`text-sm font-medium ${
                              stock <= 5
                                ? "stock-low-number"
                                : "stock-number"
                            }`}
                          >
                            {stock}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          <button
                            type="button"
                            onClick={() =>
                              toggleVisibility(
                                product
                              )
                            }
                            className={`inventory-status inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              product.visible !==
                              false
                                ? "good"
                                : "out"
                            }`}
                          >

                            <span />

                            {product.visible !==
                            false ? (
                              <>
                                <Eye
                                  size={13}
                                />
                                Visible
                              </>
                            ) : (
                              <>
                                <EyeOff
                                  size={13}
                                />
                                Hidden
                              </>
                            )}

                          </button>

                        </td>


                        {/* ACTIONS */}

                        <td className="text-right">

                          <div className="flex justify-end gap-1">

                            <button
                              type="button"
                              title="Edit product"
                              onClick={() =>
                                openEditModal(
                                  product
                                )
                              }
                              className="rounded-lg p-2 text-[#74685e] transition hover:bg-[#f1ebe5] hover:text-[#302820]"
                            >
                              <Edit3
                                size={17}
                              />
                            </button>


                            <button
                              type="button"
                              title="Delete product"
                              onClick={() =>
                                handleDelete(
                                  product
                                )
                              }
                              className="rounded-lg p-2 text-[#a66d61] transition hover:bg-[#f8eae7]"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}


                {/* EMPTY FIXED ROWS PADDING */}

                {emptyRows > 0 &&
                  Array.from({
                    length: emptyRows,
                  }).map(
                    (_, index) => (
                      <tr
                        className="inventory-empty-row"
                        key={`empty-${index}`}
                      >
                        <td colSpan={7}>
                          &nbsp;
                        </td>
                      </tr>
                    )
                  )}


                {/* NO RESULTS */}

                {!filteredProducts.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="inventory-no-results py-16 text-center"
                    >

                      <Boxes
                        size={32}
                        className="mx-auto mb-3 text-[#b19f93]"
                      />

                      <strong className="block text-base text-[#5b4940] mb-1">
                        No products found
                      </strong>

                      <span className="block text-sm text-[#95877e]">
                        No products match the current search or category filter.
                      </span>

                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              PAGINATION FOOTER CONTROLS
          ================================================= */}

          <div className="inventory-pagination flex items-center justify-between border-t border-[#e7ded7] bg-[#fbf8f4] px-6 py-4">

            <div className="text-xs text-[#91837a]">
              Showing{" "}
              <strong className="text-[#302820]">{firstShown}</strong>{" "}
              –{" "}
              <strong className="text-[#302820]">{lastShown}</strong>{" "}
              of{" "}
              <strong className="text-[#302820]">{filteredProducts.length}</strong> items
            </div>


            <div className="inventory-page-controls flex items-center gap-2">

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                className="flex items-center gap-1 rounded-xl border border-[#ded4ca] bg-white px-3.5 py-2 text-xs font-semibold text-[#5e534b] shadow-sm transition hover:bg-[#f5efe9] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Previous
              </button>


              <span className="min-w-[85px] text-center text-xs font-medium text-[#786a62]">
                Page {currentPage} of {totalPages}
              </span>


              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((current) =>
                    Math.min(totalPages, current + 1)
                  )
                }
                className="flex items-center gap-1 rounded-xl border border-[#ded4ca] bg-white px-3.5 py-2 text-xs font-semibold text-[#5e534b] shadow-sm transition hover:bg-[#f5efe9] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>

          </div>

        </section>

      </main>


      {/* ===================================================
          PRODUCT MODAL
      =================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2c211b]/55 p-4 backdrop-blur-[6px]">

          <div className="flex max-h-[94vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[26px] border border-[#e0d6cc] bg-[#fffdfa] shadow-[0_35px_120px_rgba(30,20,10,0.25)]">


            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-start justify-between border-b border-[#ebe2d9] bg-[#fffdfa] px-7 py-6">

              <div>

                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a08d7d]">
                  Product Catalog
                </p>

                <h2 className="font-serif text-[30px] font-semibold leading-tight text-[#302820]">

                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}

                </h2>

                <p className="mt-1 text-sm text-[#8a7d73]">
                  Add the details customers
                  will see on the bakery website.
                </p>

              </div>


              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving ||
                  imageLoading
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#ddd3ca] bg-white text-[#5e534b] transition hover:bg-[#f5efe9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>


            {/* MODAL CONTENT */}

            <div className="overflow-y-auto">

              <div className="space-y-6 p-7">


                {/* IMAGE */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#544940]">
                    Product Image
                  </label>


                  <div className="rounded-2xl border border-[#e3d9d0] bg-[#faf7f3] p-4">

                    <div className="flex flex-col items-center gap-5 sm:flex-row">

                      <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-2xl border border-[#ded4ca] bg-[#f2ece5]">

                        {form.image ? (

                          <img
                            src={
                              form.image
                            }
                            alt="Product preview"
                            className="h-full w-full object-cover"
                          />

                        ) : (

                          <div className="flex h-full w-full flex-col items-center justify-center text-[#9b8d82]">

                            <ImageIcon
                              size={28}
                            />

                            <span className="mt-1 text-[11px]">
                              No image
                            </span>

                          </div>

                        )}

                      </div>


                      <div className="w-full flex-1 space-y-3">

                        <p className="text-xs text-[#7e7269]">
                          Upload a high-quality product image (PNG, JPEG, WebP up to 10MB). Images are automatically compressed.
                        </p>


                        <div className="flex flex-wrap gap-2">

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={
                              handleImageUpload
                            }
                          />


                          <button
                            type="button"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            disabled={
                              imageLoading ||
                              saving
                            }
                            className="flex items-center gap-2 rounded-xl border border-[#ded4ca] bg-white px-4 py-2 text-xs font-semibold text-[#4d433b] shadow-sm transition hover:bg-[#f3ece5] disabled:opacity-50"
                          >
                            <Upload size={14} />

                            {imageLoading
                              ? "Processing..."
                              : form.image
                              ? "Change Image"
                              : "Upload Image"}

                          </button>


                          {form.image && (
                            <button
                              type="button"
                              onClick={
                                removeImage
                              }
                              disabled={
                                imageLoading ||
                                saving
                              }
                              className="flex items-center gap-1.5 rounded-xl border border-[#e8d2cb] bg-[#fbf0ee] px-3 py-2 text-xs font-semibold text-[#a65d52] transition hover:bg-[#f6e2dd]"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* NAME & CATEGORY */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#544940]">
                      Product Name *
                    </label>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateField(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="e.g. Chocolate Truffle Cake"
                      className="h-11 w-full rounded-xl border border-[#ded4ca] bg-white px-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843] focus:ring-4 focus:ring-[#a96843]/5"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#544940]">
                      Category *
                    </label>

                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateField(
                          "category",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-[#ded4ca] bg-white px-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843]"
                    >

                      {DEFAULT_CATEGORIES.map(
                        (cat) => (
                          <option
                            key={cat}
                            value={cat}
                          >
                            {cat}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>


                {/* PRICE & STOCK */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#544940]">
                      Price (₹) *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateField(
                          "price",
                          event.target.value
                        )
                      }
                      placeholder="499"
                      className="h-11 w-full rounded-xl border border-[#ded4ca] bg-white px-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843] focus:ring-4 focus:ring-[#a96843]/5"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#544940]">
                      Stock Quantity *
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(event) =>
                        updateField(
                          "stock",
                          event.target.value
                        )
                      }
                      placeholder="25"
                      className="h-11 w-full rounded-xl border border-[#ded4ca] bg-white px-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843] focus:ring-4 focus:ring-[#a96843]/5"
                    />

                  </div>

                </div>


                {/* WEIGHT & UNIT */}

                <div className="grid gap-4 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#544940]">
                      Weight / Size
                    </label>

                    <input
                      value={form.weight}
                      onChange={(event) =>
                        updateField(
                          "weight",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 500"
                      className="h-11 w-full rounded-xl border border-[#ded4ca] bg-white px-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843] focus:ring-4 focus:ring-[#a96843]/5"
                    />

                  </div>


                  <div>

                    <label className="mb-2 block text-xs font-semibold text-[#544940]">
                      Unit
                    </label>

                    <select
                      value={form.unit}
                      onChange={(event) =>
                        updateField(
                          "unit",
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-[#ded4ca] bg-white px-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843]"
                    >
                      <option value="Piece">Piece</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="Box">Box</option>
                      <option value="Packet">Packet</option>
                      <option value="Bottle">Bottle</option>
                    </select>

                  </div>

                </div>


                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#544940]">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Write a short appetizing description for customers..."
                    className="w-full rounded-xl border border-[#ded4ca] bg-white p-4 text-sm text-[#302820] outline-none transition focus:border-[#a96843] focus:ring-4 focus:ring-[#a96843]/5"
                  />

                </div>


                {/* TOGGLES */}

                <div className="flex flex-wrap items-center gap-6 pt-2">

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) =>
                        updateField(
                          "featured",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-[#ded4ca] accent-[#9b623f]"
                    />
                    <span className="text-sm font-medium text-[#4d433b]">
                      Featured Product
                    </span>
                  </label>


                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.visible}
                      onChange={(event) =>
                        updateField(
                          "visible",
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-[#ded4ca] accent-[#9b623f]"
                    />
                    <span className="text-sm font-medium text-[#4d433b]">
                      Visible in Store
                    </span>
                  </label>

                </div>

              </div>

            </div>


            {/* MODAL FOOTER */}

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#ebe2d9] bg-[#fffdfa] px-7 py-4">

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  saving ||
                  imageLoading
                }
                className="rounded-xl border border-[#ded4ca] bg-white px-5 py-2.5 text-sm font-semibold text-[#5e534b] transition hover:bg-[#f5efe9] disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  imageLoading
                }
                className="rounded-xl bg-[#9b623f] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(120,70,40,0.2)] transition hover:bg-[#805033] active:scale-[0.98] disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Save Changes"
                  : "Add Product"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* STYLES */}

      <style jsx>{`
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

        .col-sno {
          width: 65px;
        }

        .col-product {
          width: 30%;
        }

        .col-action {
          width: 130px;
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
          border: 1px solid #ded5cc;
        }

        .inventory-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-number {
          color: #44332b;
        }

        .stock-low-number {
          color: #b05e35;
          font-weight: 650;
        }

        .inventory-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
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

        .inventory-status.out {
          background: #f0ebe7;
          color: #95877d;
        }

        .inventory-status.out > span {
          background: #b5a99f;
        }

        .inventory-empty-row td {
          height: 67px;
          background: #fffdfa;
        }
      `}</style>

    </div>
  );
}