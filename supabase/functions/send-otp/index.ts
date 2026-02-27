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
    const { country_code, phone, type } = await req.json();

    if (!country_code || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: country_code, phone" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("COURIAL_API_SECURITY_KEY") || Deno.env.get("COURIAL_SMS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a simple device ID for web clients
    const deviceID = crypto.randomUUID();

    const courialUrl = "https://gocourial.com/userApis/send_login_otp";

    // Normalize country_code: strip leading "+" since the API may expect just digits
    const normalizedCC = String(country_code).replace(/^\+/, "").trim();

    const rawPhone = String(phone).replace(/\D/g, "").replace(/^0+/, ""); // strip non-digits and leading zeros

    // Format phone to match Courial API expectations
    // Thai (9 digits): (98) (121)-(2106)
    // US  (10 digits): (213) 284-5742
    const formatPhone = (digits: string): string => {
      if (digits.length === 10) {
        // US format: (XXX) XXX-XXXX
        return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      } else if (digits.length === 9) {
        // Thai format: (XX) (XXX)-(XXXX)
        return `(${digits.slice(0,2)}) (${digits.slice(2,5)})-(${digits.slice(5)})`;
      }
      // Fallback: return raw digits
      return digits;
    };

    const formattedPhone = formatPhone(rawPhone);
    // Build candidates: formatted first, then raw digits, then with leading 0
    const phoneCandidates = Array.from(new Set([
      formattedPhone,
      rawPhone,
      `0${rawPhone}`,
    ])).filter(Boolean);

    const requestedType = type === "1" ? "1" : "0";
    const typeCandidates = requestedType === "0" ? ["0", "1"] : ["1", "0"];

    // Also try country_code both with and without "+"
    const ccCandidates = Array.from(new Set([normalizedCC, `+${normalizedCC}`]));

    let lastData: any = { success: 0, code: 400, msg: "OTP request failed" };
    let lastStatus = 400;

    for (const typeValue of typeCandidates) {
      for (const cc of ccCandidates) {
        for (const candidatePhone of phoneCandidates) {
          console.log(`[send-otp] Trying type=${typeValue} cc=${cc} phone=${candidatePhone}`);

          const courialRes = await fetch(courialUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "security_key": apiKey,
              "Authorization": `Bearer ${apiKey}`,
            },
            body: new URLSearchParams({
              type: typeValue,
              deviceID,
              country_code: cc,
              phone: candidatePhone,
            }).toString(),
          });

          let courialData: any = {};
          try {
            courialData = await courialRes.json();
          } catch {
            courialData = { success: 0, code: courialRes.status, msg: "Invalid Courial response" };
          }

          console.log(`[send-otp] Response: status=${courialRes.status} success=${courialData.success} msg=${courialData.msg}`);

          const isSuccess = courialRes.ok && courialData.success !== 0 && courialData.success !== false;
          if (isSuccess) {
            return new Response(
              JSON.stringify({ ...courialData, deviceID, type: typeValue, phone: candidatePhone, country_code: cc }),
              {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          lastData = courialData;
          lastStatus = courialData.code || courialRes.status || 400;
        }
      }
    }

    return new Response(
      JSON.stringify({ ...lastData, deviceID }),
      {
        status: lastStatus,
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
