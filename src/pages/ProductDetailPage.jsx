import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabaseClient";
import "./ProductDetailPage.css";

// Importing product data
import { products } from "../data/products";

// accordion data
import { accordionSections } from "../data/accordionData";

// ── Star Rating component ────────────────────────────────────
const StarRating = ({ rating }) => (
  <div className="pdp-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`pdp-star${star <= rating ? " pdp-star--filled" : ""}`}
      >
        ★
      </span>
    ))}
  </div>
);

// ══════════════════════════════════════════════════════════════
const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addItem } = useCart();

  const product = products.find((p) => p.id === productId);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    () => product?.sizes[0] || ""
  );
  const [selectedMaterial, setSelectedMaterial] = useState(
    () => product?.materials[0] ?? ""
  );
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Fetch reviews from Supabase
  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (!error && data) setReviews(data);
    };

    fetchReviews();
  }, [productId]);

  if (!product) {
    return (
      <Layout>
        <div className="page">
          <div className="pdp-not-found">
            <h2>Product not found</h2>
            <p>The product you're looking for doesn't exist.</p>
            <Link to="/products" className="page__cta-btn">
              ← Back to Products
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleAddToCart = () => {
    addItem({
      ...product,
      category: product.type,
      qty,
      size: selectedSize,
      material: selectedMaterial,
    });
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(2)
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  return (
    <Layout>
      <div className="page">
        {/* Breadcrumb */}
        <nav className="pdp-breadcrumb">
          <Link to="/">Home</Link>
          <span className="pdp-breadcrumb__sep">/</span>
          <Link to="/products">Products</Link>
          <span className="pdp-breadcrumb__sep">/</span>
          <span>{product.name}</span>
        </nav>

        {/* ── Product Top Section ─────────────────── */}
        <div className="pdp-top">
          {/* Image Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-gallery__main">
              <div className="pdp-gallery__main-img">
                <span className="pdp-gallery__tag">{product.tag}</span>
              </div>
            </div>
            <div className="pdp-gallery__thumbs">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  className={`pdp-gallery__thumb${selectedImage === i ? " pdp-gallery__thumb--active" : ""}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <div className="pdp-gallery__thumb-img" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="pdp-info">
            {reviews.length > 0 && (
              <div className="pdp-info__rating">
                <StarRating rating={Math.round(avgRating)} />
                <span className="pdp-info__review-count">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            <h1 className="pdp-info__name">{product.name}</h1>

            <div className="pdp-info__meta">
              <span className="pdp-info__type">{product.type}</span>
            </div>

            <p className="pdp-info__description">{product.description}</p>

            <p className="pdp-info__price">₱{product.price.toFixed(2)}</p>

            {/* Size Selector */}
            <div className="pdp-option">
              <label className="pdp-option__label">Size</label>
              <div className="pdp-option__chips">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pdp-chip${selectedSize === size ? " pdp-chip--active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selector */}
            <div className="pdp-option">
              <label className="pdp-option__label">Material</label>
              <div className="pdp-option__chips">
                {product.materials.map((mat) => (
                  <button
                    key={mat}
                    className={`pdp-chip${selectedMaterial === mat ? " pdp-chip--active" : ""}`}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="pdp-option">
              <label className="pdp-option__label">Quantity</label>
              <div className="pdp-qty">
                <button
                  className="pdp-qty__btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className="pdp-qty__value">{qty}</span>
                <button
                  className="pdp-qty__btn"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pdp-actions">
              <button className="pdp-actions__add" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="pdp-actions__buy" onClick={handleAddToCart}>
                Buy it Now
              </button>
            </div>

            {/* Accordions */}
            <div className="pdp-accordions">
              {accordionSections.map((section, i) => (
                <div
                  key={i}
                  className={`pdp-accordion${openAccordion === i ? " pdp-accordion--open" : ""}`}
                >
                  <button
                    className="pdp-accordion__header"
                    onClick={() => toggleAccordion(i)}
                  >
                    <span>{section.title}</span>
                    <span className="pdp-accordion__icon">
                      {openAccordion === i ? "−" : "+"}
                    </span>
                  </button>
                  {openAccordion === i && (
                    <div className="pdp-accordion__body">
                      {section.content.split("\n").map((line, j) => (
                        <p key={j}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ─────────────────────── */}
        <div className="pdp-reviews">
          <h2 className="pdp-reviews__title">Customer Reviews</h2>

          <div className="pdp-reviews__summary">
            <div className="pdp-reviews__avg">
              <StarRating rating={Math.round(avgRating)} />
              <span className="pdp-reviews__avg-num">
                {avgRating} out of 5
              </span>
              <span className="pdp-reviews__avg-count">
                Based on {reviews.length}{" "}
                {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            <div className="pdp-reviews__bars">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={star} className="pdp-reviews__bar-row">
                  <span className="pdp-reviews__bar-label">
                    {"★".repeat(star)}
                  </span>
                  <div className="pdp-reviews__bar-track">
                    <div
                      className="pdp-reviews__bar-fill"
                      style={{
                        width:
                          reviews.length > 0
                            ? `${(ratingCounts[i] / reviews.length) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <span className="pdp-reviews__bar-count">
                    {ratingCounts[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="pdp-reviews__list">
            {reviews.length === 0 ? (
              <p className="pdp-reviews__empty">
                No reviews yet. Reviews come from verified buyers only.
              </p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="pdp-review-card">
                  <div className="pdp-review-card__header">
                    <div>
                      <StarRating rating={review.rating} />
                      <span className="pdp-review-card__name">
                        {review.reviewer_name}
                      </span>
                      {/* Verified buyer badge */}
                      <span className="pdp-review-card__verified">
                        ✓ Verified Buyer
                      </span>
                    </div>
                    <span className="pdp-review-card__date">
                      {new Date(review.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="pdp-review-card__title">{review.title}</h4>
                  )}
                  <p className="pdp-review-card__body">{review.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;