import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURIAL_BASE = "https://gocourial.com/userApis";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      social_id,
      email,
      first_name,
      last_name,
      provider,
      device_token,
    } = await req.json();

    if (!social_id || !provider) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: social_id, provider" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("COURIAL_API_SECURITY_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API security key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Courial API expects "type" and "socialId" (camelCase)
    const params: Record<string, string> = {
      type: provider,
      socialId: social_id,
    };
    if (email) params.email = email;
    if (first_name) params.first_name = first_name;
    if (last_name) params.last_name = last_name;
    if (device_token) params.device_token = device_token;

    console.log("[social-login] Calling social_Login_v2 for provider:", provider);
    const res = await fetch(`${COURIAL_BASE}/social_Login_v2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "security_key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      },
      body: new URLSearchParams(params).toString(),
    });
    const data = await res.json();
    console.log("[social-login] Response:", JSON.stringify(data));

    return new Response(
      JSON.stringify({ success: res.ok, data }),
      {
        status: res.ok ? 200 : res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[social-login] error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
