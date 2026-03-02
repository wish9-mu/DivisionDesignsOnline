import React, { useState } from 'react';
import './FeaturedProduct.css';
import hero1 from '../assets/Hero1.png';
import { useCart } from '../context/CartContext';

const PRODUCT = {
    id: 'featured-reversible-reds',
    name: 'Reversible Reds',
    category: 'Reversible Lanyards',
    price: 210,
    image: hero1,
};

const FeaturedProduct = () => {
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const { addItem } = useCart();

    const decrease = () => setQty((q) => Math.max(1, q - 1));
    const increase = () => setQty((q) => q + 1);

    const handleAddToCart = () => {
        addItem({ ...PRODUCT, qty });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    return (
        <section className="featured" id="products">
            <div className="featured__label">Featured Drop</div>

            <div className="featured__card">
                {/* Image */}
                <div className="featured__image-wrap">
                    <img src={hero1} alt="Reversible Reds" className="featured__image" />
                    <span className="featured__badge">New</span>
                </div>

                {/* Info */}
                <div className="featured__info">
                    <p className="featured__category">Reversible Lanyards</p>
                    <h2 className="featured__name">Reversible Reds</h2>
                    <p className="featured__price">₱210.00</p>

                    <div className="featured__divider" />

                    <p className="featured__qty-label">Qty.</p>
                    <div className="featured__qty-row">
                        <div className="featured__qty-control">
                            <button
                                className="featured__qty-btn"
                                onClick={decrease}
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="featured__qty-value">{qty}</span>
                            <button
                                className="featured__qty-btn"
                                onClick={increase}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <button
                        className={`featured__cart-btn${added ? ' featured__cart-btn--added' : ''}`}
                        onClick={handleAddToCart}
                    >
                        {added ? '✓ Added!' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProduct;
