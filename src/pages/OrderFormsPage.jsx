import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css';

const OrderFormsPage = () => {
    const { items, updateQty, total, clearCart } = useCart();
    const [activeTab, setActiveTab] = useState('Cart');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        address: '',
        contact: '',
        paymentMethod: 'Paymongo'
    });

    const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (items.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        setIsSubmitting(true);

        try {
            const orderCode = `ORD-${new Date().getFullYear()}-${String(
                Math.floor(Math.random() * 1e6)
            ).padStart(6, '0')}`;

            // For Paymongo: stock is deducted by the webhook on payment confirmation.
            // For other methods (COD, Bank Transfer): deduct immediately.
            if (form.paymentMethod !== 'Paymongo') {
                const updatePromises = items.map(async (item) => {
                    let productId = item.id;

                    // Some cart items can come from old/static IDs (e.g. slugs or p1/p2).
                    // Resolve the real DB UUID first, then update stock by UUID.
                    if (!isUuid(productId)) {
                        const { data: resolvedProduct, error: resolveError } = await supabase
                            .from('products')
                            .select('id, stock')
                            .eq('name', item.name)
                            .maybeSingle();

                        if (resolveError) throw resolveError;
                        if (!resolvedProduct) {
                            throw new Error(`Product not found for cart item: ${item.name}`);
                        }

                        productId = resolvedProduct.id;
                    }

                    // Fetch current stock to ensure we don't go below 0
                    const { data: productData, error: fetchError } = await supabase
                        .from('products')
                        .select('stock')
                        .eq('id', productId)
                        .single();

                    if (fetchError) throw fetchError;

                    const newStock = Math.max(0, productData.stock - item.qty);

                    // Update stock in Supabase
                    const { error: updateError } = await supabase
                        .from('products')
                        .update({ stock: newStock })
                        .eq('id', productId);

                    if (updateError) throw updateError;
                });

                await Promise.all(updatePromises);
            }

            const itemsSummary = items
                .map((item) => `${item.name} x${item.qty}`)
                .join(', ');

            const { error: orderInsertError } = await supabase
                .from('orders')
                .insert([
                    {
                        ...(user?.id ? { user_id: user.id } : {}),
                        order_code: orderCode,
                        customer_name: form.fullName,
                        customer_email: form.email,
                        contact_number: form.contact,
                        shipping_address: form.address,
                        // If Paymongo, set initially as 'Pending' or wait for webhook
                        payment_method: form.paymentMethod,
                        items_summary: itemsSummary,
                        total_amount: Number(total),
                        status: 'Pending',
                        order_date: new Date().toISOString().slice(0, 10),
                        line_items: items,
                    },
                ]);

            if (orderInsertError) throw orderInsertError;

            if (form.paymentMethod === 'Paymongo') {
                // Call Supabase Edge Function to create Paymongo Checkout
                const { data, error } = await supabase.functions.invoke('create-paymongo-checkout', {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    },
                    body: {
                        order_code: orderCode,
                        amount: Number(total),
                        line_items: items,
                        customer_name: form.fullName,
                        customer_email: form.email,
                        success_url: `${window.location.origin}${import.meta.env.BASE_URL}success`,
                        cancel_url: `${window.location.origin}${import.meta.env.BASE_URL}cancel?order_code=${orderCode}`
                    }
                });

                if (error) {
                    console.error("Edge Function error: ", error);
                    throw new Error("Payment gateway error. Please try again.");
                }

                if (data?.checkout_url) {
                    clearCart();
                    window.location.href = data.checkout_url;
                    return; // Prevent further execution
                } else {
                    throw new Error("Failed to get checkout URL from payment gateway.");
                }
            }

            clearCart();
            navigate('/success');
        } catch (error) {
            console.error("Checkout failed:", error);
            alert(`There was an error processing your checkout: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                        <option value="Paymongo">Paymongo (GCash, GrabPay, QRPh, Card)</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash on Delivery">Cash on Delivery</option>
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
