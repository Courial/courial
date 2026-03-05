import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COURIAL_DELIVER_URL = "https://gocourial.com/userApis/deliveries/book";
const COURIAL_CONCIERGE_URL = "https://gocourial.com/userApis/concierge/book";

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
    const { pickup, dropoff, vehicleType, userId, serviceType } = payload;
    const isConciergeStyle = serviceType === "concierge" || serviceType === "valet";

    // For concierge/valet, addresses/coords are optional; for deliver they're required
    if (!isConciergeStyle) {
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
    }
    // vehicleType is required only for deliver service
    if ((!serviceType || serviceType === "deliver") && !vehicleType) {
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

    // Log the full payload for debugging
    console.log("[book-delivery] Payload sent to Courial API:", JSON.stringify(payload, null, 2));

    // Forward request to the appropriate Courial API endpoint
    const apiUrl = isConcierge ? COURIAL_CONCIERGE_URL : COURIAL_DELIVER_URL;
    const response = await fetch(apiUrl, {
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
      const errorMsg = typeof data.msg === "string" ? data.msg : data.msg?.message || "Booking failed";
      console.error("[book-delivery] Courial API error:", response.status, JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: errorMsg, details: data }),
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
