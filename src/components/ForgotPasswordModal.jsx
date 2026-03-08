import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const ForgotPasswordModal = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    <div style={overlayStyle} role="dialog" aria-modal="true">
      <div style={modalStyle}>
        <h3 style={{ marginTop: 0 }}>Reset password</h3>
        <p style={{ marginTop: 0, marginBottom: 12 }}>Enter your email to receive a password reset link.</p>

        {error && <div style={bannerErrorStyle}>{error}</div>}
        {message && <div style={bannerSuccessStyle}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@domain.com"
            style={inputStyle}
            required
          />

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
            <button type="button" onClick={onClose} style={secondaryBtnStyle}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1200,
};

const modalStyle = {
  width: 420,
  maxWidth: "94%",
  background: "#fff",
  borderRadius: 8,
  padding: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  color: "#000",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  boxSizing: "border-box",
};

const primaryBtnStyle = {
  background: "#8f1414",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "transparent",
  color: "#333",
  border: "1px solid #ccc",
  padding: "10px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const bannerErrorStyle = {
  background: "#ffecec",
  color: "#a33",
  padding: "8px 10px",
  borderRadius: 6,
  marginBottom: 8,
};

const bannerSuccessStyle = {
  background: "#e6ffef",
  color: "#176f3e",
  padding: "8px 10px",
  borderRadius: 6,
  marginBottom: 8,
};

export default ForgotPasswordModal;