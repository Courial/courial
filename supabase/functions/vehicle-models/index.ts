import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { make, evOnly } = await req.json();
    if (!make) {
      return new Response(JSON.stringify({ models: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = evOnly
      ? `List ALL electric (EV), plug-in hybrid (PHEV), and hybrid models made by "${make}" from 2000 to 2025 that require EV charging (have a charging port). Include every fully electric and plug-in hybrid model. Do NOT include standard hybrids that cannot be plugged in (like regular Toyota Prius). Return as a JSON array of model name strings. Be comprehensive.`
      : `List ALL current and recent models (2010-2025) sold by "${make}" worldwide including US, European, and Chinese markets. Include every sedan, SUV, truck, coupe, convertible, wagon, electric, hybrid, and diesel model. For BMW include 3 Series, 5 Series, 7 Series, X1, X3, X5, X7, i4, iX, M3, M5, Z4, etc. Return as a JSON array of model name strings. Be comprehensive — include at least 15 models for major brands.`;

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
            content: "You are a vehicle database. Return ONLY a JSON array of strings with no other text. No markdown, no code fences."
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_models",
              description: "Return a list of vehicle model names",
              parameters: {
                type: "object",
                properties: {
                  models: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of vehicle model names"
                  }
                },
                required: ["models"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_models" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    
    // Extract from tool call response
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ models: args.models || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try parsing content directly
    const content = data.choices?.[0]?.message?.content || "[]";
    const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const models = JSON.parse(cleaned);
    
    return new Response(JSON.stringify({ models: Array.isArray(models) ? models : [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("vehicle-models error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error", models: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
