import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update the order from pending → paid
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("stripe_payment_intent_id", session.id)
      .select("*, order_items(*)")
      .single();

    if (updateError || !order) {
      console.error("Failed to update order:", updateError);
      return new Response("Order not found", { status: 404 });
    }

    // Fetch product images for each order item
    const productIds = order.order_items.map((i: any) => i.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, image_url")
      .in("id", productIds);

    const productImageMap: Record<string, string> = {};
    for (const p of products ?? []) {
      productImageMap[p.id] = p.image_url ?? "";
    }

    // Determine payment method label
    const paymentMethodType = session.payment_method_types?.[0] ?? "card";
    const paymentMethodLabel =
      paymentMethodType === "card" ? "Credit / Debit Card"
      : paymentMethodType === "link" ? "Link by Stripe"
      : paymentMethodType === "us_bank_account" ? "Bank Transfer (ACH)"
      : paymentMethodType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const totalCents: number = order.total;

    // Build email HTML with thumbnails
    const itemsHtml = order.order_items.map((item: any) => {
      const imageUrl = productImageMap[item.product_id] ?? "";
      // Resolve relative image URLs to absolute
      const absoluteImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `https://courial.com${imageUrl}`;

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;vertical-align:middle;">
            <div style="display:flex;align-items:center;gap:12px;">
              ${absoluteImageUrl ? `<img src="${absoluteImageUrl}" width="56" height="56" style="border-radius:8px;object-fit:cover;flex-shrink:0;" />` : ""}
              <span style="color:#eee;font-size:14px;">${item.product_name}</span>
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#aaa;text-align:center;font-size:14px;vertical-align:middle;">×${item.quantity}</td>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#eee;text-align:right;font-size:14px;font-weight:600;vertical-align:middle;">$${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
        </tr>`;
    }).join("");

    const emailHtml = `
      <div style="background:#111;color:#eee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:40px 32px;border-radius:14px;">
        <img src="https://courial.com/favicon.ico" width="32" style="margin-bottom:24px;" />

        <h1 style="font-size:22px;font-weight:700;margin:0 0 6px;">Order Confirmed ✓</h1>
        <p style="color:#aaa;margin:0 0 28px;font-size:14px;">Hi ${order.full_name}, your Courial Shop order is confirmed and being processed.</p>

        <!-- Payment badge -->
        <div style="display:inline-flex;align-items:center;gap:8px;background:#1a2a1a;border:1px solid #2a4a2a;border-radius:8px;padding:8px 14px;margin-bottom:28px;">
          <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
          <span style="color:#22c55e;font-size:13px;font-weight:600;">Paid</span>
          <span style="color:#555;font-size:13px;">·</span>
          <span style="color:#aaa;font-size:13px;">${paymentMethodLabel}</span>
        </div>

        <!-- Items -->
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.05em;padding-bottom:10px;">Item</th>
              <th style="text-align:center;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.05em;padding-bottom:10px;">Qty</th>
              <th style="text-align:right;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.05em;padding-bottom:10px;">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align:right;margin-top:18px;font-size:20px;font-weight:700;color:#ff6a00;">
          Total: $${(totalCents / 100).toFixed(2)}
        </div>

        <!-- Shipping -->
        <div style="margin-top:28px;padding:18px;background:#1a1a1a;border-radius:10px;">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#555;">Shipping to</p>
          <p style="margin:0;font-weight:600;color:#eee;">${order.full_name}</p>
          <p style="margin:2px 0 0;color:#aaa;font-size:13px;">${order.address_line1}${order.address_line2 ? ", " + order.address_line2 : ""}</p>
          <p style="margin:2px 0 0;color:#aaa;font-size:13px;">${order.city}, ${order.state} ${order.zip}</p>
        </div>

        <p style="margin-top:28px;font-size:12px;color:#555;">Questions? Contact <a href="mailto:support@courial.com" style="color:#ff6a00;text-decoration:none;">support@courial.com</a></p>
      </div>
    `;

    try {
      await supabase.functions.invoke("send-email", {
        body: {
          to: order.email,
          subject: "Your Courial Shop order is confirmed ✓",
          html: emailHtml,
        },
      });
      console.log("Confirmation email sent to", order.email);
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
