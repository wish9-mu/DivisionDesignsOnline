import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './AdminPage.css'; // Now acts as an entry point for AdminShared.css

// Child Components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCustomOrders from '../components/admin/AdminCustomOrders';
import AdminAppointments from '../components/admin/AdminAppointments';

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
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                navItems={NAV_ITEMS}
            />

            <div className="admin__main">
                <AdminTopbar
                    activeTab={activeTab}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    navItems={NAV_ITEMS}
                />

                <div className="admin__content">
                    {activeTab === 'dashboard' && (
                        <AdminDashboard
                            products={products}
                            orders={orders}
                            totalRevenue={totalRevenue}
                            pendingCustom={pendingCustom}
                            upcomingAppointments={upcomingAppointments}
                            badgeClass={badgeClass}
                        />
                    )}

                    {activeTab === 'products' && (
                        <AdminProducts
                            products={products}
                            setProducts={setProducts}
                            isSupabaseConnected={isSupabaseConnected}
                            badgeClass={badgeClass}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <AdminOrders
                            orders={orders}
                            updateOrderStatus={updateOrderStatus}
                            ORDER_STATUSES={ORDER_STATUSES}
                            badgeClass={badgeClass}
                        />
                    )}

                    {activeTab === 'custom' && (
                        <AdminCustomOrders
                            customOrders={customOrders}
                            updateCustomStatus={updateCustomStatus}
                            CUSTOM_STATUSES={CUSTOM_STATUSES}
                            badgeClass={badgeClass}
                        />
                    )}

                    {activeTab === 'appointments' && (
                        <AdminAppointments
                            appointments={appointments}
                            updateAppointmentStatus={updateAppointmentStatus}
                            APPOINTMENT_STATUSES={APPOINTMENT_STATUSES}
                            badgeClass={badgeClass}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
