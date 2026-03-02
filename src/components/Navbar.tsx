import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHoverCard } from "@/components/ProfileHoverCard";
import { supabase } from "@/integrations/supabase/client";
import courialLogo from "@/assets/courial-logo-black.svg";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Businesses", href: "/business" },
  { name: "Users", href: "/users" },
  { name: "Courials", href: "/courials" },
  { name: "Chauffeur", href: "/chauffeur" },
  { name: "Shield", href: "/shield" },
  { name: "Blog", href: "/blog" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [hasOrders, setHasOrders] = useState(false);
  const [bookingPulse, setBookingPulse] = useState(false);
  const [formStarted, setFormStarted] = useState(false);
  const [bookingActive, setBookingActive] = useState(false);
  const [showSignInGate, setShowSignInGate] = useState(false);

  useEffect(() => {
    if (!user) { setHasOrders(false); return; }
    supabase
      .from("orders")
      .select("id, status", { count: "exact" })
      .eq("user_id", user.id)
      .then(({ count }) => {
        setHasOrders((count ?? 0) > 0);
      });
  }, [user]);

  // Listen for booking state updates from Book page
  useEffect(() => {
    const sync = () => {
      const state = localStorage.getItem("courial_booking_state");
      const started = localStorage.getItem("courial_form_started") === "true";
      setBookingPulse(state === "loading");
      setBookingActive(state === "active");
      setFormStarted(started && state === "input");
    };
    sync();
    window.addEventListener("courial-booking-update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("courial-booking-update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);



  const handleNavClick = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    navigate(href);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  }, [navigate]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={courialLogo} alt="Courial" className="h-[1.875rem] w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)}>
                <Button 
                  variant={isActive(link.href) ? "nav-active" : "nav"} 
                  size="sm" 
                  className={`px-4 text-[0.9375rem] ${link.name === "Blog" ? "animate-glow-text font-bold" : ""}`}
                >
                  {link.name}
                </Button>
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {!authLoading && isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="border border-foreground/25">
                  Admin
                </Button>
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                {hasOrders && (
                  <Link to="/account/orders">
                    <Button variant="ghost" size="sm" className="border border-foreground/25">
                      My Orders
                    </Button>
                  </Link>
                )}
                <ProfileHoverCard />
              </div>
            ) : !authLoading ? (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="border border-foreground/25">
                  Sign In
                </Button>
              </Link>
            ) : (
              <div className="w-[70px]" />
            )}
            {user ? (
              <Link to="/book">
                <Button
                  variant={bookingActive ? "hero-green" : isActive("/book") ? "secondary" : formStarted ? "hero-orange" : "hero"}
                  size="sm"
                  className={bookingPulse ? "animate-pulse-gentle" : ""}
                >
                  Book Now
                </Button>
              </Link>
            ) : (
              <Button
                variant="hero"
                size="sm"
                onClick={() => setShowSignInGate(true)}
              >
                Book Now
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`py-2 text-lg font-medium transition-colors ${
                    link.name === "Blog"
                      ? "animate-glow-text font-bold"
                      : isActive(link.href) 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground active:text-foreground"
                  }`}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {!authLoading && isAdmin && (
                  <Link to="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start border border-foreground/25">
                      Admin
                    </Button>
                  </Link>
                )}
                {authLoading ? (
                  <span className="text-xs text-muted-foreground animate-pulse py-2">Checking...</span>
                ) : user ? (
                  <>
                    {hasOrders && (
                      <Link to="/account/orders" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start border border-foreground/25">
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start border border-foreground/25" onClick={async () => { console.log("[Navbar] Sign out - client-side"); setIsOpen(false); localStorage.clear(); sessionStorage.clear(); await signOut(); navigate("/", { replace: true }); }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start border border-foreground/25">
                      Sign In
                    </Button>
                  </Link>
                )}
                {user ? (
                  <Link to="/book" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={bookingActive ? "hero-green" : isActive("/book") ? "secondary" : formStarted ? "hero-orange" : "hero"}
                      className={`w-full ${bookingPulse ? "animate-pulse-gentle" : ""}`}
                    >
                      Book Now
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={() => { setIsOpen(false); setShowSignInGate(true); }}
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>

    {/* Sign In Required Gate */}
    <Dialog open={showSignInGate} onOpenChange={setShowSignInGate}>
      <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-hidden [&>button]:hidden shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
            <DialogTitle className="text-lg font-bold text-background mb-3">Sign In Required</DialogTitle>
            <p className="text-sm text-background/70 mb-6">Please sign in to book a service.</p>
            <Button
              className="w-full rounded-xl bg-background text-foreground hover:bg-background/90"
              onClick={() => { setShowSignInGate(false); navigate("/auth"); }}
            >
              Got it!
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
    </>
  );
};