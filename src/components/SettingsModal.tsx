import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Settings, Home, Building2, Heart, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import profileIcon from "@/assets/profile-icon.png";
import { SavedAddressModal, getSavedAddresses, type SavedAddress } from "@/components/SavedAddressModal";
import { FavoritePartnersModal } from "@/components/FavoritePartnersModal";

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
  const [addressModalType, setAddressModalType] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(getSavedAddresses());
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  useEffect(() => {
    if (open) setSavedAddresses(getSavedAddresses());
  }, [open]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email || "";
  const phone = user?.phone || user?.user_metadata?.phone || "";

  return (
  <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
            <DialogTitle className="sr-only">Settings</DialogTitle>

            <h1 className="text-2xl font-bold text-center mt-1 mb-5">Settings</h1>

            {/* User Info */}
            <div className="flex items-center gap-3 pb-4 border-b border-background/20">
              <Avatar className="h-12 w-12 border-2 border-background/30">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback className="bg-background/20 p-0 flex items-center justify-center">
                  <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain invert" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-background">{displayName}</p>
                <p className="text-[10px] text-background/50">{phone || "No phone"}</p>
                <p className="text-[10px] text-background/50">{email}</p>
              </div>
            </div>

            {/* Saved Places */}
            <div className="space-y-0">
              {[
                { type: "home", icon: Home, label: "Home" },
                { type: "work", icon: Building2, label: "Work" },
              ].map(({ type, icon: Icon, label }) => {
                const saved = savedAddresses.find((a) => a.type === type);
                return (
                  <button
                    key={type}
                    onClick={() => setAddressModalType(type)}
                    className="flex items-center gap-3 w-full py-3 border-b border-background/20 text-left hover:opacity-75 transition-opacity"
                  >
                    <Icon className="h-4 w-4 text-background/60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-background">{saved?.name || label}</p>
                      <p className="text-[10px] text-background/50 leading-snug break-words whitespace-normal">
                        {saved?.address || `Add ${type}`}
                      </p>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => setFavoritesOpen(true)}
                className="flex items-center gap-3 w-full py-3 border-b border-background/20 text-left hover:opacity-75 transition-opacity"
              >
                <Heart className="h-4 w-4 text-background/60" />
                <div>
                  <p className="text-sm font-semibold text-background">Favorite Partners</p>
                  <p className="text-[10px] text-background/50">View your favorite partners</p>
                </div>
              </button>
            </div>

            {/* Location */}
            <div className="mt-4">
              <p className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-2">Location</p>
              <button
                onClick={() => setCommuteOpen(!commuteOpen)}
                className="flex items-center justify-between w-full py-2.5 hover:opacity-75 transition-opacity rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-background/60" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-background">Commute alerts</p>
                    <p className="text-[10px] text-background/50">Commute alerts</p>
                  </div>
                </div>
                {commuteOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-background/50" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-background/50" />
                )}
              </button>
            </div>

            {/* Offers */}
            <div className="mt-4 border-t border-background/20 pt-4">
              <p className="text-sm font-bold text-background">Offers from Courial</p>
              <p className="text-[10px] text-background/50 mt-1 mb-3 leading-snug">
                Choose your preferred method to receive our customised offers and marketing communications.
              </p>

              <div className="space-y-2">
                {[
                  { label: "Push", value: pushEnabled, setter: setPushEnabled },
                  { label: "Email", value: emailEnabled, setter: setEmailEnabled },
                  { label: "SMS", value: smsEnabled, setter: setSmsEnabled },
                  { label: "Chat apps", value: chatEnabled, setter: setChatEnabled },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between bg-background/10 rounded-xl px-3 py-2.5"
                  >
                    <span className="text-sm font-medium text-background">{item.label}</span>
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.setter}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-lg h-10 text-sm font-semibold mt-5 bg-transparent border border-background/30 text-background hover:bg-background/10"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>

    <SavedAddressModal
      open={!!addressModalType}
      onOpenChange={(o) => { if (!o) setAddressModalType(null); }}
      addressType={addressModalType || "home"}
      onSave={() => setSavedAddresses(getSavedAddresses())}
    />

    <FavoritePartnersModal
      open={favoritesOpen}
      onOpenChange={setFavoritesOpen}
    />
  </>
  );
};
