import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { country_code, phone, otp, deviceId } = await req.json();

    if (!country_code || !phone || !otp) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: country_code, phone, otp" }),
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

    // Step 1: Verify OTP with Courial API
    const courialUrl = "https://gocourial.com/userApis/verify_login_otp";

    const courialRes = await fetch(courialUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: 0,
        security_key: apiKey,
        otp,
        country_code,
        phone,
        ...(deviceId ? { deviceId } : {}),
      }),
    });

    const courialData = await courialRes.json();

    if (!courialRes.ok) {
      return new Response(
        JSON.stringify({ error: courialData.message || "OTP verification failed", courialData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Create or find Supabase user and generate a session
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Use a deterministic email based on phone for Supabase user identity
    const fullPhone = `${country_code}${phone}`;
    const pseudoEmail = `${fullPhone.replace(/\+/g, "")}@phone.courial.app`;

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === pseudoEmail || u.phone === fullPhone
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: pseudoEmail,
        phone: fullPhone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          phone: fullPhone,
          country_code,
          courial_user: true,
        },
      });
      if (createError) {
        console.error("Create user error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = newUser.user.id;
    }

    // Generate a magic link token to establish session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: pseudoEmail,
    });

    if (linkError || !linkData) {
      console.error("Generate link error:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token hash from the generated link
    const url = new URL(linkData.properties.action_link);
    const tokenHash = url.searchParams.get("token_hash") || url.hash?.replace("#", "");

    // Also extract from the hashed_token property
    const hashedToken = linkData.properties.hashed_token;

    return new Response(
      JSON.stringify({
        success: true,
        token_hash: hashedToken,
        email: pseudoEmail,
        courial_data: courialData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
