import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import profileIcon from "@/assets/profile-icon.png";

interface UpdateProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const UpdateProfileModal = ({ open, onOpenChange }: UpdateProfileModalProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "";
  const [editName, setEditName] = useState(displayName);
  const avatarUrl = previewUrl || user?.user_metadata?.avatar_url;
  const email = user?.email || "";
  const phone = user?.phone || user?.user_metadata?.phone || "";

  const hasChanges = editName !== displayName || previewUrl !== null;

  useEffect(() => {
    setEditName(displayName);
  }, [displayName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);

    const nameParts = editName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const courialToken = localStorage.getItem("courial_api_token") || "";

      const res = await fetch(`${SUPABASE_URL}/functions/v1/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${session?.access_token || ""}`,
          "x-courial-token": courialToken,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
      } else {
        // Refresh local session to pick up new metadata
        await supabase.auth.refreshSession();
        toast.success("Profile updated");
        onOpenChange(false);
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
    setSaving(false);
  };

  const handleClose = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setEditingName(false);
      setEditName(displayName);
      setPreviewUrl(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[16rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col items-center">
            <DialogTitle className="sr-only">Update Profile</DialogTitle>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center mt-1 mb-5">Profile</h1>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-background/30">
                  <AvatarImage src={avatarUrl} alt="Profile" />
                  <AvatarFallback className="bg-background/20 p-0 flex items-center justify-center">
                    <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain invert" />
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-background text-foreground flex items-center justify-center shadow-md hover:bg-background/90 transition-colors"
                >
                  <Camera className="h-3 w-3" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-[10px] text-background/60 text-center max-w-[220px] leading-snug">
                Tap your name to update it. To change email or phone,{" "}
                <Link to="/help#contact" className="text-background hover:text-background/50 transition-colors" onClick={() => handleClose(false)}>
                  contact support
                </Link>.
              </p>
            </div>

            {/* Info Fields */}
            <div className="w-full space-y-0">
              {/* Name — tap to edit */}
              <div
                className="py-3 border-b border-background/20 cursor-pointer"
                onClick={() => !editingName && setEditingName(true)}
              >
                <span className="text-[10px] font-bold text-background/50 uppercase tracking-wider">Name</span>
                {editingName ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => setEditingName(false)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                    className="mt-1 h-7 text-xs bg-transparent border-primary text-background placeholder:text-background/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-background mt-0.5 font-medium">{editName || "—"}</p>
                )}
              </div>
              <div className="py-3 border-b border-background/20">
                <span className="text-[10px] font-bold text-background/50 uppercase tracking-wider">Phone</span>
                <p className="text-sm text-background/70 mt-0.5">{phone || "—"}</p>
              </div>
              <div className="py-3 border-b border-background/20">
                <span className="text-[10px] font-bold text-background/50 uppercase tracking-wider">Email</span>
                <p className="text-sm text-background/70 mt-0.5">{email || "—"}</p>
              </div>
            </div>

            {/* Footer */}
            <Button
              onClick={hasChanges ? handleSave : () => handleClose(false)}
              disabled={saving}
              className="w-full rounded-lg h-10 text-sm font-semibold mt-5 bg-transparent border border-background/30 text-background hover:bg-background/10"
            >
              {saving ? "Saving…" : hasChanges ? "Save" : "Close"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
