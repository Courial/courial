import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell, Clock, CalendarIcon } from "lucide-react";
import { Hero } from "@/components/Hero";
import { LogoTicker } from "@/components/LogoTicker";
import { BentoGrid } from "@/components/BentoGrid";
import { TechShowcase } from "@/components/TechShowcase";
import { Testimonials } from "@/components/Testimonials";
import { Footer } from "@/components/Footer";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import chauffeurImage from "@/assets/chauffeur-service.jpg";
import deliverBox from "@/assets/deliver-box.png";
import walkerIcon from "@/assets/walker-icon.png";
import bikeIcon from "@/assets/bike-icon.png";
import carIcon from "@/assets/car-icon.png";
import truckIcon from "@/assets/truck-icon.png";

type VehicleId = "walker" | "scooter" | "car" | "truck";
const vehicleOptions: { id: VehicleId; label: string; image: string; sizeClass: string }[] = [
  { id: "walker", label: "Walker", image: walkerIcon, sizeClass: "w-[72px] h-[50px]" },
  { id: "scooter", label: "Scooter", image: bikeIcon, sizeClass: "w-[51px] h-[35px]" },
  { id: "car", label: "Car", image: carIcon, sizeClass: "w-[88px] h-[62px]" },
  { id: "truck", label: "Truck", image: truckIcon, sizeClass: "w-20 h-14" },
];

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
  const [timeMode, setTimeMode] = useState<"now" | "later">("now");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId | null>(null);

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

            {/* Title row with box icon + Now/Later toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              key={selectedService}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedService === "deliver" && (
                    <img src={deliverBox} alt="Delivery box" className="w-10 h-10" />
                  )}
                  <h1 className="text-3xl font-bold text-foreground">
                    {serviceCards.find(s => s.id === selectedService)!.label}
                  </h1>
                </div>

                {/* Now / Later pill toggle */}
                <div className="flex bg-muted rounded-full p-1 gap-0.5">
                  <button
                    onClick={() => setTimeMode("now")}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                      timeMode === "now"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Now
                  </button>
                  <button
                    onClick={() => setTimeMode("later")}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                      timeMode === "later"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    Later
                  </button>
                </div>
              </div>

              {/* Date/Time picker when "Later" is selected */}
              <AnimatePresence>
                {timeMode === "later" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex-1 justify-start text-left font-normal rounded-xl h-11",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="relative">
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-foreground transition-colors w-[110px]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Vehicle type icons for Deliver */}
              {selectedService === "deliver" && (
                <div className="flex gap-4 mb-6 justify-center">
                  {vehicleOptions.map((v) => {
                    const isActive = selectedVehicle === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(isActive ? null : v.id)}
                        className="p-1 bg-transparent border-none outline-none cursor-pointer"
                      >
                        <div className={cn(
                          `${v.sizeClass} flex items-center justify-center transition-all duration-300`,
                          isActive ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-30 scale-100"
                        )}>
                          <img src={v.image} alt={v.label} className="max-w-full max-h-full object-contain" />
                        </div>
                      </button>
                    );
                  })}
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
              disabled={!(pickup.trim().length > 0 && dropoff.trim().length > 0)}
              className="w-full mt-6 rounded-xl h-12"
              variant={pickup.trim().length > 0 && dropoff.trim().length > 0 ? "hero" : "secondary"}
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Right Column — Map Placeholder */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          {pickup.trim().length > 0 && dropoff.trim().length > 0 ? (
            <div className="flex-1 bg-muted relative flex items-center justify-center">
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
          ) : (
            <div className="flex-1 overflow-y-auto">
              <Hero />
              <LogoTicker />
              <BentoGrid />
              <TechShowcase />
              <Testimonials />
              <Footer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;
