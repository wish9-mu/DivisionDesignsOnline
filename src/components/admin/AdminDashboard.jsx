import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area
} from 'recharts';
import './AdminDashboard.css';

/* ── Brand-aligned color palette ─────────────────────────── */
const COLORS_STATUS = ['#8E1616', '#E8C999', '#1a6b3a', '#2563eb', '#7c3aed', '#d97706'];
const COLORS_CATEGORY = ['#8E1616', '#2563eb', '#1a6b3a', '#E8C999', '#7c3aed', '#d97706', '#0891b2', '#be185d'];

/* ── Helpers ─────────────────────────────────────────────── */
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const parseToMonthKey = (dateStr) => {
    if (!dateStr || dateStr === '—') return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthKeyToLabel = (key) => {
    const [year, month] = key.split('-');
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
};

/* ── Custom Tooltip ──────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="admin__chart-tooltip">
            <p className="admin__chart-tooltip-label">{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }}>
                    {entry.name}: {prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                </p>
            ))}
        </div>
    );
};

/* ── Donut Center Label ──────────────────────────────────── */
const renderCenterLabel = (total) => ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
            <tspan x={cx} dy="-0.5em" style={{ fontSize: '1.4rem', fontWeight: 800, fill: '#1a1a2e' }}>
                {total}
            </tspan>
            <tspan x={cx} dy="1.6em" style={{ fontSize: '0.7rem', fontWeight: 600, fill: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Orders
            </tspan>
        </text>
    );
};

/* ── Main Component ──────────────────────────────────────── */
const AdminDashboard = ({ products, orders, totalRevenue, pendingCustom, upcomingAppointments, badgeClass, appointments = [], customOrders = [] }) => {

    /* 1 ▸ Revenue over time (Line Chart) */
    const revenueData = useMemo(() => {
        const map = {};
        orders.forEach(order => {
            const key = parseToMonthKey(order.date);
            if (!key) return;
            map[key] = (map[key] || 0) + (order.total || 0);
        });
        return Object.keys(map)
            .sort()
            .map(key => ({ month: monthKeyToLabel(key), revenue: map[key] }));
    }, [orders]);

    /* 2 ▸ Order status breakdown (Donut Chart) */
    const statusData = useMemo(() => {
        const map = {};
        orders.forEach(order => {
            const s = order.status || 'Unknown';
            map[s] = (map[s] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [orders]);

    /* 3 ▸ Products by category (Pie Chart) */
    const categoryData = useMemo(() => {
        const map = {};
        products.forEach(product => {
            const cat = product.type || product.category || 'Other';
            map[cat] = (map[cat] || 0) + 1;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [products]);

    /* 4 ▸ Appointments over time (Area Chart) */
    const appointmentData = useMemo(() => {
        const map = {};
        appointments.forEach(apt => {
            const key = parseToMonthKey(apt.date || apt.created_at);
            if (!key) return;
            map[key] = (map[key] || 0) + 1;
        });
        return Object.keys(map)
            .sort()
            .map(key => ({ month: monthKeyToLabel(key), count: map[key] }));
    }, [appointments]);

    const totalOrders = orders.length;

    return (
        <>
            {/* ── Stat Cards ───────────────────────────────────── */}
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

            {/* ── Charts Grid ──────────────────────────────────── */}
            <div className="admin__charts">
                {/* Chart 1 — Revenue Line Chart */}
                <div className="admin__chart-card admin__chart-card--wide">
                    <h3 className="admin__chart-title">
                        <span className="admin__chart-dot" style={{ background: '#8E1616' }} />
                        Revenue Over Time
                    </h3>
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8E1616" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#8E1616" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.5)' }} />
                                <YAxis tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.5)' }} tickFormatter={v => `₱${v.toLocaleString()}`} />
                                <Tooltip content={<CustomTooltip prefix="₱" />} />
                                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8E1616" strokeWidth={3} dot={{ fill: '#8E1616', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, fill: '#8E1616', stroke: '#fff', strokeWidth: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="admin__chart-empty">No revenue data available yet</div>
                    )}
                </div>

                {/* Chart 2 — Order Status Donut */}
                <div className="admin__chart-card">
                    <h3 className="admin__chart-title">
                        <span className="admin__chart-dot" style={{ background: '#2563eb' }} />
                        Order Status
                    </h3>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    cornerRadius={4}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'rgba(0,0,0,0.2)' }}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                {renderCenterLabel(totalOrders)({ viewBox: { cx: 0, cy: 0 } }) ? null : null}
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="admin__chart-empty">No orders yet</div>
                    )}
                </div>

                {/* Chart 3 — Products by Category Pie */}
                <div className="admin__chart-card">
                    <h3 className="admin__chart-title">
                        <span className="admin__chart-dot" style={{ background: '#1a6b3a' }} />
                        Products by Category
                    </h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, value }) => `${name} (${value})`}
                                    labelLine={{ stroke: 'rgba(0,0,0,0.2)' }}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="admin__chart-empty">No products yet</div>
                    )}
                </div>

                {/* Chart 4 — Appointments Area Chart */}
                <div className="admin__chart-card admin__chart-card--wide">
                    <h3 className="admin__chart-title">
                        <span className="admin__chart-dot" style={{ background: '#7c3aed' }} />
                        Appointments Over Time
                    </h3>
                    {appointmentData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={appointmentData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="aptGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.5)' }} />
                                <YAxis tick={{ fontSize: 12, fill: 'rgba(0,0,0,0.5)' }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="count" name="Appointments" stroke="#7c3aed" strokeWidth={3} fill="url(#aptGrad)" dot={{ fill: '#7c3aed', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#7c3aed', stroke: '#fff', strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="admin__chart-empty">No appointment data available yet</div>
                    )}
                </div>
            </div>

            {/* ── Recent Orders Table ──────────────────────────── */}
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
