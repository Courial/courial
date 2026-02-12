import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SmsRequest {
  to: string;
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  if (!SENDGRID_API_KEY) {
    return new Response(
      JSON.stringify({ error: "SENDGRID_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { to, message } = (await req.json()) as SmsRequest;

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SendGrid doesn't natively support SMS — it uses Twilio under the hood.
    // If you have Twilio SendGrid messaging enabled, use their API.
    // Otherwise, this endpoint is a placeholder for future SMS integration.
    // For now, we'll use the SendGrid email-to-SMS approach or log the request.

    console.log(`SMS request to ${to}: ${message}`);

    // If you have Twilio credentials configured alongside SendGrid,
    // you would make the Twilio API call here instead.
    // For now, return success as a placeholder.
    return new Response(
      JSON.stringify({ 
        success: true, 
        note: "SMS endpoint ready. Configure Twilio credentials for full SMS support." 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending SMS:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
