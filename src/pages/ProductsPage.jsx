import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import './PageStyles.css';

const TABS = ['All', 'Standard Lanyards', 'Custom Lanyards'];

const ProductsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const { addItem } = useCart();

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
                            <div className="product-card__image">
                                <span className="product-card__tag">{product.tag}</span>
                            </div>
                            <div className="product-card__info">
                                <p className="product-card__type">{product.type}</p>
                                <h3 className="product-card__name">{product.name}</h3>
                                <p className="product-card__price">₱{product.price.toFixed(2)}</p>
                                <button
                                    className="product-card__btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addItem({ ...product, category: product.type, qty: 1 });
                                    }}
                                >
                                    Add to Cart
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
