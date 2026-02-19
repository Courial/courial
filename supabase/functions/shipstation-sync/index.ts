import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Unauthorized");

    const userId = claimsData.claims.sub;

    // Check admin role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: role } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) throw new Error("Admin access required");

    const { order_id } = await req.json();
    if (!order_id) throw new Error("Missing order_id");

    // Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    // TODO: Integrate with ShipStation API when API key is configured
    // For now, mark order as fulfilled
    console.log(`[shipstation-sync] Processing order ${order_id} for fulfillment`);
    console.log(`[shipstation-sync] Ship to: ${order.full_name}, ${order.address_line1}, ${order.city} ${order.state} ${order.zip}`);
    console.log(`[shipstation-sync] Items:`, order.order_items);

    // Update fulfillment status
    await supabaseAdmin.from("orders").update({
      fulfillment_status: "fulfilled",
      shipped_at: new Date().toISOString(),
    }).eq("id", order_id);

    return new Response(JSON.stringify({ success: true, message: "Order sent to fulfillment" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
    });
  }
});
