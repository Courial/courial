import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

export default function SuppliesCheckout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
  });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to checkout.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-supplies-payment", {
        body: {
          items: items.map((i) => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          shipping: form,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/supplies">
            <Button variant="outline">Browse Supplies</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Checkout | Courial Shop</title>
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">

          {/* Back to Shop — in-flow, matching "Driver Shop" label position */}
          <Link
            to="/supplies"
            className="inline-flex items-center gap-1 mb-6 text-sm font-semibold tracking-wider uppercase text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Shop
          </Link>

          <div className="grid md:grid-cols-5 gap-12 max-w-4xl">
            {/* Shipping form — flush left */}
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-3">
              <h1 className="text-2xl font-bold mb-1">Checkout</h1>
              <p className="text-sm font-semibold text-foreground mb-4">Shipping Details</p>

              <Input
                name="full_name"
                placeholder="Full Name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
              />
              <Input
                name="address_line1"
                placeholder="Address Line 1"
                value={form.address_line1}
                onChange={handleChange}
                required
                className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
              />
              <Input
                name="address_line2"
                placeholder="Address Line 2 (optional)"
                value={form.address_line2}
                onChange={handleChange}
                className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
                />
                <Input
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
                />
                <Input
                  name="zip"
                  placeholder="ZIP Code"
                  value={form.zip}
                  onChange={handleChange}
                  required
                  className="placeholder:text-foreground/50 hover:border-primary/40 transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-base mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Pay {formatPrice(totalPrice)}
              </Button>
            </form>

            {/* Order summary */}
            <div className="md:col-span-2">
              <div className="rounded-xl bg-card border border-border p-5 sticky top-28 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
