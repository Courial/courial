import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
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
    const { to, subject, html, text, from, fromName } = (await req.json()) as EmailRequest;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const senderEmail = from || "support@courial.com";
    const senderName = fromName || "Courial";

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: senderEmail, name: senderName },
        subject,
        content: [
          ...(text ? [{ type: "text/plain", value: text }] : []),
          { type: "text/html", value: html },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("SendGrid error:", response.status, errorBody);
      return new Response(
        JSON.stringify({ error: `SendGrid API failed [${response.status}]: ${errorBody}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Consume response body
    await response.text();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
