import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import visaIcon from "@/assets/card-icons/visa.svg";
import mastercardIcon from "@/assets/card-icons/mastercard.svg";
import amexIcon from "@/assets/card-icons/amex.svg";
import discoverIcon from "@/assets/card-icons/discover.svg";

const cardBrands = [
  { name: "Visa", icon: visaIcon },
  { name: "Mastercard", icon: mastercardIcon },
  { name: "Amex", icon: amexIcon },
  { name: "Discover", icon: discoverIcon },
];

const AccountPayments = () => {
  const { user, loading } = useAuth();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="text-2xl font-bold mb-8">Payment Methods</h1>

          <div className="flex gap-4 mb-8 justify-center">
            {cardBrands.map((b) => (
              <img key={b.name} src={b.icon} alt={b.name} className="h-8 opacity-40" />
            ))}
          </div>

          <div className="rounded-xl border border-border p-8 flex flex-col items-center gap-4 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">No payment methods on file yet.</p>
            <Button variant="outline" className="gap-2" disabled>
              <Plus className="h-4 w-4" /> Add Payment Method
            </Button>
            <p className="text-xs text-muted-foreground">Payment management coming soon.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountPayments;
