import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// POST { order_id: string }
// Fetches shipment data from ShipStation GET /shipments?orderNumber=...
// Picks the most recent shipment with a tracking number, updates the DB,
// and sends/re-sends the shipping confirmation email to the customer.
//
// Designed for manual "Sync Tracking" button use today; can be scheduled
// later for automated polling, or replaced with POST /shipments/createlabel.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getShipStationAuth(): string {
  const key = Deno.env.get("SHIPSTATION_API_KEY") ?? "";
  return `Basic ${btoa(key)}`;
}

function buildTrackingUrl(carrier: string | null, trackingNumber: string): string {
  const c = (carrier ?? "").toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
  if (c.includes("usps") || c.includes("stamps"))
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c.includes("dhl"))
    return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth: admin only ──────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Unauthorized");
    const userId = claimsData.claims.sub;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Admin access required");

    // ── Parse request ─────────────────────────────────────────────────────
    const { order_id } = await req.json();
    if (!order_id) throw new Error("Missing order_id");

    // ── Load order from DB ────────────────────────────────────────────────
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) throw new Error("Order not found");

    const SHIPSTATION_API_KEY = Deno.env.get("SHIPSTATION_API_KEY");
    if (!SHIPSTATION_API_KEY) throw new Error("SHIPSTATION_API_KEY is not configured");

    // ── Determine ShipStation order number ───────────────────────────────
    // We store the ShipStation numeric orderId in shipstation_order_id.
    // ShipStation's GET /shipments accepts orderNumber (our short code) OR orderId.
    // We'll use orderId if available; otherwise fall back to orderNumber.
    const ssOrderId = order.shipstation_order_id;
    if (!ssOrderId) throw new Error("This order has not been synced to ShipStation yet");

    // Build the query — filter by orderId (the internal SS numeric ID)
    const shipmentsUrl =
      `https://ssapi.shipstation.com/shipments?orderId=${encodeURIComponent(ssOrderId)}&includeShipmentItems=true`;

    console.log(`[fetch-tracking] Querying ShipStation shipments for orderId=${ssOrderId}`);

    const ssRes = await fetch(shipmentsUrl, {
      headers: {
        Authorization: getShipStationAuth(),
        "Content-Type": "application/json",
      },
    });

    if (!ssRes.ok) {
      const errText = await ssRes.text();
      console.error("[fetch-tracking] ShipStation error:", ssRes.status, errText);
      throw new Error(`ShipStation API error [${ssRes.status}]: ${errText}`);
    }

    const ssData = await ssRes.json();
    const shipments: any[] = ssData.shipments ?? [];

    console.log(`[fetch-tracking] Found ${shipments.length} shipment(s) for SS orderId=${ssOrderId}`);

    // ── Edge cases ────────────────────────────────────────────────────────
    // No shipments yet — label not printed
    if (shipments.length === 0) {
      return new Response(
        JSON.stringify({ success: false, reason: "no_shipments", message: "No shipments found yet. Label may not have been created in ShipStation." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Filter to shipments that have a tracking number (voided ones may not)
    const tracked = shipments.filter((s: any) => s.trackingNumber && !s.voided);

    if (tracked.length === 0) {
      return new Response(
        JSON.stringify({ success: false, reason: "no_tracking", message: "Shipments found but none have a tracking number yet (label may be voided or pending scan)." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Multiple shipments = partial fulfillment scenario.
    // Strategy: use the most recently created shipment with a tracking number.
    // Future: could store all tracking numbers per shipment for full visibility.
    const best = tracked.sort(
      (a: any, b: any) =>
        new Date(b.shipDate ?? b.createDate ?? 0).getTime() -
        new Date(a.shipDate ?? a.createDate ?? 0).getTime()
    )[0];

    const trackingNumber: string = best.trackingNumber;
    const carrier: string = best.carrierCode ?? "";
    const shipmentDate: string = best.shipDate ?? best.createDate ?? new Date().toISOString();
    const isPartial = tracked.length > 1;

    console.log(
      `[fetch-tracking] Using shipment tracking=${trackingNumber} carrier=${carrier}` +
        (isPartial ? ` (${tracked.length} total shipments — partial fulfillment)` : "")
    );

    // ── Update DB ─────────────────────────────────────────────────────────
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        carrier: carrier || null,
        fulfillment_status: "shipped",
        shipped_at: shipmentDate,
      })
      .eq("id", order_id);

    if (updateErr) {
      console.error("[fetch-tracking] DB update error:", updateErr);
      throw new Error("Failed to update order tracking in database");
    }

    // ── Send shipping email ───────────────────────────────────────────────
    const trackingUrl = buildTrackingUrl(carrier, trackingNumber);
    await sendShippingEmail({
      to: order.email,
      customerName: order.full_name,
      orderItems: order.order_items ?? [],
      shippingAddress: {
        line1: order.address_line1,
        line2: order.address_line2,
        city: order.city,
        state: order.state,
        zip: order.zip,
      },
      trackingNumber,
      trackingUrl,
      carrier,
      isPartial,
      totalShipments: tracked.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: trackingNumber,
        carrier,
        shipment_date: shipmentDate,
        total_shipments: tracked.length,
        is_partial: isPartial,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error("[fetch-tracking] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status:
        err.message === "Unauthorized" || err.message === "Admin access required" ? 403 : 500,
    });
  }
});

// ── Email ──────────────────────────────────────────────────────────────────

async function sendShippingEmail({
  to,
  customerName,
  orderItems,
  shippingAddress,
  trackingNumber,
  trackingUrl,
  carrier,
  isPartial,
  totalShipments,
}: {
  to: string;
  customerName: string;
  orderItems: any[];
  shippingAddress: { line1: string; line2?: string | null; city: string; state: string; zip: string };
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  isPartial: boolean;
  totalShipments: number;
}) {
  const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
  if (!SENDGRID_API_KEY) {
    console.warn("[fetch-tracking] SENDGRID_API_KEY not set — skipping email");
    return;
  }

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
        <td style="padding:8px 0;font-size:14px;color:#111;border-bottom:1px solid #f0f0f0;">${item.product_name}</td>
        <td style="padding:8px 0;font-size:14px;color:#666;text-align:center;border-bottom:1px solid #f0f0f0;">×${item.quantity}</td>
        <td style="padding:8px 0;font-size:14px;color:#111;text-align:right;border-bottom:1px solid #f0f0f0;">$${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const partialNote = isPartial
    ? `<p style="margin:0 0 16px;font-size:13px;color:#9a3412;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:10px 14px;">
        📦 This is shipment 1 of ${totalShipments}. Additional packages may arrive separately with their own tracking numbers.
       </p>`
    : "";

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
            <p style="margin:6px 0 0;font-size:13px;color:#999;letter-spacing:.06em;text-transform:uppercase;">Shipping Confirmation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:#111;">Your order is on its way, ${firstName}! 🚚</p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;">We've handed your order off to the carrier. Here's everything you need to track it.</p>
            ${partialNote}
            <div style="margin:0 0 28px;padding:20px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">${carrier ? carrier.toUpperCase() : "Carrier"} Tracking</p>
              <p style="margin:0 0 14px;font-size:22px;font-weight:700;color:#111;letter-spacing:.04em;">${trackingNumber}</p>
              <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Track My Package →</a>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
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
            <p style="margin:0;font-size:12px;color:#999;">Questions? Reply to this email or visit <a href="https://courial.com/help" style="color:#f97316;text-decoration:none;">courial.com/help</a></p>
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
      subject: `Your order is on its way! — Track: ${trackingNumber}`,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    console.error("[fetch-tracking] SendGrid error:", res.status, await res.text());
  } else {
    console.log("[fetch-tracking] Shipping email sent to", to);
    await res.text();
  }
}
