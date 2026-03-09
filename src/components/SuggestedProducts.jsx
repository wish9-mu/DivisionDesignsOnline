import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getProductPrimaryImage } from "../utils/imageUtils";
import gsap from "gsap";
import "./SuggestedProducts.css";

const SuggestedProducts = ({ currentProductId }) => {
  const [products, setProducts] = useState([]);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchSuggested = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20); // Fetch more to allow for randomisation

      if (!error && data) {
        // Filter out current product
        const filtered = data.filter((p) => p.id !== currentProductId);
        // Shuffle array using sort
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 3));
      }
    };

    if (currentProductId) {
      fetchSuggested();
    }
  }, [currentProductId]);

  // Entrance Animation
  useEffect(() => {
    if (products.length > 0 && containerRef.current) {
      gsap.fromTo(
        cardsRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          clearProps: "all",
        },
      );
    }
  }, [products]);

  // Hover Animations
  const handleMouseEnter = (index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card.querySelector(".suggested-card__img img"), {
      scale: 1.08,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(card.querySelector(".suggested-card__info"), {
      y: -8,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  const handleMouseLeave = (index) => {
    const card = cardsRef.current[index];
    if (!card) return;

    gsap.to(card.querySelector(".suggested-card__img img"), {
      scale: 1,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(card.querySelector(".suggested-card__info"), {
      y: 0,
      duration: 0.5,
      ease: "power3.out",
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="suggested-products" ref={containerRef}>
      <div className="suggested-products__header">
        <h2 className="suggested-products__title">You Might Also Like</h2>
      </div>

      <div className="suggested-products__grid">
        {products.map((product, i) => {
          const primaryImage = getProductPrimaryImage(product);
          return (
            <Link
              to={`/products/${product.id}`}
              className="suggested-card"
              key={product.id}
              ref={(el) => (cardsRef.current[i] = el)}
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
            >
              <div className="suggested-card__img">
                {primaryImage ? (
                  <img src={primaryImage} alt={product.name} />
                ) : (
                  <div className="suggested-card__placeholder" />
                )}
              </div>
              <div className="suggested-card__info">
                <h3 className="suggested-card__name">{product.name}</h3>
                <p className="suggested-card__type">{product.type}</p>
                <p className="suggested-card__price">
                  ₱
                  {product.price.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedProducts;
