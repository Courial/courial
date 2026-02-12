import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[useAuth] onAuthStateChange fired:", event, "user:", session?.user?.id);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false); // Unblock UI immediately

      if (currentUser) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[useAuth] getSession result:", "user:", session?.user?.id, "has session:", !!session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false); // Unblock UI immediately

      if (currentUser) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isAdmin, loading, signOut };
}
