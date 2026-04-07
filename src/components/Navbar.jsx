import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Navbar.css";
import logo from "../assets/DD LOGO.png";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, LogIn } from "lucide-react";
import gsap from "gsap";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { count, setOpen } = useCart();
  const navigate = useNavigate();

  const { user, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const dropdownItemsRef = useRef([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract initials for the profile badge
  let userInitials = "DD";
  if (userName) {
    const nameParts = userName.trim().split(" ");
    if (nameParts.length >= 2) {
      userInitials = (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0]) {
      userInitials = nameParts[0].substring(0, 2).toUpperCase();
    }
  } else if (user?.email) {
    userInitials = user.email.substring(0, 2).toUpperCase();
  }

  // GSAP Animation for Dropdown
  useEffect(() => {
    let ctx;
    if (menuOpen && dropdownRef.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          dropdownRef.current,
          { opacity: 0, y: -10, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" },
        );
        if (dropdownItemsRef.current.length > 0) {
          gsap.fromTo(
            dropdownItemsRef.current,
            { opacity: 0, x: -10 },
            {
              opacity: 1,
              x: 0,
              duration: 0.2,
              stagger: 0.05,
              ease: "power2.out",
              delay: 0.1,
            },
          );
        }
      });
    }
    return () => ctx && ctx.revert();
  }, [menuOpen]);

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
          .select("role, full_name, first_name, last_name")
          .eq("id", user.id)
          .maybeSingle();

        if (!alive) return;
        if (error) {
          console.error("role/profile fetch error:", error.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === "admin");
          // Extract name (prioritize full_name, fallback to first/last)
          const fetchedName =
            data?.full_name ||
            [data?.first_name, data?.last_name].filter(Boolean).join(" ") ||
            "";
          setUserName(fetchedName);
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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        const { data, error } = await supabase
          .from("products") // Replace with your table name
          .select("*")
          .ilike("name", `%${searchQuery}%`); // Case-insensitive search

        if (error) {
          console.error("Search error:", error.message);
        } else {
          console.log("Search results:", data);
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
      setSearchOpen(false);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Close search overlay on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const handleSignOut = async () => {
    // Reverse animation before actually signing out/closing
    if (dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: async () => {
          try {
            await signOut();
          } catch (e) {
            console.error("Sign out failed", e);
          }
          setMenuOpen(false);
          navigate("/");
        },
      });
    } else {
      try {
        await signOut();
      } catch (e) {
        console.error("Sign out failed", e);
      }
      setMenuOpen(false);
      navigate("/");
    }
  };

  const handleMenuCloseNavigate = (path) => {
    if (dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setMenuOpen(false);
          navigate(path);
        },
      });
    } else {
      setMenuOpen(false);
      navigate(path);
    }
  };

  const authReady = !authLoading;

  const handleSearchInputChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const { data, error } = await supabase
          .from("products") // Replace with your table name
          .select("*")
          .ilike("name", `%${query}%`); // Case-insensitive search

        if (error) {
          console.error("Search error:", error.message);
        } else {
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    } else {
      setSearchResults([]); // Clear results if query is empty
    }
  };

  const handleResultClick = (id) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(`/products/${id}`); // Corrected route
  };
  return (
    <nav className={`navbar${scrolled || !isHome ? " scrolled" : ""}`}>
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="Division Designs Logo" className="navbar-logo" />
        </Link>
      </div>

      <div
        className={`navbar-links-container ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <ul className="navbar-links">
          <li>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/custom-orders" onClick={() => setMobileMenuOpen(false)}>
              Orders
            </Link>
          </li>
          {authReady && isAdmin && (
            <li>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>

      <div className="navbar-right">
        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>

        <button
          className="search-icon-btn"
          onClick={openSearch}
          aria-label="Open search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          >
            {authReady && user ? userInitials : ""}
          </button>
          {menuOpen && (
            <div className="profile-dropdown" ref={dropdownRef}>
              {authReady && user && (
                <div className="profile-dropdown__header">
                  <div className="profile-dropdown__avatar">{userInitials}</div>
                  <div className="profile-dropdown__user-info">
                    <span className="profile-dropdown__email">
                      {user.email}
                    </span>
                    <span className="profile-dropdown__role">
                      {isAdmin ? "Admin" : "Student"}
                    </span>
                  </div>
                </div>
              )}

              <div className="profile-dropdown__items">
                {!authReady ? (
                  <div className="profile-dropdown__item loading">
                    Loading...
                  </div>
                ) : !user ? (
                  <button
                    type="button"
                    className="profile-dropdown__item"
                    ref={(el) => (dropdownItemsRef.current[0] = el)}
                    onClick={() => handleMenuCloseNavigate("/sign-in")}
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="profile-dropdown__item"
                      ref={(el) => (dropdownItemsRef.current[0] = el)}
                      onClick={() => handleMenuCloseNavigate("/profile")}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        className="profile-dropdown__item"
                        ref={(el) => (dropdownItemsRef.current[1] = el)}
                        onClick={() => handleMenuCloseNavigate("/admin")}
                      >
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
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    <div className="profile-dropdown__divider"></div>
                    <button
                      type="button"
                      className="profile-dropdown__item signout"
                      ref={(el) =>
                        (dropdownItemsRef.current[isAdmin ? 2 : 1] = el)
                      }
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-overlay-header">
            <form className="search-overlay-form" onSubmit={handleSearch}>
              <svg
                className="search-overlay-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="search-overlay-input"
              />
            </form>
            <button
              type="button"
              className="search-overlay-cancel"
              onClick={closeSearch}
            >
              Cancel
            </button>
          </div>

          <div className="search-overlay-body">
            <div className="search-results">
              {searchResults.length > 0 &&
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="search-result-item"
                    onClick={() => handleResultClick(result.id)}
                  >
                    <p> {result.name}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
