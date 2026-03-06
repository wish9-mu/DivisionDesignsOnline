import React from 'react';
import './AdminOrders.css';

const AdminOrders = ({ orders, updateOrderStatus, ORDER_STATUSES }) => {
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
                    <button key={tab} className={`lazada-primary-tab ${tab === 'To Ship' ? 'active' : ''}`}>
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
                    <span className="lazada-toolbar-text">Page 1, 1 - {orders.length} of {orders.length} items</span>
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
                    {orders.length > 0 ? (
                        <tbody>
                            {orders.map(order => (
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
                                        <div className="lazada-amount">₱{order.total.toLocaleString()}</div>
                                        <div className="lazada-payment">Paid</div>
                                    </td>
                                    <td>
                                        <div className="lazada-delivery">
                                            <div>Standard Delivery</div>
                                            <div className="lazada-tracking">Tracking Unassigned</div>
                                        </div>
                                    </td>
                                    <td>
                                        <select className="admin__status-select" value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)} style={{ width: '100%', marginBottom: '4px' }}>
                                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <div className="lazada-date">{order.date}</div>
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
                {orders.length === 0 && (
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
