import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { postId, emails, dryRun } = await req.json();

    if (!postId) {
      return new Response(JSON.stringify({ error: "postId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the blog post
    const { data: post, error: postError } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, featured_image_url")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine recipients
    let recipientEmails: string[] = [];

    if (emails && Array.isArray(emails) && emails.length > 0) {
      recipientEmails = emails;
    } else {
      // Get all auth users via admin API
      const { data: { users: allUsers }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (usersError) throw usersError;
      recipientEmails = allUsers
        .filter((u) => u.email)
        .map((u) => u.email!);
    }

    console.log(`[email-blog-post] Post: "${post.title}" | Recipients: ${recipientEmails.length} | Dry run: ${!!dryRun}`);

    if (dryRun) {
      return new Response(JSON.stringify({
        ok: true,
        dryRun: true,
        recipientCount: recipientEmails.length,
        post: { id: post.id, title: post.title },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Implement actual email sending via SendGrid here
    // For now, return as if dry run
    return new Response(JSON.stringify({
      ok: true,
      sent: 0,
      recipientCount: recipientEmails.length,
      message: "Email sending not yet implemented",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("email-blog-post error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
