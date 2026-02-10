import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, seoKeyword, excerpt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a Senior Content Strategist for Courial, a premium logistics platform offering white-glove delivery, chauffeur services, EV valet charging, concierge services, and business API integrations.

Write a full blog post as structured content blocks. Use this JSON format for each block:
- { "type": "paragraph", "text": "..." } — use **bold** and *italic* markdown
- { "type": "heading2", "text": "..." }
- { "type": "heading3", "text": "..." }
- { "type": "blockquote", "text": "..." }
- { "type": "list", "items": ["...", "..."] }
- { "type": "protip", "text": "..." } — a highlighted insight callout

Guidelines:
- Start with a narrative hook (no heading, just a paragraph)
- Use H2 for main sections, H3 for subsections
- Include exactly one "protip" block
- Keep paragraphs short and punchy
- Use **bold** for emphasis
- End with a conclusion paragraph
- Target 800-1200 words total
- Naturally incorporate the SEO keyword throughout`;

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
          {
            role: "user",
            content: `Write a blog post with:\nTitle: ${title}\nSEO Keyword: ${seoKeyword}\nHook/Excerpt: ${excerpt}\n\nReturn ONLY a JSON array of content blocks.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let contentText = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON array from response (might be wrapped in markdown code block)
    const jsonMatch = contentText.match(/\[[\s\S]*\]/);
    const content = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-blog-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
