import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import './PageStyles.css';

// Fallback products if Supabase is not connected
const fallbackProducts = [
    { id: 'p1', type: 'Standard Lanyards', name: 'Classic Black Lanyard', price: 120, tag: 'Bestseller' },
    { id: 'p2', type: 'Standard Lanyards', name: 'Woven Red Lanyard', price: 150, tag: 'New' },
    { id: 'p3', type: 'Standard Lanyards', name: 'Reversible Reds', price: 210, tag: 'Featured' },
    { id: 'p4', type: 'Custom Lanyards', name: 'Full-Color Print Lanyard', price: 280, tag: 'Custom' },
    { id: 'p5', type: 'Custom Lanyards', name: 'Embroidered Logo Lanyard', price: 320, tag: 'Custom' },
    { id: 'p6', type: 'Custom Lanyards', name: 'Dye-Sublimation Lanyard', price: 350, tag: 'Premium' },
];

const TABS = ['All', 'Standard Lanyards', 'Custom Lanyards'];

const ProductsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [products, setProducts] = useState(fallbackProducts);
    const { addItem } = useCart();

    // Fetch products from Supabase on load
    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true });

            if (!error && data && data.length > 0) {
                setProducts(data);
            }
        };

        fetchProducts();
    }, []);

    const filtered = activeTab === 'All'
        ? products
        : products.filter(p => p.type === activeTab);

    return (
        <Layout>
            <div className="page">
                <div className="page__header">
                    <p className="page__eyebrow">Shop</p>
                    <h1 className="page__title">Our Products</h1>
                    <p className="page__subtitle">Crafted to represent your brand with pride.</p>
                </div>

                <div className="page__tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`page__tab${activeTab === tab ? ' page__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="products__grid">
                    {filtered.map(product => (
                        // <div key={product.id} className="product-card">
                        //     <div className="product-card__image">
                        //         <span className="product-card__tag">{product.tag}</span>
                        //     </div>
                        //     <div className="product-card__info">
                        //         <p className="product-card__type">{product.type}</p>
                        //         <h3 className="product-card__name">{product.name}</h3>
                        //         <p className="product-card__price">₱{product.price.toFixed(2)}</p>
                        //         <button
                        //             className="product-card__btn"
                        //             onClick={() => addItem({ ...product, category: product.type, qty: 1 })}
                        //         >
                        //             Add to Cart
                        //         </button>
                        //     </div>
                        // </div>
                        // REPLACE WITH THIS:
                        <Link key={product.id} to={`/products/${product.id}`} className="product-card">
                            <div className="product-card__image" style={{ overflow: 'hidden' }}>
                                {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                <span className="product-card__tag">{product.tag}</span>
                            </div>
                            <div className="product-card__info">
                                <p className="product-card__type">{product.type}</p>
                                <h3 className="product-card__name">{product.name}</h3>
                                <p className="product-card__price">₱{product.price.toFixed(2)}</p>
                                {product.stock !== undefined && product.stock <= 0 ? (
                                    <p className="product-card__out-of-stock" style={{ color: 'var(--color-primary-dark)', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: '500' }}>Out of Stock</p>
                                ) : (
                                    <p className="product-card__in-stock" style={{ color: 'green', fontSize: '0.85rem', marginTop: '0.25rem' }}>{product.stock} items available</p>
                                )}
                                <button
                                    className="product-card__btn"
                                    disabled={product.stock !== undefined && product.stock <= 0}
                                    style={{ opacity: product.stock !== undefined && product.stock <= 0 ? 0.5 : 1, cursor: product.stock !== undefined && product.stock <= 0 ? 'not-allowed' : 'pointer' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (product.stock === undefined || product.stock > 0) {
                                            addItem({ ...product, category: product.type, qty: 1 });
                                        }
                                    }}
                                >
                                    {product.stock !== undefined && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default ProductsPage;
