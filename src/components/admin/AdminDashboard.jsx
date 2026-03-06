import React from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ products, orders, totalRevenue, pendingCustom, upcomingAppointments, badgeClass }) => {
    return (
        <>
            <div className="admin__stats">
                <div className="admin__stat-card">
                    <div className="admin__stat-value">{products?.length || 0}</div>
                    <div className="admin__stat-label">Total Products</div>
                </div>
                <div className="admin__stat-card">
                    <div className="admin__stat-value">{orders?.length || 0}</div>
                    <div className="admin__stat-label">Total Orders</div>
                </div>
                <div className="admin__stat-card">
                    <div className="admin__stat-value">₱{totalRevenue.toLocaleString()}</div>
                    <div className="admin__stat-label">Revenue</div>
                </div>
                <div className="admin__stat-card">
                    <div className="admin__stat-value">{pendingCustom}</div>
                    <div className="admin__stat-label">Pending Custom</div>
                </div>
                <div className="admin__stat-card">
                    <div className="admin__stat-value">{upcomingAppointments}</div>
                    <div className="admin__stat-label">Upcoming Appts</div>
                </div>
            </div>
            <div className="admin__section-header">
                <h2 className="admin__section-title">Recent Orders</h2>
            </div>
            <div className="admin__table-wrap">
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 5).map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600 }}>{order.id}</td>
                                <td>{order.customer}</td>
                                <td>{order.items}</td>
                                <td style={{ fontWeight: 700 }}>₱{order.total.toLocaleString()}</td>
                                <td><span className={badgeClass(order.status)}>{order.status}</span></td>
                                <td style={{ color: 'rgba(0,0,0,0.45)' }}>{order.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminDashboard;
