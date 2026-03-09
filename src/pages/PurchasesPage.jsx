import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";
import "./PageStyles.css";

const PurchasesPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Recent Orders");
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            setOrdersLoading(true);
            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error.message);
            } else {
                setOrders(data || []);
            }
            setOrdersLoading(false);
        };

        fetchOrders();
    }, [user]);

    if (loading) return null;
    if (!user) return <Navigate to="/sign-in" replace />;

    const recentOrders = orders.filter(
        (o) => o.status !== "Completed" && o.status !== "Delivered"
    );
    const completedOrders = orders.filter(
        (o) => o.status === "Completed" || o.status === "Delivered"
    );

    const displayedOrders = activeTab === "Recent Orders" ? recentOrders : completedOrders;

    return (
        <Layout>
            <div className="page">
                <div className="page__header">
                    <p className="page__eyebrow">Purchases</p>
                    <h1 className="page__title">Order History</h1>
                    <p className="page__subtitle">Track your recent purchases and view completed orders.</p>
                </div>

                <div className="page__tabs">
                    {["Recent Orders", "Completed Orders"].map((tab) => (
                        <button
                            key={tab}
                            className={`page__tab${activeTab === tab ? " page__tab--active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="orders-container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                    {ordersLoading ? (
                        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Loading orders...</p>
                    ) : displayedOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                            <h3>No {activeTab.toLowerCase()} found</h3>
                            <p style={{ color: '#6b7280', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                                {activeTab === "Recent Orders"
                                    ? "You don't have any active orders right now."
                                    : "You don't have any completed orders yet."}
                            </p>
                            <button className="page__cta-btn" onClick={() => navigate('/products')}>
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {displayedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        overflow: 'hidden',
                                        backgroundColor: '#fff'
                                    }}
                                >
                                    <div style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        padding: '1rem 1.5rem',
                                        backgroundColor: '#f9fafb',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '1rem'
                                    }}>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
                                                ORDER PLACED
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                                                {new Date(order.order_date).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
                                                TOTAL
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                                                ₱{Number(order.total_amount).toFixed(2)}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
                                                ORDER # {order.order_code}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            Status:
                                            <span style={{
                                                fontSize: '0.875rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                backgroundColor: order.status === 'Completed' || order.status === 'Delivered' ? '#dcfce7' : '#fef9c3',
                                                color: order.status === 'Completed' || order.status === 'Delivered' ? '#166534' : '#854d0e',
                                                fontWeight: '600'
                                            }}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </h3>
                                        <div style={{ marginTop: '1rem' }}>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#374151' }}>Items:</p>
                                            <p style={{ margin: '0.5rem 0 0 0', color: '#4b5563', lineHeight: '1.5' }}>
                                                {order.items_summary}
                                            </p>
                                        </div>

                                        <div style={{ marginTop: '1.5rem' }}>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                                <strong>Payment Method:</strong> {order.payment_method}
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                                                <strong>Shipping Address:</strong> {order.shipping_address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PurchasesPage;
