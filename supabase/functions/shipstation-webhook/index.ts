import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// ShipStation sends webhook events to this endpoint.
// Configure in ShipStation: Settings → Integrations → Webhooks
// Event: SHIP_NOTIFY (fires when a shipment label is created)
// URL: https://<project>.supabase.co/functions/v1/shipstation-webhook

serve(async (req) => {
  try {
    // ShipStation sends a POST with JSON body
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = await req.json();
    console.log("[shipstation-webhook] Received event:", JSON.stringify(body));

    // ShipStation SHIP_NOTIFY payload contains resource_url to fetch shipment details
    const resourceUrl: string = body.resource_url;
    const resourceType: string = body.resource_type;

    if (!resourceUrl || resourceType !== "SHIP_NOTIFY") {
      console.log("[shipstation-webhook] Ignored event type:", resourceType);
      return new Response(JSON.stringify({ ignored: true }), { status: 200 });
    }

    const SHIPSTATION_API_KEY = Deno.env.get("SHIPSTATION_API_KEY") ?? "";
    const auth = `Basic ${btoa(SHIPSTATION_API_KEY)}`;

    // Fetch the shipment details from ShipStation
    const ssRes = await fetch(resourceUrl, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
    });

    if (!ssRes.ok) {
      const errText = await ssRes.text();
      console.error("[shipstation-webhook] Failed to fetch resource:", ssRes.status, errText);
      return new Response("Failed to fetch ShipStation resource", { status: 500 });
    }

    const ssData = await ssRes.json();
    const shipments: any[] = ssData.shipments ?? [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    for (const shipment of shipments) {
      const ssOrderId = String(shipment.orderId ?? "");
      const trackingNumber: string = shipment.trackingNumber ?? "";
      const carrier: string = shipment.carrierCode ?? "";

      if (!ssOrderId || !trackingNumber) continue;

      // Find our order by shipstation_order_id
      const { data: order, error: fetchErr } = await supabase
        .from("orders")
        .select("id, email, full_name, order_items(*)")
        .eq("shipstation_order_id", ssOrderId)
        .maybeSingle();

      if (fetchErr || !order) {
        console.warn("[shipstation-webhook] No order found for SS order:", ssOrderId);
        continue;
      }

      // Update tracking info
      const { error: updateErr } = await supabase
        .from("orders")
        .update({
          tracking_number: trackingNumber,
          carrier,
          fulfillment_status: "shipped",
          shipped_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateErr) {
        console.error("[shipstation-webhook] Failed to update order:", updateErr);
        continue;
      }

      console.log(`[shipstation-webhook] Updated order ${order.id} with tracking ${trackingNumber}`);

      // Send shipping email
      const trackingUrl = buildTrackingUrl(carrier, trackingNumber);
      const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
      if (SENDGRID_API_KEY) {
        await sendShippingEmail({
          apiKey: SENDGRID_API_KEY,
          to: order.email,
          customerName: order.full_name,
          trackingNumber,
          trackingUrl,
          carrier,
          orderItems: (order as any).order_items ?? [],
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error("[shipstation-webhook] Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

function buildTrackingUrl(carrier: string, trackingNumber: string): string {
  const c = carrier.toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
  if (c.includes("usps") || c.includes("stamps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}

async function sendShippingEmail({
  apiKey, to, customerName, trackingNumber, trackingUrl, carrier, orderItems,
}: {
  apiKey: string; to: string; customerName: string;
  trackingNumber: string; trackingUrl: string; carrier: string; orderItems: any[];
}) {
  const firstName = customerName.split(" ")[0];
  const itemsHtml = orderItems.map((item: any) => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#111;border-bottom:1px solid #f0f0f0;">${item.product_name}</td>
      <td style="padding:8px 0;font-size:14px;color:#666;text-align:center;border-bottom:1px solid #f0f0f0;">×${item.quantity}</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#111;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">Courial <span style="color:#f97316;">Shop</span></p>
          <p style="margin:6px 0 0;font-size:13px;color:#999;text-transform:uppercase;letter-spacing:.06em;">Shipping Confirmation</p>
        </td></tr>
        <tr><td style="padding:36px 40px;">
          <p style="margin:0 0 6px;font-size:24px;font-weight:700;color:#111;">Your order is on its way, ${firstName}! 🚚</p>
          <div style="margin:24px 0;padding:20px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#9a3412;font-weight:600;text-transform:uppercase;">${carrier ? carrier.toUpperCase() : "Carrier"} Tracking</p>
            <p style="margin:0 0 14px;font-size:22px;font-weight:700;color:#111;">${trackingNumber}</p>
            <a href="${trackingUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Track My Package →</a>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <th style="text-align:left;font-size:11px;text-transform:uppercase;color:#999;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">Item</th>
              <th style="text-align:center;font-size:11px;text-transform:uppercase;color:#999;padding-bottom:10px;border-bottom:2px solid #f0f0f0;">Qty</th>
            </tr>
            ${itemsHtml}
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
          <p style="margin:0;font-size:12px;color:#999;">Questions? <a href="mailto:support@courial.com" style="color:#f97316;text-decoration:none;">support@courial.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "support@courial.com", name: "Courial Shop" },
      subject: `Your order shipped — Track: ${trackingNumber}`,
      content: [{ type: "text/html", value: html }],
    }),
  });
  if (!res.ok) console.error("[shipstation-webhook] Email error:", await res.text());
  else await res.text();
}
