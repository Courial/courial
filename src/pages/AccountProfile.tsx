import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import profileIcon from "@/assets/profile-icon.png";

const AccountProfile = () => {
  const { user, loading } = useAuth();

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
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="text-2xl font-bold mb-8">Your Profile</h1>

          <div className="flex flex-col items-center gap-4 mb-8">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-secondary p-0 flex items-center justify-center">
                <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-5">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={displayName} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={email} disabled className="mt-1.5 opacity-60" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue={phone} disabled className="mt-1.5 opacity-60" />
            </div>
            <Button className="w-full mt-4" disabled>Save Changes</Button>
            <p className="text-xs text-muted-foreground text-center">Profile editing coming soon.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountProfile;
