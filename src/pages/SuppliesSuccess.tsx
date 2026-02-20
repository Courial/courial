import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, MapPin, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  full_name: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function SuppliesSuccess() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }

    const fetchOrder = async () => {
      // stripe_payment_intent_id stores the session.id for now
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("stripe_payment_intent_id", sessionId)
        .maybeSingle();

      if (!error && data) setOrder(data as unknown as Order);
      setLoading(false);
    };

    fetchOrder();
  }, [sessionId]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet><title>Order Confirmed | Courial Shop</title></Helmet>
      <Navbar />

      <main className="pt-28 pb-20 container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-10">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. You'll receive a confirmation email shortly with tracking details.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : order ? (
          <div className="space-y-5">
            {/* Order items */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Order Summary</h2>
              </div>
              <div className="space-y-3">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.product_name}
                      <span className="text-muted-foreground ml-1">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-semibold">Shipping To</h2>
              </div>
              <p className="text-sm text-foreground font-medium">{order.full_name}</p>
              <p className="text-sm text-muted-foreground">{order.address_line1}</p>
              {order.address_line2 && <p className="text-sm text-muted-foreground">{order.address_line2}</p>}
              <p className="text-sm text-muted-foreground">{order.city}, {order.state} {order.zip}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground text-sm">
            Order details not found. Check your email for a confirmation.
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/supplies">
            <Button variant="hero-orange" className="font-semibold">Continue Shopping</Button>
          </Link>
          <Link to="/account/orders">
            <Button variant="outline">View All Orders</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
