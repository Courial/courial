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
    const securityKey = Deno.env.get("COURIAL_API_SECURITY_KEY");
    if (!securityKey) {
      return new Response(
        JSON.stringify({ error: "Security key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized — missing Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "pending";
    const page = url.searchParams.get("page") || "1";

    const courialUrl = `${COURIAL_BASE}/activities?type=${encodeURIComponent(type)}&page=${encodeURIComponent(page)}`;

    const response = await fetch(courialUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "security_key": securityKey,
        "Authorization": authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[fetch-activities] Courial API error:", response.status, data);
      return new Response(
        JSON.stringify({ error: data.msg || "Failed to fetch activities", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[fetch-activities] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
