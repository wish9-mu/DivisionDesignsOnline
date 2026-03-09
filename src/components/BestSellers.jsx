// BestSellers.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getProductPrimaryImage } from "../utils/imageUtils";
import "./BestSellers.css";
import { supabase } from "../supabaseClient";
import gsap from "gsap";

const BestSellers = () => {
  const [bestSellers, setBestSellers] = React.useState([]);
  const sectionRef = useRef(null);

  React.useEffect(() => {
    const fetchBestSellers = async () => {
      // Fetch the specific products you want to feature
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("name", [
          "The Minimalist",
          "Mapua Baybayin Red",
          "Karudinal - Comsci",
        ])
        .not("image_url", "is", null)
        .neq("image_url", "")
        .limit(3); // Changed to 3 for the new layout

      if (!error && data) {
        setBestSellers(data);
      }
    };

    fetchBestSellers();
  }, []);

  useEffect(() => {
    if (bestSellers.length === 0) return;
    let ctx = gsap.context(() => {
      gsap.fromTo(
        ".best-sellers-banner__card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [bestSellers]);

  return (
    <section className="best-sellers-banner" ref={sectionRef}>
      <div className="best-sellers-banner__grid">
        {bestSellers.map((product) => {
          const primaryImage = getProductPrimaryImage(product);
          return (
            <Link
              key={product.id}
              to={`/products/${product.id}`}
              className="best-sellers-banner__card"
            >
              <div className="best-sellers-banner__image-container">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="best-sellers-banner__image"
                  />
                ) : (
                  <div className="best-sellers-banner__placeholder"></div>
                )}
              </div>
              <div className="best-sellers-banner__overlay">
                <h3 className="best-sellers-banner__name">{product.name}</h3>
                <span className="best-sellers-banner__shop-btn">SHOP NOW</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BestSellers;
