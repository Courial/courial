import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const COURIAL_BASE = "https://gocourial.com/userApis";

interface CourialUser {
  firstName: string;
  lastName: string;
  email: string;
}

interface CourialUsersResponse {
  success: number;
  code: number;
  msg: string;
  data: {
    users: CourialUser[];
    pagination: {
      totalRecords: number;
      currentPage: number;
      totalPages: number;
      limit: number;
    };
  };
}

async function fetchEndpointPage(endpoint: string, page: number, limit: number, apiKey: string): Promise<CourialUsersResponse | null> {
  const url = `${endpoint}?page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "security_key": apiKey, "Authorization": `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[email-blog-post] ${endpoint} p${page}: ${res.status} ${text}`);
      return null;
    }
    return await res.json() as CourialUsersResponse;
  } catch (e) {
    console.error(`[email-blog-post] fetch error ${endpoint} p${page}:`, e);
    return null;
  }
}

async function fetchAllCourialEmails(apiKey: string): Promise<string[]> {
  const emails = new Set<string>();
  const endpoints = [
    `${COURIAL_BASE}/get_courial_users`,
    `${COURIAL_BASE}/get_dsd_courial_users`,
  ];
  const LIMIT = 1000; // max batch size
  const CONCURRENCY = 10; // parallel pages

  for (const endpoint of endpoints) {
    // First request to get totalPages
    const first = await fetchEndpointPage(endpoint, 1, LIMIT, apiKey);
    if (!first || first.success !== 1 || !first.data?.users) continue;

    for (const u of first.data.users) {
      if (u.email?.includes("@")) emails.add(u.email.toLowerCase().trim());
    }

    const totalPages = first.data.pagination.totalPages;
    console.log(`[email-blog-post] ${endpoint}: ${first.data.pagination.totalRecords} users, ${totalPages} pages`);

    // Fetch remaining pages in parallel batches
    for (let batch = 2; batch <= totalPages; batch += CONCURRENCY) {
      const pages = Array.from({ length: Math.min(CONCURRENCY, totalPages - batch + 1) }, (_, i) => batch + i);
      const results = await Promise.all(pages.map((p) => fetchEndpointPage(endpoint, p, LIMIT, apiKey)));
      for (const r of results) {
        if (r?.success === 1 && r.data?.users) {
          for (const u of r.data.users) {
            if (u.email?.includes("@")) emails.add(u.email.toLowerCase().trim());
          }
        }
      }
    }
  }

  return Array.from(emails);
}

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
      // Fetch from Courial Production API
      const apiKey = Deno.env.get("COURIAL_API_SECURITY_KEY");
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "COURIAL_API_SECURITY_KEY not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      recipientEmails = await fetchAllCourialEmails(apiKey);
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
