import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabaseClient";
import FilterSidebar from "../components/FilterSidebar";
import ShopCard from "../components/ShopCard";
import "./PageStyles.css";

const fallbackProducts = [
  {
    id: "3044a828-eee9-4418-8068-33f57ed1573d",
    type: "Custom Lanyards",
    name: "Mapua Baybayin Purple",
    price: 280,
    tag: "Custom",
    stock: 0,
  },
  {
    id: "3a667fe8-892e-4bb2-9a9e-5f4ae580b1f",
    type: "Standard Lanyards",
    name: "Mapua Baybayin Red",
    price: 120,
    tag: "Bestseller",
    stock: 74,
  },
  {
    id: "7c185c67-7fcd-41da-8267-8e7db6c5c170",
    type: "Standard Lanyards",
    name: "The Original - Comsci",
    price: 210,
    tag: "Featured",
    stock: 32,
  },
  {
    id: "e7892b2d-d675-4c65-9c57-b94d6cb10f4e",
    type: "Custom Lanyards",
    name: "The Minimalist",
    price: 320,
    tag: "Custom",
    stock: 0,
  },
  {
    id: "bf104f3b-f8df-4324-85ac-0e820f401b6f",
    type: "Custom Lanyards",
    name: "Karudinal - Comsci",
    price: 350,
    tag: "Premium",
    stock: 1,
  },
  {
    id: "72e1fafa-153a-4359-b3c4-054b4c033c9a",
    type: "Standard Lanyards",
    name: "The Original Red",
    price: 150,
    tag: "Bestseller",
    stock: 55,
  },
];

const SORT_OPTIONS = [
  { label: "Newest",          value: "newest"    },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "Name: A–Z",       value: "name-asc"  },
];

const CATEGORIES  = ["All", "Standard Lanyards", "Custom Lanyards"];
const TAGS        = ["All", "Premium", "Custom", "Bestseller", "Featured"];
const AVAILABILITY = ["All", "In Stock", "Out of Stock"];

const ProductsPage = () => {
  const [products,           setProducts]           = useState(fallbackProducts);
  const [activeCategory,     setActiveCategory]     = useState("All");
  const [activeTag,          setActiveTag]          = useState("All");
  const [activeAvailability, setActiveAvailability] = useState("All");
  const [sortBy,             setSortBy]             = useState("newest");
  const [sortOpen,           setSortOpen]           = useState(false);
  const [filtersVisible,     setFiltersVisible]     = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        setProducts(data);
      }
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All")
      result = result.filter((p) => p.type === activeCategory);
    if (activeTag !== "All")
      result = result.filter((p) => p.tag === activeTag);
    if (activeAvailability === "In Stock")
      result = result.filter((p) => p.stock > 0);
    else if (activeAvailability === "Out of Stock")
      result = result.filter((p) => p.stock !== undefined && p.stock <= 0);

    switch (sortBy) {
      case "price-asc":  result.sort((a, b) => a.price - b.price);               break;
      case "price-desc": result.sort((a, b) => b.price - a.price);               break;
      case "name-asc":   result.sort((a, b) => a.name.localeCompare(b.name));    break;
      default: break;
    }

    return result;
  }, [products, activeCategory, activeTag, activeAvailability, sortBy]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort By";

  const handleAddToCart = (product) => {
    addItem({
      ...product,
      image: product.image_url,
      category: product.type,
      qty: 1,
    });
  };

  return (
    <Layout>
      <div className="shop-page">

        {/* ── Top bar ─────────────────────────────── */}
        <div className="shop-topbar">
          <h1 className="shop-topbar__title">
            {activeCategory === "All" ? "All Products" : activeCategory}
            <span className="shop-topbar__count">({filtered.length})</span>
          </h1>

          <div className="shop-topbar__actions">
            {/* Filter toggle */}
            <button
              className="shop-topbar__toggle"
              onClick={() => setFiltersVisible((v) => !v)}
            >
              {filtersVisible ? "Hide Filters" : "Show Filters"}
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="4"  y1="6"  x2="20" y2="6"  />
                <line x1="4"  y1="12" x2="14" y2="12" />
                <line x1="4"  y1="18" x2="10" y2="18" />
              </svg>
            </button>

            {/* Sort dropdown */}
            <div className="shop-sort">
              <button
                className="shop-sort__btn"
                onClick={() => setSortOpen((v) => !v)}
              >
                Sort By: {currentSortLabel}
                <svg
                  className={`shop-sort__chevron${sortOpen ? " shop-sort__chevron--open" : ""}`}
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sortOpen && (
                <ul className="shop-sort__dropdown">
                  {SORT_OPTIONS.map((opt) => (
                    <li
                      key={opt.value}
                      className={`shop-sort__option${sortBy === opt.value ? " shop-sort__option--active" : ""}`}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    >
                      {opt.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ── Body: sidebar + grid ────────────────── */}
        <div className="shop-body">

          {/* Filter sidebar */}
          <FilterSidebar
            visible={filtersVisible}
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            tags={TAGS}
            activeTag={activeTag}
            onTagChange={setActiveTag}
            availability={AVAILABILITY}
            activeAvailability={activeAvailability}
            onAvailabilityChange={setActiveAvailability}
          />

          {/* Product grid */}
          <section className="shop-grid-wrapper">
            {filtered.length === 0 && (
              <p className="shop-empty">No products match your filters.</p>
            )}
            <div className={`shop-grid${filtersVisible ? "" : " shop-grid--full"}`}>
              {filtered.map((product, i) => (
                <ShopCard
                  key={product.id}
                  product={product}
                  index={i}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </section>
        </div>

      </div>
    </Layout>
  );
};

export default ProductsPage;
