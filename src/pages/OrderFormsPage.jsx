import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css';

const OrderFormsPage = () => {
    const { items, updateQty, total, clearCart } = useCart();
    const [activeTab, setActiveTab] = useState('Cart');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        address: '',
        contact: '',
        paymentMethod: 'GCash'
    });

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Subtract stock for each item in the cart
            const updatePromises = items.map(async (item) => {
                // Fetch current stock to ensure we don't go below 0
                const { data: productData, error: fetchError } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.id)
                    .single();

                if (fetchError) throw fetchError;

                const newStock = Math.max(0, productData.stock - item.qty);

                // Update stock in Supabase
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.id);

                if (updateError) throw updateError;
            });

            await Promise.all(updatePromises);

            // In a full application, we would also insert an "order" record here 
            // to track the customer info (form state) and items purchased.

            clearCart();
            setOrderComplete(true);
        } catch (error) {
            console.error("Checkout failed:", error);
            alert("There was an error processing your checkout. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderComplete) {
        return (
            <Layout>
                <div className="page">
                    <div className="page__header">
                        <p className="page__eyebrow">Success</p>
                        <h1 className="page__title">Order Complete!</h1>
                        <p className="page__subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            Thank you for your purchase, {form.fullName}! We have successfully received your order and updated our inventory.
                        </p>
                        <button
                            className="page__cta-btn"
                            style={{ marginTop: '2rem' }}
                            onClick={() => navigate('/products')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

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
                        {items.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <h3>Your cart is empty</h3>
                                <button className="page__cta-btn" onClick={() => navigate('/products')} style={{ marginTop: '1rem' }}>
                                    Shop Now
                                </button>
                            </div>
                        ) : (
                            <>
                                {items.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item__image">
                                            {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div className="cart-item__info">
                                            <h3 className="cart-item__name">{item.name}</h3>
                                            <p className="cart-item__price">₱{item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="qty-control">
                                            <button onClick={() => updateQty(item.id, -1)}>−</button>
                                            <span>{item.qty}</span>
                                            <button
                                                onClick={() => updateQty(item.id, 1)}
                                                disabled={item.stock !== undefined && item.qty >= item.stock}
                                            >
                                                +
                                            </button>
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
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'Checkout' && (
                    <div className="order__checkout">
                        <form className="checkout-form" onSubmit={handleCheckout}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Juan Dela Cruz"
                                        required
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        placeholder="juan@email.com"
                                        required
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Delivery Address</label>
                                <input
                                    type="text"
                                    placeholder="Street, City, Province"
                                    required
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+63 9XX XXX XXXX"
                                        required
                                        value={form.contact}
                                        onChange={e => setForm({ ...form, contact: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={form.paymentMethod}
                                        onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                                    >
                                        <option>GCash</option>
                                        <option>Bank Transfer</option>
                                        <option>Cash on Delivery</option>
                                    </select>
                                </div>
                            </div>
                            <div className="order__summary">
                                <p>Order Total: <strong>₱{total.toFixed(2)}</strong></p>
                            </div>
                            <button type="submit" className="page__cta-btn" disabled={isSubmitting || items.length === 0}>
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OrderFormsPage;
