import React, { useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell, Clock, CalendarIcon, ChevronDown } from "lucide-react";

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
import AddressAutocomplete from "@/components/booking/AddressAutocomplete";
import BookingMap from "@/components/booking/BookingMap";
import chauffeurImage from "@/assets/chauffeur-service.jpg";
import deliverBox from "@/assets/deliver-box.png";
import vehicleWalker from "@/assets/vehicle-walker.png";
import vehicleScooter from "@/assets/vehicle-scooter.png";
import vehicleCar from "@/assets/vehicle-car.png";
import vehicleVan from "@/assets/vehicle-van.png";
import vehicleTruck from "@/assets/vehicle-truck.png";


type VehicleId = "walker" | "scooter" | "car" | "van" | "truck";
const vehicleCaptions: Record<VehicleId, string> = {
  walker: "Best for food, documents, small parcels",
  scooter: "Best for catering trays, small electronics, grocery",
  car: "Best for retail, small appliances",
  van: "Best for furniture, medium appliances",
  truck: "Best for moves, palletized freight, commercial loads",
};
const vehicleOptions: { id: VehicleId; label: string; image: string; imgClass?: string }[] = [
  { id: "walker", label: "Walker", image: vehicleWalker, imgClass: "max-h-[38px]" },
  { id: "scooter", label: "Scooter", image: vehicleScooter, imgClass: "max-h-[30px]" },
  { id: "car", label: "Car", image: vehicleCar, imgClass: "max-h-[32px]" },
  { id: "van", label: "Van", image: vehicleVan, imgClass: "max-h-[32px]" },
  { id: "truck", label: "Truck", image: vehicleTruck, imgClass: "max-h-[32px]" },
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
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [timeMode, setTimeMode] = useState<"now" | "later">("now");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId | null>(null);
  const [showAllServices, setShowAllServices] = useState(true);

  const handlePickupSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setPickupCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
  }, []);

  const handleDropoffSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setDropoffCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
    }
  }, []);

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
              className="mb-6"
            >
              {/* Collapsed: show only selected card full-width */}
              {!showAllServices && (
                <div className="relative">
                  {(() => {
                    const item = serviceCards.find(s => s.id === selectedService)!;
                    return (
                      <div className="group relative rounded-2xl glass-card overflow-hidden h-[80px] p-4 flex items-center gap-4 border-primary border-2 transition-all duration-300">
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            backgroundImage: `url(${item.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
                        <div className="relative z-10 flex items-center gap-3 flex-1">
                          <div className="flex gap-1.5">
                            {item.icons.map((Icon, idx) => (
                              <div key={idx} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                                <Icon className="w-4 h-4 text-foreground" />
                              </div>
                            ))}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{item.label}</h3>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-1">{item.desc.split('\n')[0]}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAllServices(true)}
                          className="relative z-10 w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <ChevronDown className="w-4 h-4 text-foreground" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Expanded: show all service cards in grid */}
              <AnimatePresence>
                {showAllServices && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3">
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
                            setShowAllServices(false);
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="mb-6">
                  <div className="flex items-end justify-center gap-4">
                    {vehicleOptions.map((v) => {
                      const isActive = selectedVehicle === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVehicle(isActive ? null : v.id)}
                          className="bg-transparent border-none outline-none cursor-pointer flex items-center"
                        >
                          <div className={cn(
                            "h-[36px] flex items-end justify-center transition-all duration-300",
                            isActive ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-30 scale-100"
                          )}>
                            <img src={v.image} alt={v.label} className={cn("object-contain", v.imgClass)} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence mode="wait">
                    {selectedVehicle && (
                      <motion.p
                        key={selectedVehicle}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-muted-foreground text-center mt-2"
                      >
                        {vehicleCaptions[selectedVehicle]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            <AnimatePresence>
              {selectedVehicle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {/* Input Fields */}
                  <div className="space-y-0">
                    <div className="relative group">
                      <div className="flex items-center gap-3 px-4 py-4 border border-border rounded-t-xl bg-background transition-colors focus-within:border-foreground">
                        <div className="flex-shrink-0 w-3 h-3 rounded-full border-[2.5px] border-foreground" />
                        <AddressAutocomplete
                          placeholder="Pickup location"
                          value={pickup}
                          onChange={setPickup}
                          onPlaceSelect={handlePickupSelect}
                          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="flex items-center gap-3 px-4 py-4 border border-border border-t-0 rounded-b-xl bg-background transition-colors focus-within:border-foreground">
                        <div className="flex-shrink-0 w-3 h-3 bg-foreground" />
                        <AddressAutocomplete
                          placeholder="Dropoff location"
                          value={dropoff}
                          onChange={setDropoff}
                          onPlaceSelect={handleDropoffSelect}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column — Map Placeholder */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          {pickupCoords || dropoffCoords ? (
            <div className="flex-1">
              <BookingMap pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} pickupAddress={pickup} dropoffAddress={dropoff} />
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
