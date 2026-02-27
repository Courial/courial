import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Home, Building2, Heart, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import profileIcon from "@/assets/profile-icon.png";

const AccountSettings = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [commuteOpen, setCommuteOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);

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
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-secondary p-0 flex items-center justify-center">
                <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground">{phone || "No phone"}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Saved Places */}
          <div className="space-y-0">
            <button className="flex items-center gap-4 w-full py-5 border-b border-border text-left hover:bg-accent/50 transition-colors rounded-lg px-2 -mx-2">
              <Home className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Home</p>
                <p className="text-sm text-muted-foreground">Add home</p>
              </div>
            </button>

            <button className="flex items-center gap-4 w-full py-5 border-b border-border text-left hover:bg-accent/50 transition-colors rounded-lg px-2 -mx-2">
              <Building2 className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Work</p>
                <p className="text-sm text-muted-foreground">Add work</p>
              </div>
            </button>

            <button className="flex items-center gap-4 w-full py-5 border-b border-border text-left hover:bg-accent/50 transition-colors rounded-lg px-2 -mx-2">
              <Heart className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Favorite Partners</p>
                <p className="text-sm text-muted-foreground">View your favorite chauffeurs</p>
              </div>
            </button>
          </div>

          {/* Location Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>

            <button
              onClick={() => setCommuteOpen(!commuteOpen)}
              className="flex items-center justify-between w-full py-4 px-2 -mx-2 hover:bg-accent/50 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Bell className="h-6 w-6 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Commute alerts</p>
                  <p className="text-sm text-muted-foreground">Commute alerts</p>
                </div>
              </div>
              {commuteOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Offers Section */}
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">Offers from Courial</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Choose your preferred method to receive our customised offers (based on your profile from time to time) and marketing communications.
            </p>

            <div className="space-y-3">
              {[
                { label: "Push", value: pushEnabled, setter: setPushEnabled },
                { label: "Email", value: emailEnabled, setter: setEmailEnabled },
                { label: "SMS", value: smsEnabled, setter: setSmsEnabled },
                { label: "Chat apps", value: chatEnabled, setter: setChatEnabled },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between bg-secondary/50 rounded-xl px-5 py-4"
                >
                  <span className="font-medium text-foreground">{item.label}</span>
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
      </main>
      <Footer />
    </div>
  );
};

export default AccountSettings;
