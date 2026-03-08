// src/pages/SignUpPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import logo from "../assets/DD LOGO.png";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import gsap from "gsap";

const SignUpPage = () => {
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [duplicateMessage, setDuplicateMessage] = useState("");
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const brandRef = useRef(null);
  const formRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Logo entrance
      gsap.fromTo(logoRef.current,
        { scale: 0.5, rotation: 15, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.5)" }
      );

      // Stagger brand texts
      if (brandRef.current) {
        gsap.fromTo(brandRef.current.children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 }
        );
      }

      // Stagger form elements
      if (formRef.current) {
        gsap.fromTo(formRef.current.children,
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.4 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name } = e.target;
    if (name === "username") setUsernameTaken(false);
    if (name === "email") setEmailTaken(false);
    setForm((f) => ({ ...f, [name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDuplicateMessage("");
    setUsernameTaken(false);
    setEmailTaken(false);

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    // 0) Check username uniqueness in profiles (case-insensitive)
    const usernameToCheck = form.username.trim();
    const { data: existingUsername, error: usernameCheckError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", usernameToCheck)
      .limit(1);

    if (usernameCheckError) {
      setError(usernameCheckError.message);
      setLoading(false);
      return;
    }

    if (existingUsername && existingUsername.length > 0) {
      setUsernameTaken(true);
      setLoading(false);
      return;
    }

    // 1) Create auth user + store metadata
    const { data, error } = await signUp(form.email, form.password, {
      username: form.username,
      first_name: form.firstName,
      last_name: form.lastName,
      full_name: fullName,
    });

    if (error) {
      const msg = error.message || "";
      const lower = msg.toLowerCase();
      if (lower.includes("already") || lower.includes("registered") || lower.includes("duplicate") || lower.includes("taken")) {
        setEmailTaken(true);
      } else {
        setError(msg);
      }
      setLoading(false);
      return;
    }

    // 2) Upsert into profiles (so Profile page has data immediately)
    const userId = data?.user?.id;

    if (userId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
          id: userId,
          username: form.username,
            first_name: form.firstName,
            last_name: form.lastName,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    // If email confirmation is ON, user may not be verified yet.
    navigate("/profile");
  };

  const passwordsMatch = form.password === form.confirm || form.confirm === "";

  return (
    <div className="auth-split">
      {/* Left: brand panel */}
      <div className="auth-brand">
        <div className="auth-brand__inner" ref={brandRef}>
          <Link to="/" className="auth-brand__logo-wrap">
            <img src={logo} alt="Division Designs" className="auth-brand__logo" ref={logoRef} />
          </Link>
          <h2 className="auth-brand__headline">
            Join the
            <br />
            Vision.
          </h2>
          <p className="auth-brand__body">
            Create your account to place custom orders, track deliveries, and get member-exclusive offers.
          </p>
          <div className="auth-brand__switch">
            <span>Already have an account?</span>
            <Link to="/sign-in" className="auth-brand__switch-link">
              Sign in →
            </Link>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner" ref={formRef}>
          <h1 className="auth-form-panel__title">Sign Up</h1>

          {error && <div className="auth-form__error-banner">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="juandc"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
              {usernameTaken && (
                <span className="auth-form__error">Username is already taken</span>
              )}
            </div>

            <div className="auth-form__group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Juan"
                value={form.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="auth-form__group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Dela Cruz"
                value={form.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="auth-form__group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="juan@email.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
              {emailTaken && (
                <span className="auth-form__error">Email is already taken</span>
              )}
            </div>

            <div className="auth-form__group">
              <label htmlFor="password">Password</label>
              <div className="auth-form__pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-form__eye"
                  onClick={() => setShowPass(v => !v)}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="auth-form__group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                name="confirm"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={!passwordsMatch ? 'auth-form__input--error' : ''}
              />
              {!passwordsMatch && (
                <span className="auth-form__error">Passwords do not match</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-form__submit"
              disabled={!passwordsMatch || loading}
            >
              {loading ? 'Creating…' : 'Create Account'}
            </button>
            {duplicateMessage && (
              <div className="auth-form__error-banner" style={{ marginTop: 12 }}>
                {duplicateMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;