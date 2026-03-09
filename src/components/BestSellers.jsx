// BestSellers.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./BestSellers.css";
import { supabase } from '../supabaseClient';

const BestSellers = () => {
  const [bestSellers, setBestSellers] = React.useState([]);

  React.useEffect(() => {
    const fetchBestSellers = async () => {
      // Fetch the specific products you want to feature
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('name', ['The Minimalist', 'Mapua Baybayin Red', 'Karudinal - Comsci'])
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .limit(3); // Changed to 3 for the new layout

      if (!error && data) {
        setBestSellers(data);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <section className="best-sellers-banner">


      <div className="best-sellers-banner__grid">
        {bestSellers.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="best-sellers-banner__card"
          >
            <div className="best-sellers-banner__image-container">
              {product.image_url ? (
                <img
                  src={product.image_url}
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
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
