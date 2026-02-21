import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import courialLogo from "@/assets/courial-logo-black.svg";
import profileIcon from "@/assets/profile-icon.png";

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


  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.courial_email || user?.email;
  const userInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : "U";
  const avatarUrl = user?.user_metadata?.avatar_url;

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
                <Link to="/account/orders">
                  <Button variant="ghost" size="sm" className="border border-foreground/25">
                    My Orders
                  </Button>
                </Link>
                <div className="relative group flex items-center justify-center w-10 h-10">
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                    <Avatar className="h-10 w-10 border border-foreground">
                      <AvatarImage src={avatarUrl} alt="Profile" />
                      <AvatarFallback className="bg-background p-0 flex items-center justify-center">
                        <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity border border-foreground/25 whitespace-nowrap"
                    onClick={() => {
                      console.log("[Navbar] Sign out - nuking session");
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.replace("/");
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
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
            <Button variant="hero" size="sm">
              Book Now
            </Button>
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
                    <Link to="/account/orders" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start border border-foreground/25">
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start border border-foreground/25" onClick={() => { console.log("[Navbar] Sign out - nuking session"); localStorage.clear(); sessionStorage.clear(); window.location.replace("/"); }}>
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
                <Button variant="hero">Book Now</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};