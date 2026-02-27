import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  UserRoundPen,
  CreditCard,
  Headphones,
  Settings,
  Clock,
  LogOut,
  Star,
} from "lucide-react";
import profileIcon from "@/assets/profile-icon.png";
import { PaymentMethodsModal } from "@/components/PaymentMethodsModal";

const menuItems = [
  { icon: UserRoundPen, label: "Update Profile", href: "/account/profile" },
  { icon: CreditCard, label: "Payment Methods", href: "__payment_modal__" },
  { icon: Headphones, label: "Get Support", href: "__support__" },
  { icon: Settings, label: "Settings", href: "/account/settings" },
  { icon: Clock, label: "Activity", href: "/account/orders" },
];

export const ProfileHoverCard = () => {
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl = user?.user_metadata?.avatar_url;
  const createdAt = user?.created_at;
  const memberYear = createdAt
    ? `'${new Date(createdAt).getFullYear().toString().slice(-2)}`
    : "";

  return (
    <>
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
            <Avatar className="h-10 w-10 border border-foreground">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-background p-0 flex items-center justify-center">
                <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
              </AvatarFallback>
            </Avatar>
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="end"
          sideOffset={8}
          className="w-72 p-0 rounded-2xl border border-border shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-foreground px-5 py-5 flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-muted-foreground/30">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-muted-foreground/20 p-0 flex items-center justify-center">
                <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain invert" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-primary-foreground font-semibold text-lg leading-tight">
                {displayName}
              </span>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              {memberYear && (
                <span className="text-primary-foreground/60 text-xs mt-0.5">
                  Member Since {memberYear}
                </span>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 bg-background">
            {menuItems.map((item) =>
              item.href === "__payment_modal__" ? (
                <button
                  key={item.label}
                  onClick={() => setShowPaymentModal(true)}
                  className="flex items-center gap-4 px-5 py-3.5 text-foreground hover:bg-accent transition-colors w-full text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[0.9375rem] font-medium">{item.label}</span>
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-4 px-5 py-3.5 text-foreground hover:bg-accent transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="text-[0.9375rem] font-medium">{item.label}</span>
                </Link>
              )
            )}

            {/* Sign Out */}
            <button
              onClick={() => {
                console.log("[Navbar] Sign out - nuking session");
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("/");
              }}
              className="flex items-center justify-center gap-2 mx-4 my-2 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-colors w-[calc(100%-2rem)]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>

      <PaymentMethodsModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
      />
    </>
  );
};
