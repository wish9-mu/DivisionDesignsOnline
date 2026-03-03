import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './AdminPage.css';

// ── Mock Data (fallback if Supabase is not set up) ───────────
const initialProducts = [
    { id: 'p1', type: 'Standard Lanyards', name: 'Classic Black Lanyard', price: 120, tag: 'Bestseller', stock: 84 },
    { id: 'p2', type: 'Standard Lanyards', name: 'Woven Red Lanyard', price: 150, tag: 'New', stock: 56 },
    { id: 'p3', type: 'Standard Lanyards', name: 'Reversible Reds', price: 210, tag: 'Featured', stock: 32 },
    { id: 'p4', type: 'Custom Lanyards', name: 'Full-Color Print Lanyard', price: 280, tag: 'Custom', stock: 0 },
    { id: 'p5', type: 'Custom Lanyards', name: 'Embroidered Logo Lanyard', price: 320, tag: 'Custom', stock: 0 },
    { id: 'p6', type: 'Custom Lanyards', name: 'Dye-Sublimation Lanyard', price: 350, tag: 'Premium', stock: 18 },
];

const initialOrders = [
    { id: 'ORD-2024-001', customer: 'Maria Santos', email: 'maria@email.com', items: 'Reversible Reds ×2', total: 420, status: 'Delivered', date: '2024-12-15' },
    { id: 'ORD-2024-002', customer: 'Jose Garcia', email: 'jose@email.com', items: 'Classic Black Lanyard ×5', total: 600, status: 'Shipped', date: '2024-12-18' },
    { id: 'ORD-2024-003', customer: 'Ana Reyes', email: 'ana@mail.com', items: 'Woven Red Lanyard ×3', total: 450, status: 'Processing', date: '2024-12-20' },
    { id: 'ORD-2024-004', customer: 'Carlos Cruz', email: 'carlos@mail.com', items: 'Dye-Sublimation ×10', total: 3500, status: 'Pending', date: '2024-12-22' },
    { id: 'ORD-2024-005', customer: 'Rica Lim', email: 'rica@mail.com', items: 'Embroidered Logo ×8', total: 2560, status: 'Processing', date: '2024-12-23' },
];

const initialCustomOrders = [
    { id: 'DD-2024-0012', org: 'Mapua University', email: 'org@mapua.edu', qty: 200, material: 'Polyester', size: '3/4 inch', print: 'Back to Back', status: 'In Progress', date: '2024-12-10' },
    { id: 'DD-2024-0013', org: 'DLSU Student Council', email: 'sc@dlsu.edu', qty: 150, material: 'Polycotton', size: '1 inch', print: 'One Side', status: 'Pending Review', date: '2024-12-19' },
    { id: 'DD-2024-0014', org: 'UST Engineering', email: 'eng@ust.edu', qty: 100, material: 'Polyester', size: '1/2 inch', print: 'Back to Back', status: 'Completed', date: '2024-12-05' },
    { id: 'DD-2024-0015', org: 'Ateneo LS Batch 2025', email: 'batch25@ateneo.edu', qty: 350, material: 'Polycotton', size: '1 inch', print: 'Back to Back', status: 'Pending Review', date: '2024-12-21' },
];

const initialAppointments = [
    { id: 'APT-001', customer: 'Maria Santos', email: 'maria@email.com', phone: '+63 917 123 4567', type: 'Design Consultation', date: '2024-12-28', time: '10:00 AM', notes: 'Custom lanyard design for school event', status: 'Confirmed' },
    { id: 'APT-002', customer: 'Jose Garcia', email: 'jose@email.com', phone: '+63 918 234 5678', type: 'Order Pickup', date: '2024-12-29', time: '2:00 PM', notes: 'Picking up ORD-2024-002', status: 'Scheduled' },
    { id: 'APT-003', customer: 'DLSU Student Council', email: 'sc@dlsu.edu', phone: '+63 919 345 6789', type: 'Design Consultation', date: '2024-12-30', time: '11:00 AM', notes: 'Bulk order discussion for org lanyards', status: 'Scheduled' },
    { id: 'APT-004', customer: 'Ana Reyes', email: 'ana@mail.com', phone: '+63 920 456 7890', type: 'Sample Review', date: '2024-12-26', time: '3:30 PM', notes: 'Reviewing sample prints before final order', status: 'Completed' },
    { id: 'APT-005', customer: 'Ateneo LS Batch 2025', email: 'batch25@ateneo.edu', phone: '+63 921 567 8901', type: 'Design Consultation', date: '2025-01-03', time: '9:00 AM', notes: 'Graduation lanyard design brainstorming', status: 'Scheduled' },
];

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const CUSTOM_STATUSES = ['Pending Review', 'In Progress', 'Completed'];
const APPOINTMENT_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

const emptyProduct = { name: '', type: 'Standard Lanyards', price: '', tag: 'New', stock: '' };

const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'custom', label: 'Custom Orders' },
    { key: 'appointments', label: 'Appointments' },
];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState(initialProducts);
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [formData, setFormData] = useState(emptyProduct);
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
    const [orders, setOrders] = useState(initialOrders);
    const [customOrders, setCustomOrders] = useState(initialCustomOrders);
    const [appointments, setAppointments] = useState(initialAppointments);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) {
                console.log('Using local products (Supabase not connected or table not set up)');
                setIsSupabaseConnected(false);
            } else if (data && data.length > 0) {
                setProducts(data);
                setIsSupabaseConnected(true);
                console.log('Products loaded from Supabase:', data.length, 'items');
            }
        };
        
        fetchProducts();
    }, []);

    const openAddModal = () => {
        setEditProduct(null);
        setFormData(emptyProduct);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditProduct(product);
        setFormData({ name: product.name, type: product.type, price: product.price, tag: product.tag, stock: product.stock });
        setShowModal(true);
    };

    const handleSaveProduct = async () => {
        if (!formData.name || !formData.price) return;
        
        const productData = {
            name: formData.name,
            type: formData.type,
            price: Number(formData.price),
            tag: formData.tag,
            stock: Number(formData.stock) || 0
        };
        
        if (editProduct) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editProduct.id);
            
            if (!error) {
                setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...productData } : p));
            }
        } else {
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();
            
            if (!error && data) {
                setProducts(prev => [...prev, data[0]]);
            }
        }
        setShowModal(false);
    };

    const handleDeleteProduct = async (id) => {
        await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateOrderStatus = (id, status) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const updateCustomStatus = (id, status) => {
        setCustomOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const updateAppointmentStatus = (id, status) => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    };

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const pendingCustom = customOrders.filter(o => o.status === 'Pending Review').length;
    const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length;

    const badgeClass = (status) => {
        const map = {
            'Pending': 'pending', 'Processing': 'processing', 'Shipped': 'shipped', 'Delivered': 'delivered',
            'Pending Review': 'review', 'In Progress': 'in-progress', 'Completed': 'completed',
            'Scheduled': 'scheduled', 'Confirmed': 'confirmed', 'Cancelled': 'cancelled',
            'Bestseller': 'bestseller', 'New': 'new', 'Featured': 'featured', 'Custom': 'custom', 'Premium': 'premium',
        };
        return `admin__badge admin__badge--${map[status] || 'pending'}`;
    };

    return (
        <div className="admin">
            <aside className={`admin__sidebar${sidebarOpen ? ' admin__sidebar--open' : ''}`}>
                <div className="admin__sidebar-brand">
                    <div className="admin__sidebar-logo">DD</div>
                    <div className="admin__sidebar-title">
                        <span>Division Designs</span>
                        <span>Admin Panel</span>
                    </div>
                </div>
                <nav className="admin__sidebar-nav">
                    <p className="admin__sidebar-label">Management</p>
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            className={`admin__nav-item${activeTab === item.key ? ' admin__nav-item--active' : ''}`}
                            onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="admin__sidebar-footer">
                    <Link to="/" className="admin__back-link">← Back to Store</Link>
                </div>
            </aside>

            <div className="admin__main">
                <header className="admin__topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button className="admin__hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                        <div className="admin__topbar-left">
                            <h1>{NAV_ITEMS.find(i => i.key === activeTab)?.label}</h1>
                            <p>Manage your Division Designs store</p>
                        </div>
                    </div>
                    <div className="admin__topbar-right">
                        <span className="admin__topbar-badge">● Admin</span>
                    </div>
                </header>

                <div className="admin__content">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="admin__stats">
                                <div className="admin__stat-card">
                                    <div className="admin__stat-value">{products.length}</div>
                                    <div className="admin__stat-label">Total Products</div>
                                </div>
                                <div className="admin__stat-card">
                                    <div className="admin__stat-value">{orders.length}</div>
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
                    )}

                    {activeTab === 'products' && (
                        <>
                            <div className="admin__section-header">
                                <h2 className="admin__section-title">All Products ({products.length})</h2>
                                <button className="admin__add-btn" onClick={openAddModal}>+ Add Product</button>
                            </div>
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: isSupabaseConnected ? '#d4edda' : '#fff3cd', borderRadius: '4px', fontSize: '0.875rem', border: '1px solid' + (isSupabaseConnected ? '#c3e6cb' : '#ffeeba') }}>
                                {isSupabaseConnected ? '✅ Connected to Supabase - Products are loaded from database' : '⚠️ Using local data - Supabase not connected or table not set up'}
                            </div>
                            <div className="admin__table-wrap">
                                <table className="admin__table">
                                    <thead>
                                        <tr>
                                            <th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th>Tag</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div className="admin__table-product">
                                                        <div className="admin__table-thumb" />
                                                        <span className="admin__table-name">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td>{product.type}</td>
                                                <td style={{ fontWeight: 700 }}>₱{product.price.toFixed(2)}</td>
                                                <td>{product.stock > 0 ? product.stock : <span style={{ color: 'rgba(0,0,0,0.3)' }}>Made to order</span>}</td>
                                                <td><span className={badgeClass(product.tag)}>{product.tag}</span></td>
                                                <td>
                                                    <div className="admin__actions">
                                                        <button className="admin__action-btn" onClick={() => openEditModal(product)}>Edit</button>
                                                        <button className="admin__action-btn admin__action-btn--danger" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'orders' && (
                        <>
                            <div className="admin__section-header">
                                <h2 className="admin__section-title">All Orders ({orders.length})</h2>
                            </div>
                            <div className="admin__table-wrap">
                                <table className="admin__table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th><th>Customer</th><th>Email</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td style={{ fontWeight: 600 }}>{order.id}</td>
                                                <td>{order.customer}</td>
                                                <td style={{ color: 'rgba(0,0,0,0.5)' }}>{order.email}</td>
                                                <td>{order.items}</td>
                                                <td style={{ fontWeight: 700 }}>₱{order.total.toLocaleString()}</td>
                                                <td>
                                                    <select className="admin__status-select" value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value)}>
                                                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </td>
                                                <td style={{ color: 'rgba(0,0,0,0.45)' }}>{order.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {activeTab === 'custom' && (
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
                    )}

                    {activeTab === 'appointments' && (
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
                                                <td style={{ fontWeight: 600 }}>{apt.id}</td>
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
                    )}
                </div>
            </div>

            {showModal && (
                <div className="admin__modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin__modal" onClick={e => e.stopPropagation()}>
                        <div className="admin__modal-header">
                            <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <button className="admin__modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="admin__modal-body">
                            <div className="admin__form-group">
                                <label>Product Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Classic Black Lanyard" />
                            </div>
                            <div className="admin__form-row">
                                <div className="admin__form-group">
                                    <label>Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                        <option>Standard Lanyards</option>
                                        <option>Custom Lanyards</option>
                                    </select>
                                </div>
                                <div className="admin__form-group">
                                    <label>Tag</label>
                                    <select value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })}>
                                        <option>Bestseller</option>
                                        <option>New</option>
                                        <option>Featured</option>
                                        <option>Custom</option>
                                        <option>Premium</option>
                                    </select>
                                </div>
                            </div>
                            <div className="admin__form-row">
                                <div className="admin__form-group">
                                    <label>Price (₱)</label>
                                    <input type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 120" />
                                </div>
                                <div className="admin__form-group">
                                    <label>Stock</label>
                                    <input type="number" min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} placeholder="0 = made to order" />
                                </div>
                            </div>
                        </div>
                        <div className="admin__modal-footer">
                            <button className="admin__modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="admin__modal-save" onClick={handleSaveProduct}>{editProduct ? 'Save Changes' : 'Add Product'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
