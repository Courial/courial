import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import React from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const resolved = useRef(false);

  const resolve = () => {
    if (!resolved.current) {
      resolved.current = true;
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("[useAuth] Safety timeout — forcing loading=false");
      resolve();
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] onAuthStateChange:", event, session?.user?.id);
      setUser(session?.user ?? null);
      resolve();

      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);

        // Sync social logins to Couriol on first sign-in
        if (event === "SIGNED_IN") {
          const provider = session.user.app_metadata?.provider;
          if (provider === "google" || provider === "apple") {
            const meta = session.user.user_metadata || {};
            const synced = sessionStorage.getItem(`couriol_social_synced_${session.user.id}`);
            if (!synced) {
              sessionStorage.setItem(`couriol_social_synced_${session.user.id}`, "1");
              fetch(`${SUPABASE_URL}/functions/v1/social-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
                body: JSON.stringify({
                  social_id: session.user.id,
                  provider,
                  email: session.user.email || meta.email,
                  first_name: meta.full_name?.split(" ")[0] || meta.name?.split(" ")[0],
                  last_name: meta.full_name?.split(" ").slice(1).join(" ") || meta.name?.split(" ").slice(1).join(" "),
                }),
              }).then(r => r.json()).then(d => console.log("[social-login] synced:", d)).catch(e => console.error("[social-login] error:", e));
            }
          }
        }
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[useAuth] getSession:", session?.user?.id, !!session);
      setUser(session?.user ?? null);
      resolve();

      if (session?.user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
