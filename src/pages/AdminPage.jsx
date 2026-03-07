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

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Or Refund'];
const CUSTOM_STATUSES = ['Pending Review', 'In Progress', 'Completed'];
const APPOINTMENT_STATUSES = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'custom', label: 'Custom Orders' },
    { key: 'appointments', label: 'Appointments' },
];

const normalizeStatus = (value) =>
    (value || '')
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, ' ');

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState(initialProducts);
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

    const [orders, setOrders] = useState(initialOrders);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [customOrders, setCustomOrders] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loadingCustomOrders, setLoadingCustomOrders] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);

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

    useEffect(() => {
        const fetchOrders = async () => {
            setLoadingOrders(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                // Keep mock orders as fallback when table is not available.
                console.error('Error fetching orders:', error.message);
            } else if (data) {
                const mappedOrders = data.map((order) => ({
                    id: order.order_code || order.id,
                    orderDbId: order.id,
                    customer: order.customer_name || order.full_name || order.customer || 'N/A',
                    email: order.customer_email || order.email || 'N/A',
                    items: order.items_summary || order.items || 'Order items',
                    total: Number(order.total_amount ?? order.total ?? 0),
                    status: order.status || 'Pending',
                    date: order.order_date || (order.created_at ? new Date(order.created_at).toISOString().slice(0, 10) : ''),
                }));
                setOrders(mappedOrders);
            }
            setLoadingOrders(false);
        };

        const fetchCustomOrders = async () => {
            setLoadingCustomOrders(true);
            const { data, error } = await supabase
                .from('custom_orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching custom orders:', error.message);
            } else {
                setCustomOrders(data || []);
            }
            setLoadingCustomOrders(false);
        };

        const fetchAppointments = async () => {
            setLoadingAppointments(true);
            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: true })
                .order('appointment_time', { ascending: true });

            if (error) {
                console.error('Error fetching appointments:', error.message);
            } else {
                setAppointments(data || []);
            }
            setLoadingAppointments(false);
        };

        fetchCustomOrders();
        fetchAppointments();
        fetchOrders();

        const customOrdersChannel = supabase
            .channel('admin-custom-orders-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'custom_orders' },
                () => {
                    fetchCustomOrders();
                }
            )
            .subscribe();

        const ordersChannel = supabase
            .channel('admin-orders-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                () => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(customOrdersChannel);
            supabase.removeChannel(ordersChannel);
        };
    }, []);

    const updateOrderStatus = async (id, status) => {
        const previousOrders = orders;
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

        const targetOrder = previousOrders.find((order) => order.id === id);
        if (!targetOrder?.orderDbId) {
            return;
        }

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', targetOrder.orderDbId);

        if (error) {
            setOrders(previousOrders);
            console.error('Error updating order status:', error.message);
            alert(`Unable to update order status: ${error.message}`);
        }
    };

    const updateCustomStatus = async (id, status) => {
        const previousOrders = customOrders;
        setCustomOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

        const { error } = await supabase
            .from('custom_orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            setCustomOrders(previousOrders);
            console.error('Error updating custom order status:', error.message);
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        const previousAppointments = appointments;
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

        const { error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id);

        if (error) {
            setAppointments(previousAppointments);
            console.error('Error updating appointment status:', error.message);
        }
    };

    const totalRevenue = orders
        .filter((o) => {
            const status = normalizeStatus(o.status);
            return status === 'delivered' || status === 'completed';
        })
        .reduce((s, o) => s + Number(o.total || 0), 0);
    const pendingCustom = customOrders.filter((o) => {
        const status = normalizeStatus(o.status);
        return status === '' || status === 'pending review' || status === 'pending' || status === 'for review' || status === 'under review';
    }).length;
    const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length;

    const badgeClass = (status) => {
        const map = {
            'Pending': 'pending', 'Processing': 'processing', 'Shipped': 'shipped', 'Delivered': 'delivered',
            'Return Or Refund': 'review',
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
                            loading={loadingOrders}
                        />
                    )}

                    {activeTab === 'custom' && (
                        <AdminCustomOrders
                            customOrders={customOrders}
                            updateCustomStatus={updateCustomStatus}
                            CUSTOM_STATUSES={CUSTOM_STATUSES}
                            loading={loadingCustomOrders}
                        />
                    )}

                    {activeTab === 'appointments' && (
                        <AdminAppointments
                            appointments={appointments}
                            updateAppointmentStatus={updateAppointmentStatus}
                            APPOINTMENT_STATUSES={APPOINTMENT_STATUSES}
                            badgeClass={badgeClass}
                            loading={loadingAppointments}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
