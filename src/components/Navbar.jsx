import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";
import logo from "../assets/DD LOGO.png";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { count, setOpen } = useCart();
  const navigate = useNavigate();

  const { user, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // close dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // load role when user changes
  useEffect(() => {
    let alive = true;

    const loadRole = async () => {
      if (!user) {
        if (alive) setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (!alive) return;
        if (error) {
          console.error("role fetch error:", error.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === "admin");
        }
      } catch (e) {
        console.error("role fetch failed:", e?.message || e);
        if (alive) setIsAdmin(false);
      }
    };

    loadRole();

    return () => {
      alive = false;
    };
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out failed", e);
    }
    setMenuOpen(false);
    navigate("/");
  };

  const authReady = !authLoading;

  return (
    <nav className={`navbar${scrolled || !isHome ? " scrolled" : ""}`}>
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="Division Designs Logo" className="navbar-logo" />
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/products">Products</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/custom-orders">Custom Orders</Link>
        </li>
        {authReady && isAdmin && (
          <li>
            <Link to="/admin">Admin</Link>
          </li>
        )}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </form>

        <button
          className="navbar-cart-btn"
          onClick={() => setOpen(true)}
          aria-label="Open cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && <span className="navbar-cart-badge">{count}</span>}
        </button>

        {/* Profile dropdown */}
        <div className="profile-menu" ref={menuRef}>
          <button
            type="button"
            className="profile-circle"
            aria-label={
              authReady ? (user ? "Account menu" : "Sign In") : "Loading"
            }
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div className="profile-dropdown">
              {!authReady ? (
                <div className="profile-dropdown__item">Loading...</div>
              ) : !user ? (
                <button
                  type="button"
                  className="profile-dropdown__item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/sign-in");
                  }}
                >
                  Sign In
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="profile-dropdown__item"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="profile-dropdown__item"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;