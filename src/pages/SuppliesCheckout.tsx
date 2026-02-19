import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="dark min-h-screen bg-[hsl(0,0%,7%)] text-[hsl(0,0%,98%)]">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-[hsl(0,0%,50%)] mb-4">Your cart is empty</p>
          <Link to="/supplies"><Button variant="outline" className="border-[hsl(0,0%,20%)] bg-transparent text-[hsl(0,0%,98%)]">Browse Supplies</Button></Link>
        </div>
      </div>
    );
  }

  const inputClass = "bg-[hsl(0,0%,10%)] border-[hsl(0,0%,20%)] text-[hsl(0,0%,98%)] placeholder:text-[hsl(0,0%,40%)] focus-visible:ring-[hsl(24,100%,50%)]";

  return (
    <div className="dark min-h-screen bg-[hsl(0,0%,7%)] text-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Checkout | Courial Supplies</title>
      </Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link to="/supplies" className="inline-flex items-center text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,98%)] mb-8 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to shop
          </Link>

          <h1 className="text-2xl font-bold mb-8">Checkout</h1>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Shipping form */}
            <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
              <h2 className="text-lg font-semibold mb-2">Shipping Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-[hsl(0,0%,60%)] text-xs">Full Name</Label>
                  <Input name="full_name" value={form.full_name} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="col-span-2">
                  <Label className="text-[hsl(0,0%,60%)] text-xs">Email</Label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="col-span-2">
                  <Label className="text-[hsl(0,0%,60%)] text-xs">Address Line 1</Label>
                  <Input name="address_line1" value={form.address_line1} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="col-span-2">
                  <Label className="text-[hsl(0,0%,60%)] text-xs">Address Line 2 (optional)</Label>
                  <Input name="address_line2" value={form.address_line2} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <Label className="text-[hsl(0,0%,60%)] text-xs">City</Label>
                  <Input name="city" value={form.city} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <Label className="text-[hsl(0,0%,60%)] text-xs">State</Label>
                  <Input name="state" value={form.state} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <Label className="text-[hsl(0,0%,60%)] text-xs">ZIP Code</Label>
                  <Input name="zip" value={form.zip} onChange={handleChange} required className={inputClass} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[hsl(24,100%,50%)] hover:bg-[hsl(24,100%,45%)] text-white font-semibold h-12 text-base mt-6"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                Pay {formatPrice(totalPrice)}
              </Button>
            </form>

            {/* Order summary */}
            <div className="md:col-span-2">
              <div className="rounded-xl bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,20%)] p-5 sticky top-28">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[hsl(0,0%,70%)]">{item.name} × {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[hsl(0,0%,20%)] mt-4 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[hsl(24,100%,50%)]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
