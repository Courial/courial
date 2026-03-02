import { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { loadSavedAddressesFromDB } from "@/components/SavedAddressModal";
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

  const checkAdmin = (userId: string) => {
    // Use setTimeout(0) to avoid deadlock — never await Supabase inside onAuthStateChange
    setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } catch {
        setIsAdmin(false);
      }
    }, 0);
  };

  const syncSocialLogin = (session: any, event: string) => {
    if (event !== "SIGNED_IN") return;
    const provider = session.user?.app_metadata?.provider;
    if (provider !== "google" && provider !== "apple") return;
    const userId = session.user.id;
    const synced = sessionStorage.getItem(`couriol_social_synced_${userId}`);
    if (synced) return;
    sessionStorage.setItem(`couriol_social_synced_${userId}`, "1");
    const meta = session.user.user_metadata || {};
    fetch(`${SUPABASE_URL}/functions/v1/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({
        social_id: userId,
        provider,
        email: session.user.email || meta.email,
        first_name: meta.full_name?.split(" ")[0] || meta.name?.split(" ")[0],
        last_name: meta.full_name?.split(" ").slice(1).join(" ") || meta.name?.split(" ").slice(1).join(" "),
      }),
    })
      .then((r) => r.json())
      .then(async (d) => {
        console.log("[social-login] synced:", d);
        // Extract Courial profile data if user already exists
        const profile = d?.data?.data || d?.data || {};
        const courialPhone = profile.phone || profile.mobile || profile.phoneNumber || profile.phone_number;
        const courialAvatar = d?.data?.profileImageUrl || profile.image || profile.profileImage || profile.avatar || profile.photo || profile.picture;
        const courialToken = profile.token;
        const courialId = profile.id;
        const courialCountryCode = profile.country_code || profile.countryCode;

        if (courialToken) {
          localStorage.setItem("courial_api_token", courialToken);
        }

        // If Courial already has this user's phone, mark them as verified
        if (courialPhone) {
          const fullPhone = courialCountryCode
            ? `${courialCountryCode.startsWith("+") ? "" : "+"}${courialCountryCode}${courialPhone.replace(/\D/g, "")}`
            : courialPhone;
          const updateData: Record<string, any> = {
            phone: fullPhone,
            courial_user: true,
            courial_id: courialId,
          };
          if (courialAvatar) updateData.avatar_url = courialAvatar;
          if (profile.firstName || profile.first_name) {
            updateData.full_name = [profile.firstName || profile.first_name, profile.lastName || profile.last_name].filter(Boolean).join(" ");
          }

          await supabase.auth.updateUser({ data: updateData });
          console.log("[social-login] Updated user metadata with Courial phone:", fullPhone);
        } else if (courialAvatar) {
          // At least update avatar if available
          await supabase.auth.updateUser({ data: { avatar_url: courialAvatar, courial_id: courialId } });
        }
      })
      .catch((e) => console.error("[social-login] error:", e));
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("[useAuth] Safety timeout — forcing loading=false");
      resolve();
    }, 3000);

    // IMPORTANT: set up listener BEFORE getSession to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[useAuth] onAuthStateChange:", event, session?.user?.id);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdmin(session.user.id);
        syncSocialLogin(session, event);
        // Load saved addresses from DB into localStorage cache
        loadSavedAddressesFromDB().catch(() => {});
      } else {
        setIsAdmin(false);
      }
    });

    // Initial session load — controls the loading state
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[useAuth] getSession:", session?.user?.id, !!session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .eq("role", "admin")
            .maybeSingle();
          setIsAdmin(!!data);
        } catch {
          setIsAdmin(false);
        }
      }

      resolve();
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
