import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import gsap from "gsap";
import "./AuthPage.css";
import logo from "../assets/DD LOGO.png";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const brandRef = useRef(null);
  const formRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // GSAP Entry Animation
    let ctx = gsap.context(() => {
      // Logo heartbeat/entrance
      gsap.fromTo(logoRef.current,
        { scale: 0.5, rotation: -15, opacity: 0 },
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
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.4 }
        );
      }
    });

    // Supabase URL Hash parsing
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (type === "recovery" && accessToken) {
      // Set the session manually from the hash tokens
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessionErr }) => {
          if (sessionErr) {
            setError("Invalid or expired reset link. Please request a new one.");
          } else {
            setReady(true);
            window.history.replaceState(null, "", window.location.pathname);
          }
        });
    } else {
      setError("Invalid or expired reset link. Please request a new one.");
    }

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });

    if (updateErr) {
      setError(updateErr.message || "Failed to update password");
    } else {
      setMessage("Password updated! Redirecting to sign in…");
      setTimeout(() => navigate("/sign-in"), 2000);
    }
    setLoading(false);
  };

  const passwordsMatch = password === confirm || confirm === "";

  return (
    <div className="auth-split">
      {/* Left: brand panel */}
      <div className="auth-brand">
        <div className="auth-brand__inner" ref={brandRef}>
          <Link to="/" className="auth-brand__logo-wrap">
            <img src={logo} alt="Division Designs" className="auth-brand__logo" ref={logoRef} />
          </Link>
          <h2 className="auth-brand__headline">
            Secure
            <br />
            Account.
          </h2>
          <p className="auth-brand__body">
            Set a new, strong password to regain access and continue managing your account securely.
          </p>
          <div className="auth-brand__switch">
            <span>Remembered it?</span>
            <Link to="/sign-in" className="auth-brand__switch-link">
              Back to Sign In →
            </Link>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner" ref={formRef}>
          <h1 className="auth-form-panel__title">Set New Password</h1>

          {!ready && !error ? (
            <p className="auth-brand__body" style={{ color: "rgba(0,0,0,0.6)", marginBottom: "1.5rem" }}>
              Verifying reset link…
            </p>
          ) : (
            <>
              <p className="auth-brand__body" style={{ color: "rgba(0,0,0,0.6)", marginBottom: "1.5rem" }}>
                Enter and confirm your new password below.
              </p>

              {error && <div className="auth-form__error-banner">{error}</div>}
              {message && (
                <div style={{ background: "#e6ffef", color: "#176f3e", padding: "10px 14px", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem", fontWeight: 600 }}>
                  {message}
                </div>
              )}

              {ready && (
                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="auth-form__group">
                    <label htmlFor="password">New Password</label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="auth-form__group">
                    <label htmlFor="confirm">Confirm Password</label>
                    <input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className={!passwordsMatch ? 'auth-form__input--error' : ''}
                    />
                    {!passwordsMatch && (
                      <span className="auth-form__error">Passwords do not match</span>
                    )}
                  </div>

                  <button type="submit" disabled={!passwordsMatch || loading} className="auth-form__submit" style={{ marginTop: "1rem" }}>
                    {loading ? "Updating…" : "Update Password"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;