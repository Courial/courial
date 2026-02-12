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
      first_name,
      last_name,
      email,
      country_code,
      phone,
      auth_id,
      device_token,
      latitude,
      longitude,
      social_id,
      referral_code,
      how_heard,
    } = await req.json();

    if (!country_code || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: country_code, phone" }),
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

    const courialHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
      "security_key": apiKey,
      "Authorization": `Bearer ${apiKey}`,
    };

    // Step 1: Check if phone already exists on Couriol
    console.log("[sync-user] Checking phone:", country_code, phone);
    const checkRes = await fetch(`${COURIAL_BASE}/check_phone`, {
      method: "POST",
      headers: courialHeaders,
      body: new URLSearchParams({ country_code, phone }).toString(),
    });
    const checkData = await checkRes.json();
    console.log("[sync-user] check_phone response:", JSON.stringify(checkData));

    // If user already exists on Couriol, skip signup
    if (checkRes.ok && checkData?.data?.exists) {
      return new Response(
        JSON.stringify({ success: true, already_exists: true, data: checkData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Register new user via signup_v2
    console.log("[sync-user] Registering new user via signup_v2");
    const signupParams: Record<string, string> = {
      country_code,
      phone,
    };
    if (first_name) signupParams.first_name = first_name;
    if (last_name) signupParams.last_name = last_name;
    if (email) signupParams.email = email;
    if (auth_id) signupParams.auth_id = auth_id;
    if (device_token) signupParams.device_token = device_token;
    if (latitude) signupParams.latitude = latitude;
    if (longitude) signupParams.longitude = longitude;
    if (social_id) signupParams.social_id = social_id;
    if (referral_code) signupParams.referral_code = referral_code;
    if (how_heard) signupParams.how_heard = how_heard;

    const signupRes = await fetch(`${COURIAL_BASE}/signup_v2`, {
      method: "POST",
      headers: courialHeaders,
      body: new URLSearchParams(signupParams).toString(),
    });
    const signupData = await signupRes.json();
    console.log("[sync-user] signup_v2 response:", JSON.stringify(signupData));

    return new Response(
      JSON.stringify({ success: signupRes.ok, already_exists: false, data: signupData }),
      {
        status: signupRes.ok ? 200 : signupRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[sync-user] error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
