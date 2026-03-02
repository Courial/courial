import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-courial-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURIAL_BASE = "https://gocourial.com/userApis";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { first_name, last_name, avatar_url } = await req.json();

    if (!first_name) {
      return new Response(
        JSON.stringify({ error: "first_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Get the authenticated user from the JWT
    const authHeader = req.headers.get("authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Decode the user from the access token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Update Supabase Auth user_metadata
    const fullName = last_name ? `${first_name} ${last_name}`.trim() : first_name;
    const newMeta: Record<string, any> = {
      ...user.user_metadata,
      full_name: fullName,
      first_name,
      last_name: last_name || "",
    };
    if (avatar_url) {
      newMeta.avatar_url = avatar_url;
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: newMeta,
    });
    if (updateError) {
      console.error("[update-profile] Supabase auth update failed:", updateError);
    }

    // 3. Update on Courial API via edit_profile
    const apiKey = Deno.env.get("COURIAL_API_SECURITY_KEY");
    const courialToken = req.headers.get("x-courial-token") || "";

    if (apiKey) {
      const baseHeaders: Record<string, string> = {
        "security_key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      };
      if (courialToken) {
        baseHeaders["token"] = courialToken;
      }

      console.log("[update-profile] Updating Courial profile — first_name:", first_name, "last_name:", last_name, "has_avatar:", !!avatar_url);

      try {
        // If we have an avatar URL, download the image and send as multipart form-data
        if (avatar_url) {
          const imgRes = await fetch(avatar_url);
          if (imgRes.ok) {
            const imgBlob = await imgRes.blob();
            const formData = new FormData();
            formData.append("first_name", first_name);
            if (last_name) formData.append("last_name", last_name);
            formData.append("image", imgBlob, "profile.png");

            const res = await fetch(`${COURIAL_BASE}/edit_profile`, {
              method: "POST",
              headers: baseHeaders, // No Content-Type — browser/fetch sets multipart boundary
              body: formData,
            });
            const text = await res.text();
            console.log("[update-profile] Courial multipart response:", text);
          } else {
            console.error("[update-profile] Failed to download avatar:", imgRes.status);
            // Fall back to name-only update
            const res = await fetch(`${COURIAL_BASE}/edit_profile`, {
              method: "POST",
              headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ first_name, ...(last_name ? { last_name } : {}) }).toString(),
            });
            const text = await res.text();
            console.log("[update-profile] Courial name-only response:", text);
          }
        } else {
          // Name-only update
          const res = await fetch(`${COURIAL_BASE}/edit_profile`, {
            method: "POST",
            headers: { ...baseHeaders, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ first_name, ...(last_name ? { last_name } : {}) }).toString(),
          });
          const text = await res.text();
          console.log("[update-profile] Courial name-only response:", text);
        }
      } catch (err) {
        console.error("[update-profile] Courial API error:", err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, full_name: fullName, avatar_url: avatar_url || user.user_metadata?.avatar_url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[update-profile] error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
