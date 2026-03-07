import React from 'react';

const AdminCustomOrders = ({ customOrders, updateCustomStatus, CUSTOM_STATUSES, badgeClass }) => {
    const formatDate = (value) => {
        if (!value) return '—';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
    };

    return (
        <>
            <div className="admin__section-header">
                <h2 className="admin__section-title">Custom Order Requests ({customOrders.length})</h2>
            </div>
            <div className="admin__table-wrap">
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>Reference ID</th><th>Organization</th><th>Email</th><th>Qty</th><th>Type</th><th>File</th><th>Status</th><th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customOrders.map(order => (
                            <tr key={order.id ?? order.reference_id}>
                                <td style={{ fontWeight: 600 }}>{order.reference_id ?? order.id}</td>
                                <td>{order.org_name ?? order.org}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{order.contact_email ?? order.email}</td>
                                <td>{order.quantity ?? order.qty}</td>
                                <td>{order.lanyard_type ?? order.material ?? '—'}</td>
                                <td>
                                    {order.file_url ? (
                                        <a href={order.file_url} target="_blank" rel="noreferrer">View</a>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td>
                                    <select className="admin__status-select" value={order.status} onChange={e => updateCustomStatus(order.id, e.target.value)}>
                                        {CUSTOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td style={{ color: 'rgba(0,0,0,0.45)' }}>{formatDate(order.created_at ?? order.date)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminCustomOrders;
