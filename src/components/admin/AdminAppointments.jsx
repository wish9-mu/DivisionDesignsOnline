import React, { useState, useEffect } from 'react';
import "./AdminDashboard.css";
import { supabase } from "../../supabaseClient";

const AdminAppointments = ({ updateAppointmentStatus, APPOINTMENT_STATUSES, badgeClass }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("appointments")
                .select("*")
                .order("appointment_date", { ascending: true })
                .order("appointment_time", { ascending: true });

            if (error) {
                console.error("Error fetching appointments:", error.message);
            } else {
                setAppointments(data);
            }
            setLoading(false);
        };

        fetchAppointments();
    }, []);

    if (loading) {
        return <p>Loading appointments...</p>;
    }

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
                                <td style={{ fontWeight: 600 }}>{apt.appointment_code}</td>
                                <td>{apt.full_name}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{apt.email}</td>
                                <td style={{ color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{apt.phone || "N/A"}</td>
                                <td>
                                    <span className={badgeClass(apt.appointment_type)}>
                                        {apt.appointment_type}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{apt.appointment_date}</td>
                                <td>{apt.appointment_time}</td>
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