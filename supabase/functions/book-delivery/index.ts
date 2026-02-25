import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURIAL_API_URL = "https://gocourial.com/userApis/deliveries/book";

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

    // Extract user Bearer token from the incoming request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized — missing Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();

    // Validate required fields
    const { pickup, dropoff, vehicleType, userId } = payload;
    if (!pickup?.address || !pickup?.lat || !pickup?.lng) {
      return new Response(
        JSON.stringify({ error: "Missing pickup address or coordinates" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!dropoff?.address || !dropoff?.lat || !dropoff?.lng) {
      return new Response(
        JSON.stringify({ error: "Missing dropoff address or coordinates" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!vehicleType) {
      return new Response(
        JSON.stringify({ error: "Missing vehicleType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Forward request to Courial API
    const response = await fetch(COURIAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "security_key": securityKey,
        "Authorization": authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[book-delivery] Courial API error:", response.status, data);
      return new Response(
        JSON.stringify({ error: data.msg || "Booking failed", details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[book-delivery] Success:", data);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[book-delivery] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
