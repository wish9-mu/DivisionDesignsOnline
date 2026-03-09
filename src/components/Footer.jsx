// Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const TiktokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);

const Footer = () => {
  return (
    <>
      {/* Pre-footer CTA */}
      <section className="pre-footer">
        <div className="pre-footer__inner">
          <h2 className="pre-footer__title">Have a project in mind?</h2>
          <p className="pre-footer__subtitle">
            Whether it's a custom order or a bulk request, we'd love to hear
            from you. Let's create something great together.
          </p>
          <Link to="/custom-orders" className="pre-footer__btn">
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="footer">
        <div className="footer__inner">
          {/* Brand col */}
          <div>
            <p className="footer__brand-name">Division Designs</p>
            <p className="footer__brand-desc">
              Custom merchandise and print solutions crafted with care — built
              for teams, events, and businesses across the Philippines.
            </p>
            <div className="footer__socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="footer__social-btn"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer__social-btn"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="footer__social-btn"
                aria-label="TikTok"
              >
                <TiktokIcon />
              </a>
            </div>
          </div>

          {/* Navigation col */}
          <div>
            <p className="footer__col-title">Navigate</p>
            <ul className="footer__col-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/order-forms">Order Forms</Link>
              </li>
              <li>
                <Link to="/custom-orders">Custom Orders</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Quick Actions col */}
          <div>
            <p className="footer__col-title">Quick Actions</p>
            <ul className="footer__col-links">
              <li>
                <Link to="/order-forms">Place an Order</Link>
              </li>
              <li>
                <Link to="/custom-orders">Request a Quote</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact col */}
          <div>
            <p className="footer__col-title">Contact</p>
            <div className="footer__contact-item">
              <span>Email</span>
              divisiondesigns@gmail.com
            </div>
            <div className="footer__contact-item">
              <span>Location</span>
              Metro Manila, Philippines
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <span className="footer__copy">
            &copy; {new Date().getFullYear()} Division Designs. All rights
            reserved.
          </span>
          <nav className="footer__links" aria-label="Footer legal links">
            <Link to="/refund-policy">Refund Policy</Link>
            <span className="footer__sep" aria-hidden="true">
              ·
            </span>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span className="footer__sep" aria-hidden="true">
              ·
            </span>
            <Link to="/terms-of-service">Terms of Service</Link>
            <span className="footer__sep" aria-hidden="true">
              ·
            </span>
            <Link to="/contact">Contact Information</Link>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default Footer;
