import React from "react";
import { Link } from "react-router-dom";
import { getProductPrimaryImage } from "../utils/imageUtils";
import "./ShopCard.css";

const ShopCard = ({ product, index, onAddToCart }) => {
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const primaryImage = getProductPrimaryImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="shop-card"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Image + overlay */}
      <div className="shop-card__img">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} loading="lazy" />
        ) : (
          <div className="shop-card__placeholder" />
        )}

        <span className="shop-card__tag">{product.tag}</span>

        {/* Hover overlay with quick-add */}
        <div className="shop-card__overlay">
          <button
            className="shop-card__quick-add"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? "Sold Out" : "+ Add to Cart"}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="shop-card__body">
        <p
          className={`shop-card__status${isOutOfStock ? " shop-card__status--out" : ""}`}
        >
          {isOutOfStock ? "Out of Stock" : "Available"}
        </p>
        <h3 className="shop-card__name">{product.name}</h3>
        <p className="shop-card__type">{product.type}</p>
        <p className="shop-card__price">
          ₱{product.price.toLocaleString("en-PH")}
        </p>
      </div>
    </Link>
  );
};

export default ShopCard;
