import React from 'react';

const AdminCustomOrders = ({ customOrders, updateCustomStatus, CUSTOM_STATUSES, badgeClass }) => {
    return (
        <>
            <div className="admin__section-header">
                <h2 className="admin__section-title">Custom Order Requests ({customOrders.length})</h2>
            </div>
            <div className="admin__table-wrap">
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>Reference ID</th><th>Organization</th><th>Email</th><th>Qty</th><th>Material</th><th>Size</th><th>Print</th><th>Status</th><th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customOrders.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600 }}>{order.id}</td>
                                <td>{order.org}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{order.email}</td>
                                <td>{order.qty}</td>
                                <td>{order.material}</td>
                                <td>{order.size}</td>
                                <td>{order.print}</td>
                                <td>
                                    <select className="admin__status-select" value={order.status} onChange={e => updateCustomStatus(order.id, e.target.value)}>
                                        {CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td style={{ color: 'rgba(0,0,0,0.45)' }}>{order.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminCustomOrders;
