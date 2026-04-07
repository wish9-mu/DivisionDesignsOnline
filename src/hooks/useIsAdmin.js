import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

/**
 * Returns whether the given user has the "admin" role.
 * @param {object|null} user - The current auth user object.
 */
export function useIsAdmin(user) {
    const [isAdmin, setIsAdmin] = useState(false);
    const [roleLoading, setRoleLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setRoleLoading(false);
            return;
        }

        supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle()
            .then(({ data }) => setIsAdmin(data?.role === "admin"))
            .catch(() => setIsAdmin(false))
            .finally(() => setRoleLoading(false));
    }, [user]);

    return { isAdmin, roleLoading };
}
