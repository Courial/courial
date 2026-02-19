import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function SuppliesSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="dark min-h-screen bg-[hsl(0,0%,7%)] text-[hsl(0,0%,98%)]">
      <Helmet><title>Order Confirmed | Courial Supplies</title></Helmet>
      <Navbar />
      <main className="pt-32 pb-20 text-center container mx-auto px-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-3">Order Confirmed</h1>
        <p className="text-[hsl(0,0%,50%)] max-w-md mx-auto mb-8">
          Thank you for your purchase! You'll receive a confirmation email shortly with tracking details.
        </p>
        <Link to="/supplies">
          <Button className="bg-[hsl(24,100%,50%)] hover:bg-[hsl(24,100%,45%)] text-white font-semibold">
            Continue Shopping
          </Button>
        </Link>
      </main>
    </div>
  );
}
