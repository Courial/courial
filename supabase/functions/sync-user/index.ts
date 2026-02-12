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
    const { name, email, phone, auth_id } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Missing required field: phone" }),
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

    // Sync user to Couriol backend
    const courialUrl = "https://gocourial.com/userApis/register_user";

    const courialRes = await fetch(courialUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "security_key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      },
      body: new URLSearchParams({
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(phone ? { phone } : {}),
        ...(auth_id ? { auth_id } : {}),
      }).toString(),
    });

    const courialData = await courialRes.json();
    console.log("[sync-user] Couriol response:", JSON.stringify(courialData));

    return new Response(
      JSON.stringify({ success: courialRes.ok, data: courialData }),
      {
        status: courialRes.ok ? 200 : courialRes.status,
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
