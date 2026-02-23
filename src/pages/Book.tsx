import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, ArrowDownUp, Store, Car, ParkingCircle, PackageOpen, ConciergeBell } from "lucide-react";
import { Button } from "@/components/ui/button";
import chauffeurImg from "@/assets/chauffeur-illustration.png";
import deliverImg from "@/assets/illustration-delivery.png";
import conciergeImg from "@/assets/concierge-task-icon.png";

type ServiceTab = "send" | "receive" | "store";

const Book = () => {
  const [activeTab, setActiveTab] = useState<ServiceTab>("send");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const isSearchEnabled = pickup.trim().length > 0 && dropoff.trim().length > 0;

  const tabs: { id: ServiceTab; label: string; sublabel?: string }[] = [
    { id: "send", label: "Send" },
    { id: "receive", label: "Receive" },
    { id: "store", label: "Store", sublabel: "Pickup" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Book a Courier — Courial</title>
        <meta name="description" content="Send packages, receive deliveries, or schedule store pickups with Courial's premium courier service." />
      </Helmet>
      <Navbar />

      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Left Column — Booking Card */}
        <div className="w-full max-w-[440px] flex-shrink-0 border-r border-border overflow-y-auto">
          <div className="p-8">
            {/* Service Bento Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-2 mb-6"
            >
              {[
                { label: "Chauffeur", href: "/chauffeur", img: chauffeurImg, icon: Car },
                { label: "Valet", href: "/book", img: null, icon: ParkingCircle },
                { label: "Deliver", href: "/book", img: deliverImg, icon: PackageOpen },
                { label: "Concierge", href: "/book", img: conciergeImg, icon: ConciergeBell },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="group relative rounded-xl bg-muted border border-border overflow-hidden h-[90px] flex flex-col justify-between p-3 hover:border-foreground/30 hover:shadow-sm transition-all duration-200"
                >
                  <span className="text-sm font-bold text-foreground z-10">{item.label}</span>
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.label}
                      className="absolute bottom-0 right-0 w-16 h-16 object-contain opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <item.icon className="absolute bottom-2 right-2 w-10 h-10 text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors" />
                  )}
                </Link>
              ))}
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-bold text-foreground mb-2">Courier</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Have a courier deliver something for you. Get packages delivered in the time it takes to drive there.
              </p>
            </motion.div>

            {/* Service Tabs */}
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                    ${activeTab === tab.id
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground hover:bg-muted/80 border border-transparent hover:border-border"
                    }
                  `}
                >
                  {tab.sublabel ? (
                    <span className="flex flex-col items-center leading-tight">
                      <span>{tab.label}</span>
                      <span className="text-xs font-medium opacity-80">{tab.sublabel}</span>
                    </span>
                  ) : (
                    tab.label
                  )}
                </button>
              ))}
            </div>

            {/* Input Fields */}
            <div className="space-y-0">
              {/* Pickup */}
              <div className="relative group">
                <div className="flex items-center gap-3 px-4 py-4 border border-border rounded-t-xl bg-background transition-colors focus-within:border-foreground">
                  <div className="flex-shrink-0 w-3 h-3 rounded-full border-[2.5px] border-foreground" />
                  <input
                    type="text"
                    placeholder="Pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>

              {/* Dropoff */}
              <div className="relative group">
                <div className="flex items-center gap-3 px-4 py-4 border border-border border-t-0 rounded-b-xl bg-background transition-colors focus-within:border-foreground">
                  <div className="flex-shrink-0 w-3 h-3 bg-foreground" />
                  <input
                    type="text"
                    placeholder="Dropoff location"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Search Button */}
            <Button
              disabled={!isSearchEnabled}
              className="w-full mt-6 rounded-xl h-12"
              variant={isSearchEnabled ? "hero" : "secondary"}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

            {/* Tab-specific content */}
            {activeTab === "receive" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-5 rounded-xl bg-muted/50 border border-border"
              >
                <div className="flex items-start gap-3">
                  <ArrowDownUp className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Receiving a package?</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Enter the sender's location as pickup and your address as dropoff. We'll handle the rest.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "store" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 p-5 rounded-xl bg-muted/50 border border-border"
              >
                <div className="flex items-start gap-3">
                  <Store className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Store Pickup</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Enter the store address as pickup and your delivery address as dropoff. We'll pick up your order and bring it to you.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column — Map Placeholder */}
        <div className="hidden md:flex flex-1 bg-muted relative items-center justify-center overflow-hidden">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Center content */}
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MapPin className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Map view coming soon</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Google Maps integration</p>
          </div>

          {/* Zoom controls placeholder */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-0.5">
            <button className="w-10 h-10 bg-background border border-border rounded-t-lg flex items-center justify-center text-foreground text-lg font-medium hover:bg-muted transition-colors">
              +
            </button>
            <button className="w-10 h-10 bg-background border border-border rounded-b-lg flex items-center justify-center text-foreground text-lg font-medium hover:bg-muted transition-colors">
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
