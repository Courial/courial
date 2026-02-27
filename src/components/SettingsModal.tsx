import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Settings, Home, Building2, Heart, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import profileIcon from "@/assets/profile-icon.png";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { user } = useAuth();
  const [commuteOpen, setCommuteOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email || "";
  const phone = user?.phone || user?.user_metadata?.phone || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border !rounded-[25px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          {/* Header band */}
          <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
            <div className="flex items-center gap-3">
              <Settings className="w-7 h-7 text-foreground" />
              <span className="text-[1.65rem] font-bold text-foreground">Settings</span>
            </div>
          </div>

          <div className="px-7 pb-2">
            {/* User Info */}
            <div className="flex items-center gap-4 py-5 border-b border-border">
              <Avatar className="h-14 w-14 border-2 border-border">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback className="bg-secondary p-0 flex items-center justify-center">
                  <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{phone || "No phone"}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            <DialogTitle className="sr-only">Settings</DialogTitle>

            {/* Saved Places */}
            <div className="space-y-0">
              <button className="flex items-center gap-4 w-full py-4 border-b border-border text-left hover:bg-accent/50 transition-colors">
                <Home className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Home</p>
                  <p className="text-xs text-muted-foreground">Add home</p>
                </div>
              </button>
              <button className="flex items-center gap-4 w-full py-4 border-b border-border text-left hover:bg-accent/50 transition-colors">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Work</p>
                  <p className="text-xs text-muted-foreground">Add work</p>
                </div>
              </button>
              <button className="flex items-center gap-4 w-full py-4 border-b border-border text-left hover:bg-accent/50 transition-colors">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Favorite Partners</p>
                  <p className="text-xs text-muted-foreground">View your favorite chauffeurs</p>
                </div>
              </button>
            </div>

            {/* Location */}
            <div className="mt-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Location</p>
              <button
                onClick={() => setCommuteOpen(!commuteOpen)}
                className="flex items-center justify-between w-full py-3 hover:bg-accent/50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Commute alerts</p>
                    <p className="text-xs text-muted-foreground">Commute alerts</p>
                  </div>
                </div>
                {commuteOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Offers */}
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-sm font-bold text-foreground">Offers from Courial</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Choose your preferred method to receive our customised offers and marketing communications.
              </p>

              <div className="space-y-2.5">
                {[
                  { label: "Push", value: pushEnabled, setter: setPushEnabled },
                  { label: "Email", value: emailEnabled, setter: setEmailEnabled },
                  { label: "SMS", value: smsEnabled, setter: setSmsEnabled },
                  { label: "Chat apps", value: chatEnabled, setter: setChatEnabled },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between bg-secondary/50 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.setter}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pt-4 pb-7">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-auto mx-auto rounded-xl h-9 px-8 text-sm font-semibold block"
              variant="hero"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
