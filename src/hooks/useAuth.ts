import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
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
    // Safety timeout — never stay on "Checking..." for more than 3s
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

  return { user, isAdmin, loading, signOut };
}
