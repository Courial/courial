import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Help Scout Docs API base URL
const HELPSCOUT_API_BASE = "https://docsapi.helpscout.net/v1";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HELPSCOUT_API_KEY = Deno.env.get("HELPSCOUT_API_KEY");
    
    if (!HELPSCOUT_API_KEY) {
      console.log("HELPSCOUT_API_KEY not configured, using static FAQs");
      return new Response(
        JSON.stringify({ faqs: [], message: "Using static FAQs - Help Scout not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, query, category } = await req.json();

    switch (action) {
      case "getFaqs": {
        // Get all collections (categories)
        const collectionsResponse = await fetch(`${HELPSCOUT_API_BASE}/collections`, {
          headers: {
            Authorization: `Basic ${btoa(HELPSCOUT_API_KEY + ":")}`,
          },
        });

        if (!collectionsResponse.ok) {
          const errorText = await collectionsResponse.text();
          console.error("Help Scout API error:", collectionsResponse.status, errorText);
          return new Response(
            JSON.stringify({ faqs: [], error: "Failed to fetch from Help Scout" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const collectionsData = await collectionsResponse.json();
        const collections = collectionsData.collections?.items || [];

        // Fetch articles from each collection
        const allFaqs: FAQ[] = [];

        for (const collection of collections) {
          const articlesResponse = await fetch(
            `${HELPSCOUT_API_BASE}/collections/${collection.id}/articles`,
            {
              headers: {
                Authorization: `Basic ${btoa(HELPSCOUT_API_KEY + ":")}`,
              },
            }
          );

          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            const articles = articlesData.articles?.items || [];

            for (const article of articles) {
              // Map collection name to category
              let faqCategory = "general";
              const collectionName = collection.name?.toLowerCase() || "";
              
              if (collectionName.includes("delivery")) faqCategory = "delivery";
              else if (collectionName.includes("chauffeur") || collectionName.includes("ride")) faqCategory = "chauffeur";
              else if (collectionName.includes("payment") || collectionName.includes("billing")) faqCategory = "payments";
              else if (collectionName.includes("account")) faqCategory = "account";
              else if (collectionName.includes("safety") || collectionName.includes("security")) faqCategory = "safety";

              allFaqs.push({
                id: article.id,
                question: article.name || article.title,
                answer: article.text || article.preview || "",
                category: faqCategory,
              });
            }
          }
        }

        return new Response(
          JSON.stringify({ faqs: allFaqs }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "search": {
        if (!query) {
          return new Response(
            JSON.stringify({ results: [], error: "Query is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const searchResponse = await fetch(
          `${HELPSCOUT_API_BASE}/search?query=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Basic ${btoa(HELPSCOUT_API_KEY + ":")}`,
            },
          }
        );

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error("Help Scout search error:", searchResponse.status, errorText);
          return new Response(
            JSON.stringify({ results: [], error: "Search failed" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const searchData = await searchResponse.json();
        const results = (searchData.articles?.items || []).map((article: any) => ({
          id: article.id,
          question: article.name || article.title,
          answer: article.preview || article.text || "",
          category: "general",
          url: article.url,
        }));

        return new Response(
          JSON.stringify({ results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "getArticle": {
        const { articleId } = await req.json();
        
        if (!articleId) {
          return new Response(
            JSON.stringify({ error: "Article ID is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const articleResponse = await fetch(`${HELPSCOUT_API_BASE}/articles/${articleId}`, {
          headers: {
            Authorization: `Basic ${btoa(HELPSCOUT_API_KEY + ":")}`,
          },
        });

        if (!articleResponse.ok) {
          const errorText = await articleResponse.text();
          console.error("Help Scout article error:", articleResponse.status, errorText);
          return new Response(
            JSON.stringify({ error: "Failed to fetch article" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const articleData = await articleResponse.json();

        return new Response(
          JSON.stringify({ article: articleData.article }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: unknown) {
    console.error("Error in helpscout function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
