import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildTrackingUrl(carrier: string | null, trackingNumber: string): string {
  const c = (carrier ?? "").toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
  if (c.includes("usps") || c.includes("stamps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Admin access required");

    const { order_id, tracking_number, carrier } = await req.json();
    if (!order_id) throw new Error("Missing order_id");

    // Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) throw new Error("Order not found");

    // Update order as fulfilled
    await supabaseAdmin.from("orders").update({
      fulfillment_status: "fulfilled",
      shipped_at: new Date().toISOString(),
      tracking_number: tracking_number ?? null,
      carrier: carrier ?? null,
    }).eq("id", order_id);

    console.log(`[manual-fulfill] Order ${order_id} marked as fulfilled`);

    // Send shipping email
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    if (SENDGRID_API_KEY) {
      const trackingUrl = tracking_number ? buildTrackingUrl(carrier, tracking_number) : null;
      await sendShippingEmail({
        to: order.email,
        customerName: order.full_name,
        orderItems: order.order_items,
        shippingAddress: {
          line1: order.address_line1,
          line2: order.address_line2,
          city: order.city,
          state: order.state,
          zip: order.zip,
        },
        trackingNumber: tracking_number ?? null,
        trackingUrl,
        carrier: carrier ?? null,
      });
    } else {
      console.warn("[manual-fulfill] SENDGRID_API_KEY not set — skipping email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[manual-fulfill] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message === "Unauthorized" || error.message === "Admin access required" ? 403 : 500,
    });
  }
});

async function sendShippingEmail({
  to,
  customerName,
  orderItems,
  shippingAddress,
  trackingNumber,
  trackingUrl,
  carrier,
}: {
  to: string;
  customerName: string;
  orderItems: any[];
  shippingAddress: { line1: string; line2?: string | null; city: string; state: string; zip: string };
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrier: string | null;
}) {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  if (!SENDGRID_API_KEY) return;

  const firstName = customerName.split(" ")[0];
  const addressStr = [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`,
  ]
    .filter(Boolean)
    .join(", ");

  const itemsHtml = orderItems
    .map(
      (item: any) => `
      <tr>
        <td style="padding:8px 0; font-size:14px; color:#111; border-bottom:1px solid #f0f0f0;">${item.product_name}</td>
        <td style="padding:8px 0; font-size:14px; color:#666; text-align:center; border-bottom:1px solid #f0f0f0;">×${item.quantity}</td>
        <td style="padding:8px 0; font-size:14px; color:#111; text-align:right; border-bottom:1px solid #f0f0f0;">$${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const trackingBlock = trackingNumber
    ? `
    <div style="margin:24px 0; padding:20px; background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; text-align:center;">
      <p style="margin:0 0 4px 0; font-size:13px; color:#9a3412; font-weight:600; text-transform:uppercase; letter-spacing:.06em;">${carrier ? carrier.toUpperCase() : "Tracking"}</p>
      <p style="margin:0 0 14px 0; font-size:22px; font-weight:700; color:#111; letter-spacing:.04em;">${trackingNumber}</p>
      ${
        trackingUrl
          ? `<a href="${trackingUrl}" style="display:inline-block; background:#f97316; color:#fff; font-weight:700; font-size:14px; padding:12px 28px; border-radius:8px; text-decoration:none;">Track My Package →</a>`
          : ""
      }
    </div>`
    : `<p style="color:#666; font-size:14px;">Your tracking number will be available shortly.</p>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
        <tr>
          <td style="background:#111;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.02em;">Courial <span style="color:#f97316;">Shop</span></p>
            <p style="margin:6px 0 0;font-size:13px;color:#999;letter-spacing:.06em;text-transform:uppercase;">Your Order Is On Its Way</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:#111;">Your order has shipped, ${firstName}! 🚚</p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;">Great news — your order is on its way to you.</p>
            ${trackingBlock}
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr>
                <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">Item</th>
                <th style="text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">Qty</th>
                <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">Price</th>
              </tr>
              ${itemsHtml}
            </table>
            <div style="margin-top:28px;padding:16px 20px;background:#f9f9f9;border-radius:10px;border:1px solid #eee;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#999;font-weight:600;">Shipping to</p>
              <p style="margin:0;font-size:14px;color:#333;">${customerName}<br>${addressStr}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
            <p style="margin:0;font-size:12px;color:#999;">Questions? Visit <a href="https://courial.com/help" style="color:#f97316;text-decoration:none;">courial.com/help</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "support@courial.com", name: "Courial Shop" },
      subject: `Your order has shipped!${trackingNumber ? ` — Track: ${trackingNumber}` : ""}`,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[manual-fulfill] SendGrid error:", res.status, body);
  } else {
    console.log("[manual-fulfill] Shipping email sent to", to);
    await res.text();
  }
}
