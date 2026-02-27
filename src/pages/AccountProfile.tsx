import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import profileIcon from "@/assets/profile-icon.png";

const AccountProfile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email || "";
  const phone = user?.phone || user?.user_metadata?.phone || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-lg">
          {/* Header */}
          <div className="flex items-center gap-3 mb-10">
            <button
              onClick={() => navigate(-1)}
              className="text-foreground hover:text-muted-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Update Profile</h1>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="relative">
              <Avatar className="h-28 w-28 border-2 border-border">
                <AvatarImage src={avatarUrl} alt="Profile" />
                <AvatarFallback className="bg-secondary p-0 flex items-center justify-center">
                  <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:bg-foreground/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-xs mt-2">
              Tap your name anytime to update it.{" "}
              To change your email or phone,{" "}
              <Link to="/help#contact" className="text-primary hover:underline">
                contact support
              </Link>{" "}
              — those fields are locked for security.
            </p>
          </div>

          {/* Info Fields */}
          <div className="space-y-0 mt-8">
            <div className="py-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Name</span>
              <p className="text-base text-muted-foreground mt-0.5">{displayName || "—"}</p>
            </div>
            <div className="py-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Phone</span>
              <p className="text-base text-muted-foreground mt-0.5">{phone || "—"}</p>
            </div>
            <div className="py-4 border-b border-border">
              <span className="text-sm font-semibold text-foreground">Email</span>
              <p className="text-base text-muted-foreground mt-0.5">{email || "—"}</p>
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            className="w-full mt-8 h-12 rounded-full text-base font-medium border-2 border-foreground"
            disabled
          >
            Edit Info
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">Profile editing coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountProfile;
