import React from 'react';

const AdminAppointments = ({ appointments, updateAppointmentStatus, APPOINTMENT_STATUSES, badgeClass }) => {
    return (
        <>
            <div className="admin__section-header">
                <h2 className="admin__section-title">All Appointments ({appointments.length})</h2>
            </div>
            <div className="admin__table-wrap">
                <table className="admin__table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Customer</th><th>Email</th><th>Phone</th><th>Type</th><th>Date</th><th>Time</th><th>Notes</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(apt => (
                            <tr key={apt.id}>
                                <td style={{ fontWeight: 600 }}>{apt.appointment_code ?? apt.id}</td>
                                <td>{apt.customer}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{apt.email}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{apt.phone}</td>
                                <td><span className={badgeClass(apt.type === 'Design Consultation' ? 'Processing' : apt.type === 'Order Pickup' ? 'Shipped' : 'Featured')}>{apt.type}</span></td>
                                <td style={{ fontWeight: 600 }}>{apt.date}</td>
                                <td>{apt.time}</td>
                                <td style={{ color: 'rgba(0,0,0,0.55)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.notes}</td>
                                <td>
                                    <select className="admin__status-select" value={apt.status} onChange={e => updateAppointmentStatus(apt.id, e.target.value)}>
                                        {APPOINTMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AdminAppointments;
