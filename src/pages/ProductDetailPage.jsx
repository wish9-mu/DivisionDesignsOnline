import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabaseClient";
import { accordionSections } from "../data/accordionData";
import { parseProductImages, getProductPrimaryImage } from "../utils/imageUtils";
import SuggestedProducts from "../components/SuggestedProducts";
import "./ProductDetailPage.css";

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

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Fetch product from Supabase
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch reviews from Supabase
  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      try {
        const { data } = await supabase
          .from("product_reviews")
          .select("*")
          .eq("product_id", productId)
          .order("created_at", { ascending: false });

        if (data) setReviews(data);
      } catch {
        console.log("Reviews not available");
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <Layout>
        <div className="page">
          <div className="pdp-not-found">
            <h2>Loading...</h2>
          </div>
        </div>
      </Layout>
    );
  }

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
      image_url: getProductPrimaryImage(product),
      category: product.type,
      qty,
    });
  };

  // Build the image list: use `images` array if available,
  // otherwise parse `image_url` (handles JSON arrays and single URLs)
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : parseProductImages(product.image_url);

  const currentImage = productImages[selectedImage] || null;

  const avgRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(2)
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length,
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
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={`${product.name} - image ${selectedImage + 1}`}
                  />
                ) : (
                  <div className="pdp-gallery__placeholder" />
                )}
                <span className="pdp-gallery__tag">{product.tag}</span>
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="pdp-gallery__thumbs">
                {productImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    className={`pdp-gallery__thumb${selectedImage === i ? " pdp-gallery__thumb--active" : ""
                      }`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      className="pdp-gallery__thumb-img"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="pdp-info">
            {reviews.length > 0 && (
              <div className="pdp-info__rating">
                <StarRating rating={Math.round(avgRating)} />
                <span className="pdp-info__review-count">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            <h1 className="pdp-info__name">{product.name}</h1>

            <div className="pdp-info__meta">
              <span className="pdp-info__type">{product.type}</span>
            </div>

            <p className="pdp-info__description">
              {product.description || "No description available."}
            </p>

            <p className="pdp-info__price">
              ₱{Number(product.price).toFixed(2)}
            </p>

            <p
              className="pdp-info__stock"
              style={{
                color:
                  product.stock > 0 ? "green" : "var(--color-primary-dark)",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
                fontWeight: "500",
              }}
            >
              {product.stock > 0
                ? `${product.stock} items available`
                : "Out of Stock"}
            </p>

            {/* Quantity */}
            <div className="pdp-option">
              <label className="pdp-option__label">Quantity</label>
              <div className="pdp-qty">
                <button
                  className="pdp-qty__btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={product.stock <= 0}
                >
                  −
                </button>
                <span className="pdp-qty__value">
                  {product.stock <= 0 ? 0 : qty}
                </span>
                <button
                  className="pdp-qty__btn"
                  onClick={() =>
                    setQty((q) => Math.min(q + 1, product.stock || Infinity))
                  }
                  disabled={
                    product.stock <= 0 || qty >= (product.stock || Infinity)
                  }
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pdp-actions">
              <button
                className="pdp-actions__add"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                style={{
                  opacity: product.stock <= 0 ? 0.5 : 1,
                  cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                }}
              >
                {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                className="pdp-actions__buy"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                style={{
                  opacity: product.stock <= 0 ? 0.5 : 1,
                  cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                }}
              >
                {product.stock <= 0 ? "Out of Stock" : "Buy it Now"}
              </button>
            </div>

            {/* Accordions */}
            <div className="pdp-accordions">
              {accordionSections.map((section, i) => (
                <div
                  key={i}
                  className={`pdp-accordion${openAccordion === i ? " pdp-accordion--open" : ""
                    }`}
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
              <span className="pdp-reviews__avg-num">{avgRating} out of 5</span>
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
                      <span className="pdp-review-card__verified">
                        ✓ Verified Buyer
                      </span>
                    </div>
                    <span className="pdp-review-card__date">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })}
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

        {/* ── Suggested Products ─────────────────── */}
        <SuggestedProducts currentProductId={product.id} />
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
