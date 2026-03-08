import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts the token in the URL hash: #access_token=...&type=recovery
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
            // Clean the hash from the URL without triggering a reload
            window.history.replaceState(null, "", window.location.pathname);
          }
        });
    } else {
      setError("Invalid or expired reset link. Please request a new one.");
    }
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

  // Still setting up session
  if (!ready && !error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ color: "#555", textAlign: "center" }}>Verifying reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, color: "#000" }}>Set New Password</h2>
        <p style={{ color: "#555", marginTop: 0, marginBottom: 16 }}>
          Enter and confirm your new password below.
        </p>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={successStyle}>{message}</div>}

        {ready && (
          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              style={inputStyle}
              required
              minLength={8}
            />

            <label style={{ ...labelStyle, marginTop: 12 }}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              style={inputStyle}
              required
            />

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}

        {error && (
          <button onClick={() => navigate("/sign-in")} style={{ ...btnStyle, marginTop: 8, background: "#555" }}>
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};

const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" };
const cardStyle = { width: 420, maxWidth: "94%", background: "#fff", borderRadius: 8, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", color: "#000" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#000" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd", boxSizing: "border-box", marginBottom: 4 };
const btnStyle = { width: "100%", marginTop: 16, background: "#8f1414", color: "#fff", border: "none", padding: "11px 14px", borderRadius: 6, cursor: "pointer", fontWeight: 600 };
const errorStyle = { background: "#ffecec", color: "#a33", padding: "8px 10px", borderRadius: 6, marginBottom: 8 };
const successStyle = { background: "#e6ffef", color: "#176f3e", padding: "8px 10px", borderRadius: 6, marginBottom: 8 };

export default ResetPasswordPage;