import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country_code, phone } = await req.json();

    if (!country_code || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: country_code, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("COURIAL_SMS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a simple device ID for web clients
    const deviceID = crypto.randomUUID();

    const courialUrl = `https://gocourial.com/userApis/send_login_otp?api_key=${encodeURIComponent(apiKey)}`;

    const courialRes = await fetch(courialUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: 0,
        deviceID,
        country_code,
        phone,
      }),
    });

    const courialData = await courialRes.json();

    return new Response(
      JSON.stringify({ ...courialData, deviceID }),
      {
        status: courialRes.ok ? 200 : courialRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
