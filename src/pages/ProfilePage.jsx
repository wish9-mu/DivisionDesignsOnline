// src/pages/ProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import "./PageStyles.css";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState("My Profile");
  const [saved, setSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  const [profile, setProfile] = useState({
    username: "",
    first_name: "",
    last_name: "",
    full_name: "",
    contact_number: "",
    organization: "",
    delivery_address: "",
  });

  const email = user?.email ?? "";
  const isVerified = !!(user?.email_confirmed_at || user?.confirmed_at);

  const memberSince = useMemo(() => {
    const created = user?.created_at ? new Date(user.created_at) : null;
    return created
      ? created.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "";
  }, [user]);

  const initials = useMemo(() => {
    const name = (profile.full_name || "").trim();
    if (name) {
      const parts = name.split(/\s+/);
      const a = parts[0]?.[0] ?? "";
      const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
      return (a + b).toUpperCase() || "DD";
    }
    return ((email?.[0] ?? "D") + "D").toUpperCase();
  }, [profile.full_name, email]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setProfileLoading(true);

      // Load profile fields from profiles table
      const { data: p, error: pErr } = await supabase
        .from("profiles")
        .select(
          "username, first_name, last_name, full_name, contact_number, organization, delivery_address"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (pErr) {
        alert(pErr.message);
      } else if (p) {
        setProfile({
          username: p.username ?? "",
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          full_name: p.full_name ?? "",
          contact_number: p.contact_number ?? "",
          organization: p.organization ?? "",
          delivery_address: p.delivery_address ?? "",
        });
      } else {
        // If no row exists (legacy users), create minimal row
        const meta = user?.user_metadata || {};
        const fullName =
          meta.full_name ||
          `${meta.first_name ?? ""} ${meta.last_name ?? ""}`.trim();

        await supabase.from("profiles").upsert(
          {
            id: user.id,
            username: meta.username ?? "",
            first_name: meta.first_name ?? "",
            last_name: meta.last_name ?? "",
            full_name: fullName ?? "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      // Total orders (only works if your custom_orders has user_id and you insert it)
      const { count } = await supabase
        .from("custom_orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (typeof count === "number") setTotalOrders(count);

      setProfileLoading(false);
    };

    load();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    const fullName = profile.full_name?.trim()
      ? profile.full_name.trim()
      : `${profile.first_name} ${profile.last_name}`.trim();

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          full_name: fullName,
          contact_number: profile.contact_number || null,
          organization: profile.organization || null,
          delivery_address: profile.delivery_address || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) return alert(error.message);

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setActiveTab("My Profile");
  };

  if (loading) return null;
  if (!user) return <Navigate to="/sign-in" replace />;

  return (
    <Layout>
      <div className="page">
        <div className="page__header">
          <p className="page__eyebrow">Account</p>
          <h1 className="page__title">Profile</h1>
          <p className="page__subtitle">Manage your account and preferences.</p>
        </div>

        {!isVerified && (
          <div className="auth-form__error-banner" style={{ marginBottom: 12 }}>
            Please verify your email to fully activate your account.
            <button
              type="button"
              className="auth-form__forgot"
              onClick={async () => {
                const { error } = await supabase.auth.resend({
                  type: "signup",
                  email: user.email,
                });
                if (error) alert(error.message);
                else alert("Verification email resent.");
              }}
              style={{ marginLeft: 12 }}
            >
              Resend email
            </button>
          </div>
        )}

        <div className="page__tabs">
          {["My Profile", "Edit Profile"].map((tab) => (
            <button
              key={tab}
              className={`page__tab${activeTab === tab ? " page__tab--active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "My Profile" && (
          <div className="profile-view">
            <div className="profile-avatar">
              <div className="profile-avatar__circle">{initials}</div>
            </div>

            <div className="profile-details">
              <div className="profile-detail-card">
                {profileLoading ? (
                  <div className="profile-row">
                    <span className="profile-label">Loading</span>
                    <span className="profile-value">...</span>
                  </div>
                ) : (
                  <>
                    <div className="profile-row">
                      <span className="profile-label">Name</span>
                      <span className="profile-value">{profile.full_name || "—"}</span>
                    </div>
                    <div className="profile-row">
                      <span className="profile-label">Email</span>
                      <span className="profile-value">{email || "—"}</span>
                    </div>
                    <div className="profile-row">
                      <span className="profile-label">Contact</span>
                      <span className="profile-value">{profile.contact_number || "—"}</span>
                    </div>
                    <div className="profile-row">
                      <span className="profile-label">Member Since</span>
                      <span className="profile-value">{memberSince || "—"}</span>
                    </div>
                    <div className="profile-row">
                      <span className="profile-label">Total Orders</span>
                      <span className="profile-value">{totalOrders}</span>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="page__cta-btn" onClick={() => setActiveTab("Edit Profile")}>
                  Edit Profile
                </button>
                <button
                  className="page__cta-btn"
                  style={{ background: '#333' }}
                  onClick={() => window.location.href = '/DivisionDesigns/purchases'}
                >
                  View Order History
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Edit Profile" && (
          <form className="custom-form" onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  value={profile.contact_number}
                  onChange={(e) => setProfile((p) => ({ ...p, contact_number: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input
                  type="text"
                  placeholder="Your school or org"
                  value={profile.organization}
                  onChange={(e) => setProfile((p) => ({ ...p, organization: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                placeholder="Street, City, Province"
                value={profile.delivery_address}
                onChange={(e) => setProfile((p) => ({ ...p, delivery_address: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="Leave blank to keep current" disabled />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat new password" disabled />
              </div>
            </div>

            <button
              type="submit"
              className={`page__cta-btn${saved ? " page__cta-btn--success" : ""}`}
            >
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;