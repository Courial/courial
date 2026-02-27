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
    const { first_name, last_name } = await req.json();

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
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        full_name: fullName,
        first_name,
        last_name: last_name || "",
      },
    });
    if (updateError) {
      console.error("[update-profile] Supabase auth update failed:", updateError);
    }

    // 3. Update on Courial API via edit_profile
    const apiKey = Deno.env.get("COURIAL_API_SECURITY_KEY");
    const courialToken = req.headers.get("x-courial-token") || "";

    if (apiKey) {
      const courialHeaders: Record<string, string> = {
        "Content-Type": "application/x-www-form-urlencoded",
        "security_key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      };
      if (courialToken) {
        courialHeaders["token"] = courialToken;
      }

      const params: Record<string, string> = { first_name };
      if (last_name) params.last_name = last_name;

      console.log("[update-profile] Updating Courial profile:", params);
      try {
        const res = await fetch(`${COURIAL_BASE}/edit_profile`, {
          method: "POST",
          headers: courialHeaders,
          body: new URLSearchParams(params).toString(),
        });
        const data = await res.json();
        console.log("[update-profile] Courial response:", JSON.stringify(data));
      } catch (err) {
        console.error("[update-profile] Courial API error:", err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, full_name: fullName }),
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
