import React, { useState, useEffect, useRef } from 'react';
import './FeaturedProduct.css';
import hero1 from '../assets/Hero1.png';
import { useCart } from '../context/CartContext';
import gsap from 'gsap';

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
    const sectionRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.featured-redesign__info > *',
                { opacity: 0, x: -20 },
                { opacity: 1, x: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }
            );
            gsap.fromTo('.featured-redesign__image-wrap',
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 1, ease: 'power2.inOut' }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const decrease = () => setQty((q) => Math.max(1, q - 1));
    const increase = () => setQty((q) => q + 1);

    const handleAddToCart = () => {
        addItem({ ...PRODUCT, qty });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    return (
        <section className="featured-redesign" id="products" ref={sectionRef}>
            <div className="featured-redesign__content">
                {/* Info (Left) */}
                <div className="featured-redesign__info">
                    <h2 className="featured-redesign__name">
                        Reversible<br />Reds
                    </h2>

                    <p className="featured-redesign__description">
                        Enjoy the premium feel of our exclusive reversible lanyards. Featuring high-quality prints and durable materials, it's perfect for campus life or everyday wear. Rep your university with comfort and style.
                    </p>

                    <p className="featured-redesign__price">₱210.00</p>

                    <div className="featured-redesign__options">
                        <div className="featured-redesign__option-group">
                            <label>Size</label>
                            <select className="featured-redesign__select" defaultValue="Standard">
                                <option value="Standard">Standard</option>
                                <option value="Long">Long</option>
                            </select>
                        </div>

                        <div className="featured-redesign__option-group">
                            <label>Attachment Type</label>
                            <select className="featured-redesign__select" defaultValue="G-Hook">
                                <option value="G-Hook">G-Hook</option>
                                <option value="Trigger Snap">Trigger Snap</option>
                            </select>
                        </div>
                    </div>

                    <div className="featured-redesign__qty-group">
                        <label>Quantity</label>
                        <div className="featured-redesign__qty-control">
                            <button className="featured-redesign__qty-btn" onClick={decrease}>−</button>
                            <span className="featured-redesign__qty-value">{qty}</span>
                            <button className="featured-redesign__qty-btn" onClick={increase}>+</button>
                        </div>
                    </div>

                    <button
                        className={`featured-redesign__cart-btn${added ? ' added' : ''}`}
                        onClick={handleAddToCart}
                    >
                        {added ? '✓ Added to cart!' : 'Add to cart'}
                    </button>
                </div>

                {/* Image (Right) */}
                <div className="featured-redesign__image-wrap">
                    <img src={hero1} alt="Reversible Reds" className="featured-redesign__image" />
                </div>
            </div>
        </section>
    );
};

export default FeaturedProduct;
