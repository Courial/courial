import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserRoundPen, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import profileIcon from "@/assets/profile-icon.png";

interface UpdateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UpdateProfileModal = ({ open, onOpenChange }: UpdateProfileModalProps) => {
  const { user } = useAuth();

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
              <UserRoundPen className="w-7 h-7 text-foreground" />
              <span className="text-[1.65rem] font-bold text-foreground">Profile</span>
            </div>
          </div>

          <div className="px-7 pb-2">
            <DialogTitle className="text-2xl font-bold text-foreground mb-6">Update Profile</DialogTitle>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-border">
                  <AvatarImage src={avatarUrl} alt="Profile" />
                  <AvatarFallback className="bg-secondary p-0 flex items-center justify-center">
                    <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:bg-foreground/90 transition-colors">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-[260px] mt-1">
                Tap your name anytime to update it. To change your email or phone,{" "}
                <Link to="/help#contact" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
                  contact support
                </Link>{" "}
                — those fields are locked for security.
              </p>
            </div>

            {/* Info Fields */}
            <div className="space-y-0 mt-4">
              <div className="py-3.5 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</span>
                <p className="text-sm text-foreground mt-0.5 font-medium">{displayName || "—"}</p>
              </div>
              <div className="py-3.5 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone</span>
                <p className="text-sm text-foreground mt-0.5 font-medium">{phone || "—"}</p>
              </div>
              <div className="py-3.5 border-b border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</span>
                <p className="text-sm text-foreground mt-0.5 font-medium">{email || "—"}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pt-4 pb-7 space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-xl h-10 text-sm font-semibold border-2 border-foreground"
              disabled
            >
              Edit Info
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Profile editing coming soon.</p>
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
