import React from 'react';
import './AdminTopbar.css';

const AdminTopbar = ({ activeTab, sidebarOpen, setSidebarOpen, navItems }) => {
    return (
        <header className="admin__topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="admin__hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
                <div className="admin__topbar-left">
                    <h1>{navItems.find(i => i.key === activeTab)?.label}</h1>
                    <p>Manage your Division Designs store</p>
                </div>
            </div>
            <div className="admin__topbar-right">
                <span className="admin__topbar-badge">● Admin</span>
            </div>
        </header>
    );
};

export default AdminTopbar;
