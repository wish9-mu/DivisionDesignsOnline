import React from 'react';

const AdminCustomOrders = ({ customOrders, updateCustomStatus, CUSTOM_STATUSES, loading }) => {
    if (loading) {
        return <p>Loading custom orders...</p>;
    }

    return (
        <>
            <div className="admin__section-header">
                <h2 className="admin__section-title">Custom Order Requests ({customOrders.length})</h2>
            </div>
            <div className="admin__table-wrap">
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>Reference ID</th><th>Organization</th><th>Email</th><th>Qty</th><th>Type</th><th>Appointment</th><th>Status</th><th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customOrders.map(order => (
                            <tr key={order.id}>
                                <td style={{ fontWeight: 600 }}>{order.reference_id || order.id}</td>
                                <td>{order.org_name || order.org || 'N/A'}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{order.contact_email || order.email || 'N/A'}</td>
                                <td>{order.quantity || order.qty || 0}</td>
                                <td>{order.lanyard_type || `${order.material || '-'} / ${order.size || '-'}`}</td>
                                <td>{order.appointment_date ? `${order.appointment_date} ${order.appointment_time || ''}` : 'N/A'}</td>
                                <td>
                                    <select className="admin__status-select" value={order.status || 'Pending Review'} onChange={e => updateCustomStatus(order.id, e.target.value)}>
                                        {CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td style={{ color: 'rgba(0,0,0,0.45)' }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : order.date || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminCustomOrders;
