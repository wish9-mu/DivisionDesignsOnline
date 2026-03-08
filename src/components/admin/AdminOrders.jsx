import React, { useMemo, useState } from 'react';
import './AdminOrders.css';

const AdminOrders = ({ orders, updateOrderStatus, ORDER_STATUSES, loading }) => {
    const [activePrimaryTab, setActivePrimaryTab] = useState('All');

    if (loading) {
        return <p>Loading orders...</p>;
    }

    const normalizeStatus = (status) =>
        (status || '')
            .toString()
            .trim()
            .toLowerCase();

    const filteredOrders = useMemo(() => {
        return (orders || []).filter((order) => {
            const status = normalizeStatus(order.status);

            if (activePrimaryTab === 'All') return true;
            if (activePrimaryTab === 'To Ship') {
                return ['pending', 'processing', 'to ship', 'to pack', 'to arrange shipment'].includes(status);
            }
            if (activePrimaryTab === 'Shipping') {
                return ['shipped', 'shipping', 'in transit'].includes(status);
            }
            if (activePrimaryTab === 'Delivered') {
                return ['delivered', 'completed'].includes(status);
            }
            if (activePrimaryTab === 'Cancellation') {
                return ['cancelled', 'canceled', 'cancellation'].includes(status);
            }
            if (activePrimaryTab === 'Return Or Refund') {
                return ['returned', 'refunded', 'refund requested'].includes(status) || status.includes('refund') || status.includes('return');
            }

            return true;
        });
    }, [orders, activePrimaryTab]);

    return (
        <div className="lazada-orders-container">
            <div className="lazada-breadcrumb">
                <span>Home</span> &gt; <span>Order Management</span>
            </div>

            <div className="lazada-header-panel">
                <div>
                    <h1 className="lazada-page-title">Order Management</h1>
                </div>
            </div>

            <div className="lazada-primary-tabs">
                {['All', 'To Ship', 'Shipping', 'Delivered', 'Cancellation', 'Return Or Refund'].map(tab => (
                    <button
                        key={tab}
                        className={`lazada-primary-tab ${tab === activePrimaryTab ? 'active' : ''}`}
                        onClick={() => setActivePrimaryTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="lazada-secondary-tabs">
                <button className="lazada-secondary-tab active">
                    <span className="icon">📄</span> To Pack
                </button>
                <button className="lazada-secondary-tab">
                    <span className="icon">📄</span> To Arrange Shipment
                </button>
                <button className="lazada-secondary-tab">
                    <span className="icon">🚚</span> To Handover
                </button>
            </div>

            <div className="lazada-filters-panel">
                <div className="lazada-search-row">
                    <div className="lazada-search-input">
                        <input type="text" placeholder="Order Number" />
                        <span className="lazada-icon-btn">↻</span>
                        <span className="lazada-icon-btn">🔍</span>
                    </div>
                    <div className="lazada-select-input">
                        <select>
                            <option>First Mile 3PL</option>
                        </select>
                    </div>
                    <a href="#more" className="lazada-link-more">More ⌄</a>
                </div>
            </div>

            <div className="lazada-table-toolbar">
                <div className="lazada-toolbar-left">
                    <input type="checkbox" className="lazada-checkbox" />
                    <span className="lazada-toolbar-text">Page 1, 1 - {filteredOrders.length} of {filteredOrders.length} items</span>
                    <button className="lazada-btn" disabled>Pack & Print</button>
                    <button className="lazada-btn" disabled>Print Pick List</button>
                    <button className="lazada-btn-outline">Export ⌄</button>
                </div>
                <div className="lazada-toolbar-right">
                    <span className="lazada-toolbar-text">Sort By</span>
                    <select className="lazada-sort-select">
                        <option>Shortest SLA First</option>
                    </select>
                </div>
            </div>

            <div className="lazada-table-wrapper">
                <table className="lazada-table">
                    <thead>
                        <tr>
                            <th style={{ width: '45%' }}>Product</th>
                            <th style={{ width: '15%' }}>Total Amount</th>
                            <th style={{ width: '15%' }}>Delivery</th>
                            <th style={{ width: '15%' }}>Status</th>
                            <th style={{ width: '10%' }}>Actions</th>
                        </tr>
                    </thead>
                    {filteredOrders.length > 0 ? (
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <div className="lazada-product-cell">
                                            <div className="lazada-product-header">
                                                <input type="checkbox" className="lazada-checkbox" />
                                                <span className="lazada-customer-name">{order.customer}</span>
                                                <span className="lazada-order-id">{order.id}</span>
                                            </div>
                                            <div className="lazada-product-body">
                                                <div className="lazada-product-img"></div>
                                                <div className="lazada-product-info">
                                                    <div className="lazada-product-title">{order.items}</div>
                                                    <div className="lazada-product-sku">Email: {order.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="lazada-amount">₱{Number(order.total || 0).toLocaleString()}</div>
                                        <div className="lazada-payment">Paid</div>
                                    </td>
                                    <td>
                                        <div className="lazada-delivery">
                                            <div>Standard Delivery</div>
                                            <div className="lazada-tracking">Tracking Unassigned</div>
                                        </div>
                                    </td>
                                    <td>
                                        <select className="admin__status-select" value={order.status || 'Pending'} onChange={e => updateOrderStatus(order.id, e.target.value)} style={{ width: '100%', marginBottom: '4px' }}>
                                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="lazada-date">{order.date || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div className="lazada-actions-col">
                                            <button className="lazada-action-link">Print</button>
                                            <button className="lazada-action-link">Pack</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ) : null}
                </table>
                {filteredOrders.length === 0 && (
                    <div className="lazada-empty-state">
                        Empty Data
                    </div>
                )}
            </div>

            <div className="lazada-pagination">
                <button className="lazada-page-btn" disabled>&lt; Previous</button>
                <button className="lazada-page-btn lazada-page-btn--active">1</button>
                <button className="lazada-page-btn" disabled>Next &gt;</button>
                <span className="lazada-page-select-wrap">
                    Items per page:
                    <select className="lazada-page-select">
                        <option>80</option>
                    </select>
                </span>
            </div>
        </div>
    );
};

export default AdminOrders;
