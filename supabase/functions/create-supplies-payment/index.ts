import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user?.email) throw new Error("Not authenticated");

    const { items, shipping } = await req.json();
    if (!items?.length || !shipping) throw new Error("Missing items or shipping");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // Store shipping in metadata
    const metadata = {
      user_id: user.id,
      shipping_name: shipping.full_name,
      shipping_email: shipping.email,
      shipping_address1: shipping.address_line1,
      shipping_address2: shipping.address_line2 || "",
      shipping_city: shipping.city,
      shipping_state: shipping.state,
      shipping_zip: shipping.zip,
      items_json: JSON.stringify(items),
    };

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      metadata,
      success_url: `${req.headers.get("origin")}/supplies/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/supplies`,
    });

    // Create order in pending state — will be confirmed via success page or webhook
    const totalCents = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
      user_id: user.id,
      email: shipping.email,
      full_name: shipping.full_name,
      address_line1: shipping.address_line1,
      address_line2: shipping.address_line2 || null,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip,
      stripe_payment_intent_id: session.id,
      status: "paid",
      total: totalCents,
    }).select("id").single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    await supabaseAdmin.from("order_items").insert(orderItems);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
