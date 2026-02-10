import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { existingTopics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a Senior Content Strategist for Courial, a premium logistics platform. Courial offers:
- Premium white-glove delivery services
- Professional chauffeur services
- EV valet charging
- Concierge / errand services
- Courial Shield (insurance/protection)
- Business API integrations for merchants

Your job is to suggest 5 compelling biweekly blog topics that would rank well in SEO and position Courial as a thought leader.

For each topic, provide:
- title: A compelling, SEO-friendly blog title
- seoKeyword: The primary keyword to target
- category: One of "Industry Insights", "Product Updates", "Guides", "Business", "Lifestyle"
- excerpt: A 1-2 sentence hook/summary
- featuredImagePrompt: A detailed image generation prompt for the featured image

Avoid topics that overlap with these existing posts: ${existingTopics || "none yet"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Suggest 5 blog topics for our next biweekly posts." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_topics",
              description: "Return 5 blog topic suggestions",
              parameters: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        seoKeyword: { type: "string" },
                        category: { type: "string" },
                        excerpt: { type: "string" },
                        featuredImagePrompt: { type: "string" },
                      },
                      required: ["title", "seoKeyword", "category", "excerpt", "featuredImagePrompt"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["topics"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_topics" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const topics = toolCall ? JSON.parse(toolCall.function.arguments) : { topics: [] };

    return new Response(JSON.stringify(topics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-blog-topics error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
