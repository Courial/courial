import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { make, model, includeAll } = await req.json();
    if (!make || !model) {
      return new Response(JSON.stringify({ portTypes: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an EV charging expert database. Return structured data only via the tool call."
          },
          {
            role: "user",
            content: includeAll
              ? `What fuel/port type(s) does the ${make} ${model} use? Consider all model years from 2000-2025. Include all applicable types from: Gas, Diesel, Hybrid, NACS (Tesla), CCS, CHAdeMO, J1772, Type 2. For gas/diesel/hybrid vehicles, return "Gas", "Diesel", or "Hybrid" as appropriate. For EVs and PHEVs, list the charging port types. List all types that apply to this vehicle across model years.`
              : `What EV charging port type(s) does the ${make} ${model} use? Consider all model years from 2000-2025. List the charging port connector types this vehicle supports for DC fast charging and Level 2 charging. Common types include: NACS (Tesla), CCS (Combined Charging System), CHAdeMO, J1772, Type 2. Only list the port types that this specific vehicle actually uses. If a vehicle switched port types across years (e.g., Tesla switching to NACS), list all applicable types.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_port_types",
              description: "Return the EV charging port types for a vehicle",
              parameters: {
                type: "object",
                properties: {
                  portTypes: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of charging port type names (e.g. 'NACS (Tesla)', 'CCS', 'CHAdeMO', 'J1772', 'Type 2')"
                  }
                },
                required: ["portTypes"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_port_types" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ portTypes: args.portTypes || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ portTypes: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vehicle-port-types error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", portTypes: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
