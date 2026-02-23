import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import chauffeurImage from "@/assets/chauffeur-service.jpg";
import deliverBox from "@/assets/deliver-box.png";
import deliverVehicles from "@/assets/deliver-vehicles.png";

type ServiceId = "deliver" | "concierge" | "chauffeur" | "valet";

const serviceCards: { id: ServiceId; label: string; desc: string; href: string; external?: boolean; image: string; icons: LucideIcon[] }[] = [
  { id: "deliver", label: "Deliver", desc: "Your products deserve more than just a driver. They deserve Courial.", href: "/book", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80", icons: [Box] },
  { id: "concierge", label: "Concierge", desc: "Whatever. Whenever.\nIf it's possible, we'll get it done.", href: "/book", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80", icons: [ConciergeBell] },
  { id: "chauffeur", label: "Chauffeur", desc: "Professional drivers, ready when you need more than just a ride.", href: "https://chauffeured.ai/booking", external: true, image: chauffeurImage, icons: [CarFront] },
  { id: "valet", label: "Valet", desc: "More than parking. We park it, charge it, or drive it—whatever you need.", href: "/book", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80", icons: [ParkingCircle, Leaf] },
];

const Book = () => {
  const [selectedService, setSelectedService] = useState<ServiceId>("deliver");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const isSearchEnabled = pickup.trim().length > 0 && dropoff.trim().length > 0;
  const selected = serviceCards.find(s => s.id === selectedService)!;

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
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {serviceCards.map((item) => {
                const isSelected = selectedService === item.id;
                const cardContent = (
                  <>
                    <div
                      className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                      style={{
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex gap-1.5 mb-auto">
                        {item.icons.map((Icon, idx) => (
                          <div key={idx} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                            <Icon className="w-5 h-5 text-foreground" />
                          </div>
                        ))}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-0.5 group-hover:text-primary transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-snug whitespace-pre-line">{item.desc}</p>
                      </div>
                    </div>
                  </>
                );
                const cardClass = `group relative rounded-2xl glass-card overflow-hidden h-[160px] p-4 flex flex-col transition-all duration-300 ${isSelected ? "border-primary border-2" : "hover:border-primary/50"}`;

                const handleClick = (e: React.MouseEvent) => {
                  if (!item.external) {
                    e.preventDefault();
                    setSelectedService(item.id);
                  }
                };

                return item.external ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={cardClass}>
                    {cardContent}
                  </a>
                ) : (
                  <Link key={item.label} to={item.href} onClick={handleClick} className={cardClass}>
                    {cardContent}
                  </Link>
                );
              })}
            </motion.div>

            {/* Title with box icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              key={selectedService}
            >
              <div className="flex items-center gap-3 mb-4">
                {selectedService === "deliver" && (
                  <img src={deliverBox} alt="Delivery box" className="w-10 h-10" />
                )}
                <h1 className="text-3xl font-bold text-foreground">{selected.label}</h1>
              </div>

              {/* Vehicle types for Deliver */}
              {selectedService === "deliver" && (
                <div className="mb-6">
                  <img src={deliverVehicles} alt="Vehicle types — walker, scooter, car, truck" className="w-full max-w-[360px]" />
                </div>
              )}
            </motion.div>

            {/* Input Fields */}
            <div className="space-y-0">
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
          </div>
        </div>

        {/* Right Column — Map Placeholder */}
        <div className="hidden md:flex flex-1 bg-muted relative items-center justify-center overflow-hidden">
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
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4 shadow-sm">
              <MapPin className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Map view coming soon</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Google Maps integration</p>
          </div>
          <div className="absolute bottom-6 right-6 flex flex-col gap-0.5">
            <button className="w-10 h-10 bg-background border border-border rounded-t-lg flex items-center justify-center text-foreground text-lg font-medium hover:bg-muted transition-colors">+</button>
            <button className="w-10 h-10 bg-background border border-border rounded-b-lg flex items-center justify-center text-foreground text-lg font-medium hover:bg-muted transition-colors">−</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
