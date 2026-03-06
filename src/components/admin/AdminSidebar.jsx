import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, navItems }) => {
    return (
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
                {navItems.map(item => (
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
    );
};

export default AdminSidebar;
