import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import gsap from "gsap";

const ForgotPasswordModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Entrance Animation
      const tl = gsap.timeline();

      tl.fromTo(overlayRef.current,
        { autoAlpha: 0, backdropFilter: "blur(0px)" },
        { autoAlpha: 1, backdropFilter: "blur(8px)", duration: 0.4, ease: "power2.out" }
      )
        .fromTo(modalRef.current,
          { y: 50, scale: 0.9, autoAlpha: 0, rotationX: 15 },
          { y: 0, scale: 1, autoAlpha: 1, rotationX: 0, duration: 0.7, ease: "expo.out", transformPerspective: 800 },
          "-=0.2"
        );

      if (contentRef.current) {
        gsap.fromTo(contentRef.current.children,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.3 }
        );
      }
    }
  }, [open]);

  const handleClose = () => {
    // Exit Animation
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(modalRef.current, { y: 20, scale: 0.95, autoAlpha: 0, duration: 0.3, ease: "power2.in" })
      .to(overlayRef.current, { autoAlpha: 0, backdropFilter: "blur(0px)", duration: 0.3, ease: "power2.in" }, "-=0.2");
  };

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const emailToSend = email.trim();
    if (!emailToSend) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(emailToSend, {
        redirectTo: `${window.location.origin}/DivisionDesigns/reset-password`,
      });
      if (resetErr) {
        setError(resetErr.message || "Unable to send reset email");
      } else {
        setMessage("If that email exists, we've sent a password reset link.");
      }
    } catch (err) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" ref={overlayRef}>
      <div style={modalStyle} ref={modalRef}>
        <div ref={contentRef} style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <h1 className="auth-form-panel__title" style={{ marginBottom: "0.5rem" }}>Reset password</h1>
          <p className="auth-brand__body" style={{ color: "rgba(0,0,0,0.6)", marginBottom: "1.5rem" }}>
            Enter your email to receive a password reset link.
          </p>

          {error && <div className="auth-form__error-banner">{error}</div>}
          {message && <div style={bannerSuccessStyle}>{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form__group">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@domain.com"
                required
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "0.5rem" }}>
              <button type="submit" disabled={loading} className="auth-form__submit" style={{ flex: 1 }}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
              <button type="button" onClick={handleClose} className="auth-form__submit" style={{ flex: 1, background: "transparent", color: "#8E1616", border: "1.5px solid rgba(0,0,0,0.15)" }}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1200,
  visibility: "hidden", // GSAP will handle visibility
};

const modalStyle = {
  width: 420,
  maxWidth: "94%",
  background: "#ffffff",
  borderRadius: 16,
  padding: "2.5rem 2rem",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  color: "#000",
  visibility: "hidden", // GSAP will handle visibility
};

const bannerSuccessStyle = {
  background: "#edf1ea",
  color: "#384a29",
  border: "1px solid #c8d1c0",
  padding: "10px 14px",
  borderRadius: 8,
  marginBottom: "1rem",
  fontSize: "0.85rem",
  fontWeight: 600,
};

export default ForgotPasswordModal;