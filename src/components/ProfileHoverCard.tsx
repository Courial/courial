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
import { UpdateProfileModal } from "@/components/UpdateProfileModal";
import { SettingsModal } from "@/components/SettingsModal";

const menuItems = [
  { icon: UserRoundPen, label: "Update Profile", href: "__profile_modal__" },
  { icon: CreditCard, label: "Payment Methods", href: "__payment_modal__" },
  { icon: Headphones, label: "Get Support", href: "__support__" },
  { icon: Settings, label: "Settings", href: "__settings_modal__" },
  { icon: Clock, label: "Activity", href: "/book?view=activity" },
];

export const ProfileHoverCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
          className="w-64 p-0 rounded-[20px] border-none bg-foreground/75 backdrop-blur-sm shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-background/30">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-background/20 p-0 flex items-center justify-center">
                <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain invert" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-background font-semibold text-lg leading-tight">
                {displayName}
              </span>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                ))}
              </div>
              {memberYear && (
                <span className="text-background/50 text-xs mt-0.5">
                  Member Since {memberYear}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-background/20" />

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const handleClick = () => {
                if (item.href === "__payment_modal__") setShowPaymentModal(true);
                else if (item.href === "__profile_modal__") setShowProfileModal(true);
                else if (item.href === "__settings_modal__") setShowSettingsModal(true);
                else if (item.href === "__support__") {
                  if (window.location.pathname === "/help") {
                    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                  } else {
                    navigate("/help");
                    setTimeout(() => {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    }, 500);
                  }
                }
              };

              const isLink = !item.href.startsWith("__");
              const className = "flex items-center gap-3 px-6 py-2.5 text-background hover:bg-background/10 transition-colors w-full text-left";

              return isLink ? (
                <Link key={item.label} to={item.href} className={className}>
                  <item.icon className="h-4 w-4 text-background/60" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ) : (
                <button key={item.label} onClick={handleClick} className={className}>
                  <item.icon className="h-4 w-4 text-background/60" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sign Out */}
          <div className="px-5 pb-5 pt-2">
            <button
              onClick={async () => {
                console.log("[ProfileHoverCard] Sign out - client-side");
                localStorage.clear();
                sessionStorage.clear();
                await signOut();
                navigate("/", { replace: true });
              }}
              className="w-full rounded-lg h-9 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>

      <PaymentMethodsModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
      />
      <UpdateProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
      />
    </>
  );
};
