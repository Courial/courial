import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell, Clock, CalendarIcon, ChevronDown, Info, Plus, Trash2, CreditCard } from "lucide-react";
import visaIcon from "@/assets/card-icons/visa.svg";
import mastercardIcon from "@/assets/card-icons/mastercard.svg";
import amexIcon from "@/assets/card-icons/amex.svg";
import discoverIcon from "@/assets/card-icons/discover.svg";

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
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [timeMode, setTimeMode] = useState<"now" | "later">("now");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId | null>(null);
  const [showAllServices, setShowAllServices] = useState(true);
  const [notes, setNotes] = useState("");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("visa-4242");
  const [over70lbs, setOver70lbs] = useState<boolean | null>(null);
  const [twoCourials, setTwoCourials] = useState<boolean | null>(null);
  const [hasStairs, setHasStairs] = useState<boolean | null>(null);

  const paymentMethods = [
    { id: "visa-4242", type: "visa", label: "Visa", last4: "4242", icon: visaIcon },
    { id: "mc-8831", type: "mastercard", label: "Mastercard", last4: "8831", icon: mastercardIcon },
  ];

  const activePayment = paymentMethods.find(p => p.id === selectedPaymentMethod) || paymentMethods[0];

  const isFormValid = pickup.trim().length > 0 && dropoff.trim().length > 0 && selectedVehicle !== null && notes.trim().length > 0;

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
              {!showAllServices && selectedService && (
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
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2 whitespace-pre-line">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setShowAllServices(true); setSelectedService(null); }}
                          className="relative z-10 w-10 h-10 rounded-xl bg-muted/15 hover:bg-muted/25 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <ChevronDown className="w-3.5 h-3.5 text-foreground" />
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

            {/* Title row with box icon + Now/Later toggle — only when service selected */}
            {selectedService && (
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

              {/* Quick Options Pills — before vehicle selection */}
              {selectedService === "deliver" && (
                <div className="mb-4">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {([
                      { label: "Over 70 lbs", value: over70lbs, setter: setOver70lbs },
                      { label: "Require 2 Courials", value: twoCourials, setter: setTwoCourials },
                      { label: "Involves stairs", value: hasStairs, setter: setHasStairs },
                    ] as const).map(({ label, value, setter }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          const newVal = value === true ? null : true;
                          setter(newVal);
                          // Reset vehicle if it becomes unavailable
                          if (label === "Over 70 lbs" && newVal === true && (selectedVehicle === "walker" || selectedVehicle === "scooter")) {
                            setSelectedVehicle(null);
                          }
                          if (label === "Require 2 Courials" && newVal === true && selectedVehicle !== "van" && selectedVehicle !== "truck") {
                            setSelectedVehicle(null);
                          }
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-normal transition-all border leading-none",
                          value === true
                            ? "bg-background text-foreground border-primary"
                            : "bg-background text-foreground/75 border-border/60 hover:border-foreground"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle type icons for Deliver */}
              {selectedService === "deliver" && (
                <div className="mb-6">
                  <div className="flex items-end justify-center gap-4">
                    {vehicleOptions.filter((v) => {
                      if (twoCourials === true && v.id !== "van" && v.id !== "truck") return false;
                      if (over70lbs === true && (v.id === "walker" || v.id === "scooter")) return false;
                      return true;
                    }).map((v) => {
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
            )}

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
                      <div className="flex items-center gap-3 px-4 py-4 border border-border rounded-xl bg-background transition-colors focus-within:border-foreground mb-2">
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500" />
                        <AddressAutocomplete
                          placeholder="Pickup location"
                          value={pickup}
                          onChange={setPickup}
                          onPlaceSelect={handlePickupSelect}
                          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        />
                      </div>
                    </div>
                    <div className="relative group mt-2">
                      <div className="flex items-center gap-3 px-4 py-4 border border-border rounded-xl bg-background transition-colors focus-within:border-foreground">
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500" />
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

                  {/* Notes Field */}
                  <div className="relative group mt-2.5">
                    <div className="flex items-start gap-3 px-4 py-4 border border-border rounded-xl bg-background transition-colors focus-within:border-foreground">
                      <textarea
                        placeholder="Provide all relevant pickup and drop-off details, including contact numbers, special instructions, access information, gate codes, and any other important notes."
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/35 outline-none resize-none overflow-hidden"
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                      />
                    </div>
                  </div>

                  {/* Delivery Requirements Notice */}
                  <Collapsible className="mt-3 text-xs text-foreground">
                    <CollapsibleTrigger className="flex items-center gap-1 font-semibold cursor-pointer hover:opacity-70 transition-opacity">
                      Delivery Requirements
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-2">
                      <div>
                        <p className="text-muted-foreground leading-relaxed">Before placing your order, please ensure your shipment meets the following criteria:</p>
                        <ul className="text-muted-foreground leading-relaxed mt-1 space-y-0.5">
                          <li>• The total declared value does not exceed $300</li>
                          <li>• Items are properly packaged, sealed, and ready at the time of pickup</li>
                          <li>• Contents do not fall under restricted categories</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Restricted Items</p>
                        <p className="text-muted-foreground leading-relaxed">Courial does not transport alcohol, prescription or non-prescription drugs, firearms, hazardous materials, illegal goods, or items with significant sentimental or irreplaceable value.</p>
                        <p className="text-muted-foreground leading-relaxed mt-1">All shipments must comply with local, state, and federal laws, as well as Courial's platform policies. Orders involving restricted or unlawful items may be canceled, and accounts may be suspended or terminated. Courial reserves the right to cooperate with law enforcement in cases involving illegal activity.</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Insurance & Agreement</p>
                        <p className="text-muted-foreground leading-relaxed">Courial does not provide cargo insurance coverage. By confirming your delivery request, you acknowledge and accept Courial's Terms and Conditions.</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Pricing & Payment Section */}
                  <div className="mt-3 rounded-2xl border border-border bg-background p-5">
                    {/* Total Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-bold text-foreground">Fee estimate</span>
                        <button type="button" onClick={() => setShowPriceBreakdown(true)} className="cursor-pointer hover:opacity-70 transition-opacity">
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <span className="text-lg font-bold text-foreground">$21.59</span>
                    </div>

                    <div className="border-t border-border my-4" />

                    {/* Payment Method + Request Button */}
                    <div className="flex items-center gap-3">
                      {/* Payment Card Icon + Down Arrow */}
                      <button
                        onClick={() => setShowPaymentMethods(true)}
                        className="flex items-center gap-1 flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <img src={activePayment.icon} alt={activePayment.label} className="w-12 h-auto rounded" />
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </button>

                      {/* Request Delivery Button */}
                      <Button
                        disabled={!isFormValid}
                        className="flex-1 rounded h-8 text-base font-semibold"
                        variant={isFormValid ? "hero" : "secondary"}
                      >
                        Book Delivery
                      </Button>
                    </div>
                  </div>
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
      {/* Price Breakdown Dialog */}
      <Dialog open={showPriceBreakdown} onOpenChange={setShowPriceBreakdown}>
        <DialogContent className="sm:max-w-md bg-background border-border !rounded-[25px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden">
          <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={deliverBox} alt="Deliver" className="w-8 h-8" />
                <span className="text-[1.65rem] font-bold text-foreground">Deliver</span>
                {selectedVehicle && (
                  <img src={vehicleOptions.find(v => v.id === selectedVehicle)!.image} alt={selectedVehicle} className="h-6 object-contain" />
                )}
              </div>
            </div>
          </div>
          <div className="px-7">
          <div className="mb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">Fare Summary</DialogTitle>
          </div>

          <div className="space-y-4 mb-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your delivery rate is calculated in advance using distance, estimated time, and the selected vehicle type. The price shown before checkout reflects the projected cost of completing your delivery efficiently and on time.
            </p>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              By confirming your request, you authorize Courial to charge the estimated amount, along with any applicable wait time or route-related adjustments.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Final pricing may vary if the completed route includes tolls or surcharges not reflected in the initial estimate, if the delivery distance or duration differs from the original request, if pickup or drop-off conditions require additional time, or if real-time demand necessitates dynamic pricing adjustments.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Our pricing model is designed to ensure reliability, availability, and fair compensation across the network.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Rate Structure</h3>
            <div className="space-y-3">
              {[
                { label: "Base Fee", value: "$0.09", muted: false },
                { label: "Minimum Charge", value: "$5.40", muted: false },
                { label: "Per Minute", value: "$0.25", muted: true },
                { label: "Per Mile", value: "$0.93", muted: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className={`text-sm ${row.muted ? 'text-foreground/50' : 'font-semibold text-foreground'}`}>{row.label}</span>
                  <div className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                  <span className={`text-sm ${row.muted ? 'text-foreground/50' : 'font-semibold text-foreground'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          </div>
          <div className="bg-muted/80 px-7 py-2">
            <div className="flex items-center justify-between">
              <span className="text-base text-foreground">Fare Estimate</span>
              <span className="text-base font-bold text-foreground">$21.59</span>
            </div>
          </div>
          <div className="px-7 pb-7">

          <div className="mb-6">
            <h3 className="text-xs font-bold text-foreground mb-1">Wait Time Policy</h3>
            <p className="text-[0.625rem] text-muted-foreground leading-relaxed">
              Courials are scheduled to begin service promptly upon arrival.
              After a 2-minute grace period, wait time is billed at:
            </p>
            <p className="text-[0.625rem] font-bold text-foreground mt-1">$0.50 per additional minute</p>
          </div>

          <Button
            onClick={() => setShowPriceBreakdown(false)}
            className="w-auto mx-auto rounded-xl h-9 px-8 text-sm font-semibold"
            variant="hero"
          >
            Close
          </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={showPaymentMethods} onOpenChange={setShowPaymentMethods}>
        <DialogContent className="sm:max-w-md bg-background border-border !rounded-[25px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden">
          <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
            <div className="flex items-center gap-3">
              <CreditCard className="w-7 h-7 text-foreground" />
              <span className="text-[1.65rem] font-bold text-foreground">Payment</span>
            </div>
          </div>

          <div className="px-7 pb-2">
            <DialogTitle className="text-2xl font-bold text-foreground mb-4">Your Methods</DialogTitle>

            {/* Saved Cards */}
            <div className="space-y-3 mb-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => {
                    setSelectedPaymentMethod(method.id);
                    setShowPaymentMethods(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedPaymentMethod === method.id
                      ? "border-foreground bg-muted/60"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <img src={method.icon} alt={method.label} className="w-10 h-auto rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{method.label}</p>
                    <p className="text-xs text-muted-foreground">•••• {method.last4}</p>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <div className="w-2 h-2 rounded-full bg-foreground" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Card */}
            <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-dashed border-border hover:bg-muted/40 transition-colors mb-6">
              <div className="w-10 h-7 rounded bg-muted flex items-center justify-center">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">Add credit or debit card</span>
            </button>

            {/* Alternative Payment Methods */}
            <div className="mb-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Other methods</p>
              <div className="space-y-3">
                <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                  <div className="w-10 h-7 rounded bg-[#003087] flex items-center justify-center">
                    <span className="text-[0.5rem] font-bold italic text-white">Pay<span className="text-[#009cde]">Pal</span></span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">PayPal</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                  <div className="w-10 h-7 rounded bg-foreground flex items-center justify-center">
                    <span className="text-[0.5rem] font-bold text-background tracking-tight"> Pay</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">Apple Pay</span>
                </button>
              </div>
            </div>
          </div>

          <div className="px-7 pb-7">
            <Button
              onClick={() => setShowPaymentMethods(false)}
              className="w-auto mx-auto rounded-xl h-9 px-8 text-sm font-semibold"
              variant="hero"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Book;
