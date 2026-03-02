import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';
import logo from '../assets/DD LOGO.png';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();
    const isHome = pathname === '/';
    const { count, setOpen } = useCart();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    return (
        <nav className={`navbar${scrolled || !isHome ? ' scrolled' : ''}`}>
            <div className="navbar-brand">
                <Link to="/"><img src={logo} alt="Division Designs Logo" className="navbar-logo" /></Link>
            </div>

            <ul className="navbar-links">
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/custom-orders">Custom Orders</Link></li>
            </ul>

            <div className="navbar-right">
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </button>
                </form>

                {/* Cart icon */}
                <button
                    className="navbar-cart-btn"
                    onClick={() => setOpen(true)}
                    aria-label="Open cart"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    {count > 0 && <span className="navbar-cart-badge">{count}</span>}
                </button>

                <Link to="/sign-in" className="profile-circle" aria-label="Sign In" />
            </div>
        </nav>
    );
};

export default Navbar;
