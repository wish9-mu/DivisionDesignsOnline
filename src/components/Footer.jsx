import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <span className="footer__copy">
                    &copy; {new Date().getFullYear()} Division Designs. All rights
                    reserved.
                </span>
                <nav className="footer__links" aria-label="Footer navigation">
                    <Link to="/refund-policy">Refund Policy</Link>
                    <span className="footer__sep" aria-hidden="true">·</span>
                    <Link to="/privacy-policy">Privacy Policy</Link>
                    <span className="footer__sep" aria-hidden="true">·</span>
                    <Link to="/terms-of-service">Terms of Service</Link>
                    <span className="footer__sep" aria-hidden="true">·</span>
                    <Link to="/contact">Contact Information</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;