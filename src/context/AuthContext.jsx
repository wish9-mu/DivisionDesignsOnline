// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const prevUserIdRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const setProfileStatus = async (userId, status) => {
      if (!userId) return;
      try {
        await supabase
          .from("profiles")
          .upsert(
            { id: userId, status, last_seen: new Date().toISOString() },
            { onConflict: "id" }
          );
      } catch (e) {
        console.error("status update failed:", e?.message || e);
      }
    };

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!alive) return;

        if (error) console.error("getSession error:", error.message);

        const u = data?.session?.user ?? null;
        setUser(u);
        prevUserIdRef.current = u?.id ?? null;

        if (u) setProfileStatus(u.id, "online"); // best-effort
      } catch (e) {
        console.error("init session failed:", e?.message || e);
      } finally {
        if (alive) setLoading(false);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;

      if (event === "SIGNED_OUT") {
        const prevId = prevUserIdRef.current;
        if (prevId) setProfileStatus(prevId, "offline"); // best-effort
        prevUserIdRef.current = null;
        setUser(null);
        return;
      }

      setUser(nextUser);
      prevUserIdRef.current = nextUser?.id ?? null;

      if (event === "SIGNED_IN" && nextUser) {
        setProfileStatus(nextUser.id, "online"); // best-effort
      }
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  // IMPORTANT: allow signup metadata for your profiles table usage
  const signUp = (email, password, data) =>
    supabase.auth.signUp({ email, password, options: { data } });

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);