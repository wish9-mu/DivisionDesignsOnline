// BestSellers.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./BestSellers.css";

const BestSellers = () => {
  // Filter products with "Bestseller" tag or featured ones
  const bestSellers = [
    {
      id: "p1",
      name: "Classic Black Lanyard",
      price: 120,
      tag: "Bestseller",
      type: "Standard Lanyards",
    },
    {
      id: "p3",
      name: "Reversible Reds",
      price: 210,
      tag: "Featured",
      type: "Standard Lanyards",
    },
    {
      id: "p4",
      name: "Full-Color Print Lanyard",
      price: 280,
      tag: "Custom",
      type: "Custom Lanyards",
    },
    {
      id: "p6",
      name: "Dye-Sublimation Lanyard",
      price: 350,
      tag: "Premium",
      type: "Custom Lanyards",
    },
  ];

  return (
    <section className="best-sellers">
      <div className="best-sellers__inner">
        <div className="best-sellers__header">
          <h2 className="best-sellers__title">Shop Best Sellers</h2>
          <p className="best-sellers__subtitle">
            From corporate events to campus pride, these are what teams and
            businesses trust most.
          </p>
        </div>

        <div className="best-sellers__grid">
          {bestSellers.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="best-sellers__card"
            >
              <div className="best-sellers__card-image">
                {product.tag && (
                  <span className="best-sellers__card-badge">
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="best-sellers__card-info">
                <h3 className="best-sellers__card-name">{product.name}</h3>
                <p className="best-sellers__card-price">
                  From ₱{product.price.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="best-sellers__footer">
          <Link to="/products" className="best-sellers__view-all">
            View all
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
