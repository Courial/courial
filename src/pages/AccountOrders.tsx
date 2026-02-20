import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, Loader2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  fulfillment_status: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  tracking_number: string | null;
  carrier: string | null;
  order_items: OrderItem[];
}

const statusColors: Record<string, string> = {
  paid: "bg-green-500/10 text-green-600 border-green-500/30",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  refunded: "bg-red-500/10 text-red-600 border-red-500/30",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/30",
};

const fulfillmentColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  shipped: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  fulfilled: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  delivered: "bg-green-500/10 text-green-600 border-green-500/30",
};

function buildTrackingUrl(carrier: string | null, trackingNumber: string): string {
  const c = (carrier ?? "").toLowerCase();
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`;
  if (c.includes("usps") || c.includes("stamps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c.includes("dhl")) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${trackingNumber}`;
  return `https://parcelsapp.com/en/tracking/${trackingNumber}`;
}

export default function AccountOrders() {
  const { user, loading: authLoading } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Order[];
    },
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>My Orders | Courial Shop</title>
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20 container mx-auto px-6 max-w-3xl">
        <Link
          to="/supplies"
          className="inline-flex items-center gap-1 mb-6 text-sm font-semibold tracking-wider uppercase text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Shop
        </Link>

        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link to="/supplies">
              <Button variant="hero-orange">Browse the Shop</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const trackingUrl = order.tracking_number
                ? buildTrackingUrl(order.carrier, order.tracking_number)
                : null;

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-colors"
                >
                  {/* Order header */}
                  <button
                    className="w-full text-left p-5 flex items-center justify-between gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">{formatDate(order.created_at)}</p>
                        <p className="font-semibold text-foreground">{formatPrice(order.total)}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${statusColors[order.status] ?? ""}`}>
                          {order.status}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${fulfillmentColors[order.fulfillment_status] ?? ""}`}>
                          {order.fulfillment_status}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Tracking banner — always visible if shipped */}
                  {order.tracking_number && (
                    <div className="mx-5 mb-3 -mt-1 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70 mb-0.5">
                          {order.carrier ? order.carrier.toUpperCase() : "Tracking"}
                        </p>
                        <p className="text-sm font-mono font-bold text-foreground">{order.tracking_number}</p>
                      </div>
                      {trackingUrl && (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
                        >
                          Track <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.product_name}
                              <span className="text-muted-foreground ml-1">×{item.quantity}</span>
                            </span>
                            <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Shipped to</p>
                        <p>{order.full_name} — {order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ""}, {order.city}, {order.state} {order.zip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
