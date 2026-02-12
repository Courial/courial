import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import courialLogo from "@/assets/courial-logo.png";

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
  const userInitials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";
  const avatarUrl = user?.user_metadata?.avatar_url;

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
            <img src={courialLogo} alt="Courial" className="h-[1.875rem]" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href}>
                <Button 
                  variant={isActive(link.href) ? "nav-active" : "nav"} 
                  size="sm" 
                  className={`px-4 ${link.name === "Blog" ? "animate-glow-text font-bold" : ""}`}
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {!authLoading && isAdmin && (
              <Link to="/admin/blog">
                <Button variant="ghost" size="sm" className="border border-foreground/25">
                  Admin
                </Button>
              </Link>
            )}
            {authLoading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Checking...</span>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl} alt="Profile" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); signOut().then(() => navigate("/")); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="border border-foreground/25">
                  Sign In
                </Button>
              </Link>
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
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`py-2 text-lg font-medium transition-colors ${
                    link.name === "Blog"
                      ? "animate-glow-text font-bold"
                      : isActive(link.href) 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground active:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {!authLoading && isAdmin && (
                  <Link to="/admin/blog" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start border border-foreground/25">
                      Admin
                    </Button>
                  </Link>
                )}
                {authLoading ? (
                  <span className="text-xs text-muted-foreground animate-pulse py-2">Checking...</span>
                ) : user ? (
                  <Button variant="ghost" className="w-full justify-start border border-foreground/25" onClick={() => { setIsOpen(false); signOut(); navigate("/"); }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
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