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
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "security_key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      },
      body: new URLSearchParams({
        type: "0",
        otp,
        country_code,
        phone,
        ...(deviceId ? { deviceId } : {}),
      }).toString(),
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
    // Deterministic password derived from phone + secret
    const userPassword = `courial_phone_${fullPhone}_${serviceRoleKey.slice(0, 8)}`;

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === pseudoEmail || u.phone === fullPhone
    );

    if (!existingUser) {
      // Create new user with password
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: pseudoEmail,
        password: userPassword,
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
    } else {
      // Ensure password is set for existing user via REST API
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${existingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ password: userPassword }),
      });
    }

    // Sign in to get session tokens
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const signInRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
      },
      body: JSON.stringify({ email: pseudoEmail, password: userPassword }),
    });

    const signInData = await signInRes.json();

    if (!signInRes.ok) {
      console.error("Sign in error:", signInData);
      return new Response(
        JSON.stringify({ error: "Failed to establish session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: signInData.access_token,
        refresh_token: signInData.refresh_token,
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
