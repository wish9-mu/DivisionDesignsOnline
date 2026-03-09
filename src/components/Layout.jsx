import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import './Layout.css';

const Layout = ({ children, hero, preFooter, isFullWidth }) => {
    return (
        <div className="layout">
            <Navbar />
            <CartSidebar />
            {hero && <div className="hero-wrapper">{hero}</div>}
            <main className={`main-content ${isFullWidth ? 'main-content--full' : ''}`}>
                {children}
            </main>
            {preFooter}
            <Footer />
        </div>
    );
};

export default Layout;
