import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";

// ── Generic auth guard ─────────────────────────────────────────────────────
// Redirects unauthenticated users to /sign-in, preserving the intended URL.
export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;
    if (!user) return <Navigate to="/sign-in" state={{ from: location }} replace />;
    return children;
}

// ── Admin-only guard ───────────────────────────────────────────────────────
// Checks the `role` field on the profiles table.
// Non-admin logged-in users are redirected to "/" instead of the admin page.
export function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    const { isAdmin, roleLoading } = useIsAdmin(user);

    if (loading || roleLoading) return null;
    if (!user) return <Navigate to="/sign-in" state={{ from: location }} replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}
