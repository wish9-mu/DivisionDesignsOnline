import React, { useState } from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

const cartItems = [
    { id: 1, name: 'Reversible Reds', qty: 2, price: 210 },
    { id: 2, name: 'Classic Black Lanyard', qty: 1, price: 120 },
];

const OrderFormsPage = () => {
    const [activeTab, setActiveTab] = useState('Cart');
    const [items, setItems] = useState(cartItems);

    const updateQty = (id, delta) => {
        setItems(prev => prev
            .map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        );
    };

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    return (
        <Layout>
            <div className="page">
                <div className="page__header">
                    <p className="page__eyebrow">Orders</p>
                    <h1 className="page__title">Order Forms</h1>
                    <p className="page__subtitle">Review your cart and complete your purchase.</p>
                </div>

                <div className="page__tabs">
                    {['Cart', 'Checkout'].map(tab => (
                        <button
                            key={tab}
                            className={`page__tab${activeTab === tab ? ' page__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Cart' && (
                    <div className="order__cart">
                        {items.map(item => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item__image" />
                                <div className="cart-item__info">
                                    <h3 className="cart-item__name">{item.name}</h3>
                                    <p className="cart-item__price">₱{item.price.toFixed(2)}</p>
                                </div>
                                <div className="qty-control">
                                    <button onClick={() => updateQty(item.id, -1)}>−</button>
                                    <span>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                                </div>
                                <p className="cart-item__subtotal">₱{(item.price * item.qty).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="order__total">
                            <span>Total</span>
                            <span>₱{total.toFixed(2)}</span>
                        </div>
                        <button className="page__cta-btn" onClick={() => setActiveTab('Checkout')}>
                            Proceed to Checkout →
                        </button>
                    </div>
                )}

                {activeTab === 'Checkout' && (
                    <div className="order__checkout">
                        <form className="checkout-form" onSubmit={e => e.preventDefault()}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Juan Dela Cruz" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" placeholder="juan@email.com" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Delivery Address</label>
                                <input type="text" placeholder="Street, City, Province" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input type="tel" placeholder="+63 9XX XXX XXXX" />
                                </div>
                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select>
                                        <option>GCash</option>
                                        <option>Bank Transfer</option>
                                        <option>Cash on Delivery</option>
                                    </select>
                                </div>
                            </div>
                            <div className="order__summary">
                                <p>Order Total: <strong>₱{total.toFixed(2)}</strong></p>
                            </div>
                            <button type="submit" className="page__cta-btn">Place Order</button>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OrderFormsPage;
