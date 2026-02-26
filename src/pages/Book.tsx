import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell, Clock, CalendarIcon, ChevronDown, ChevronLeft, Info, Plus, Trash2, CreditCard, Star, X, Weight, Sparkles, Zap, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AddressAutocomplete from "@/components/booking/AddressAutocomplete";
import BookingMap from "@/components/booking/BookingMap";
import chauffeurImage from "@/assets/chauffeur-service.jpg";
import deliverBox from "@/assets/deliver-box.png";
import conciergeIcon from "@/assets/concierge-icon.png";
import vehicleWalker from "@/assets/vehicle-walker.png";
import vehicleScooter from "@/assets/vehicle-scooter.png";
import vehicleCar from "@/assets/vehicle-car.png";
import vehicleVan from "@/assets/vehicle-van.png";
import vehicleTruck from "@/assets/vehicle-truck.png";


type VehicleId = "walker" | "scooter" | "car" | "van" | "truck";
const vehicleCaptions: Record<VehicleId, string> = {
  walker: "Best for food and small parcels within 2 miles.",
  scooter: "Best for catering trays, small electronics, grocery",
  car: "Best for retail, small appliances",
  van: "Best for furniture, medium appliances",
  truck: "Best for moves, palletized freight, commercial loads",
};
const vehicleOptions: { id: VehicleId; label: string; image: string; imgClass?: string }[] = [
  { id: "walker", label: "Walker", image: vehicleWalker, imgClass: "max-h-[30px]" },
  { id: "scooter", label: "Scooter", image: vehicleScooter, imgClass: "max-h-[24px]" },
  { id: "car", label: "Car", image: vehicleCar, imgClass: "max-h-[24px]" },
  { id: "van", label: "Van", image: vehicleVan, imgClass: "max-h-[24px]" },
  { id: "truck", label: "Truck", image: vehicleTruck, imgClass: "max-h-[32px]" },
];

type ServiceId = "deliver" | "concierge" | "chauffeur" | "valet";

interface ConciergeCategory {
  id: string;
  label: string;
  desc: string;
  subs: string[];
}

const conciergeCategories: ConciergeCategory[] = [
  { id: "personal-assistant", label: "Personal Assistant", desc: "Dedicated PA support", subs: ["Film and TV", "Fashion", "Executive", "Real Estate", "Other"] },
  { id: "waiting", label: "Waiting", desc: "We wait so you don't", subs: ["Wait in Line", "Wait for Service Provider", "Be Somewhere for Me", "Get Documents Signed"] },
  { id: "notary", label: "Notary Services", desc: "Official notary support", subs: ["Certified Notary", "Notary Assistance"] },
  { id: "travel", label: "Travel", desc: "Trips, flights & logistics", subs: ["Plan Custom Itinerary", "Arrange Private Drivers", "Coordinate Multi-city Travel", "Book Activities & Reservations"] },
  { id: "something-else", label: "Something Else?", desc: "Whatever the task, consider it handled.", subs: [] },
];

const serviceCards: { id: ServiceId; label: string; desc: string; href: string; external?: boolean; image: string; icons: LucideIcon[] }[] = [
  { id: "deliver", label: "Deliver", desc: "Your products deserve more than just a driver. They deserve Courial.", href: "/book", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80", icons: [Box] },
  { id: "concierge", label: "Concierge", desc: "Whatever. Whenever.\nIf it's possible, we'll get it done.", href: "/book", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80", icons: [ConciergeBell] },
  { id: "chauffeur", label: "Chauffeur", desc: "Professional drivers, ready when you need more than just a ride.", href: "https://chauffeured.ai/booking", external: true, image: chauffeurImage, icons: [CarFront] },
  { id: "valet", label: "Valet", desc: "More than parking. We park it, charge it, or drive it—whatever you need.", href: "/book", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80", icons: [ParkingCircle, Leaf] },
];


const Book = () => {
  const { user } = useAuth();
  const deliveryIdRef = useRef<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupPlaceName, setPickupPlaceName] = useState<string | null>(null);
  const [dropoffPlaceName, setDropoffPlaceName] = useState<string | null>(null);
  const [timeMode, setTimeMode] = useState<"now" | "later">("now");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleId | null>(null);
  const [showAllServices, setShowAllServices] = useState(true);
  const [notes, setNotes] = useState("");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", isDefault: false });
  const [showCvv, setShowCvv] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("visa-4242");
  const [over70lbs, setOver70lbs] = useState<boolean | null>(null);
  const [heavyExpanded, setHeavyExpanded] = useState(false);
  const [heavyWeight, setHeavyWeight] = useState<string>("70");
  const [heavyItems, setHeavyItems] = useState<string>("1");
  const [twoCourials, setTwoCourials] = useState<boolean | null>(null);
  const [hasStairs, setHasStairs] = useState<boolean | null>(null);

  // Concierge-specific state
  const [conciergeVehicle, setConciergeVehicle] = useState<VehicleId | null>(null);
  const [conciergeCategory, setConciergeCategory] = useState<string | null>(null);
  const [conciergeSubCategory, setConciergeSubCategory] = useState<string | null>(null);
  const [conciergeAddressToggles, setConciergeAddressToggles] = useState({ start: false, stop: false, final: false });
  const [conciergeStartAddress, setConciergeStartAddress] = useState("");
  const [conciergeStopAddress, setConciergeStopAddress] = useState("");
  const [conciergeFinalAddress, setConciergeFinalAddress] = useState("");
  const [conciergeStartPlaceName, setConciergeStartPlaceName] = useState<string | null>(null);
  const [conciergeStopPlaceName, setConciergeStopPlaceName] = useState<string | null>(null);
  const [conciergeFinalPlaceName, setConciergeFinalPlaceName] = useState<string | null>(null);
  const [conciergeStartCoords, setConciergeStartCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [conciergeStopCoords, setConciergeStopCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [conciergeFinalCoords, setConciergeFinalCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [conciergeDescription, setConciergeDescription] = useState("");
  const [conciergeLanguage, setConciergeLanguage] = useState<string | null>(null);
  const [conciergeServiceMode, setConciergeServiceMode] = useState<"hourly" | "daily" | null>(null);
  const [conciergeHasExpenses, setConciergeHasExpenses] = useState<boolean | null>(null);
  const [conciergeExpenseItems, setConciergeExpenseItems] = useState<Array<{ description: string; amount: string }>>([{ description: "", amount: "0" }]);
  const [conciergeAllowOverage, setConciergeAllowOverage] = useState(false);
  const [conciergeOverageLimit, setConciergeOverageLimit] = useState("0");
  const [expenseCapWarning, setExpenseCapWarning] = useState<number | null>(null);
  const [overageCapWarning, setOverageCapWarning] = useState(false);
  const [redraftSuggestion, setRedraftSuggestion] = useState<string | null>(null);
  const [isRedrafting, setIsRedrafting] = useState(false);
  const [expenseRedraftSuggestion, setExpenseRedraftSuggestion] = useState<{ index: number; text: string } | null>(null);
  const [isExpenseRedrafting, setIsExpenseRedrafting] = useState<number | null>(null);

  // Auto-select "Require 2 Courials" based on weight conditions
  useEffect(() => {
    if (over70lbs) {
      const weight = parseInt(heavyWeight) || 0;
      const items = parseInt(heavyItems) || 0;
      const totalWeight = weight; // weight is total weight
      const perItem = items > 0 ? weight / items : 0;
      if (totalWeight > 150 || (perItem > 100 && items >= 5)) {
        setTwoCourials(true);
      }
    }
  }, [over70lbs, heavyWeight, heavyItems]);
  const [bookingState, setBookingState] = useState<"input" | "loading" | "active">("input");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [deliveryStep, setDeliveryStep] = useState(0);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // Random profile photos for loading state
  const courialProfiles = useMemo(() => [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&h=200&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
  ], []);

  // Cycle through profile photos during loading
  useEffect(() => {
    if (bookingState !== "loading") return;
    const interval = setInterval(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % courialProfiles.length);
    }, 600);
    return () => clearInterval(interval);
  }, [bookingState, courialProfiles.length]);

  const paymentMethods = [
    { id: "visa-4242", type: "visa", label: "Visa", last4: "4242", icon: visaIcon },
    { id: "mc-8831", type: "mastercard", label: "Mastercard", last4: "8831", icon: mastercardIcon },
  ];

  const activePayment = paymentMethods.find(p => p.id === selectedPaymentMethod) || paymentMethods[0];

  const needsVehicle = selectedService === "deliver";
  const conciergeReady = selectedService === "concierge" && (conciergeSubCategory !== null || conciergeCategory === "something-else") && conciergeDescription.trim().length > 0;
  const isFormValid = selectedService === "concierge"
    ? conciergeReady
    : pickup.trim().length > 0 && dropoff.trim().length > 0 && (!needsVehicle || selectedVehicle !== null) && notes.trim().length > 0;

  // Redraft with AI handler
  const handleRedraft = useCallback(async () => {
    if (conciergeDescription.trim().length < 10 || isRedrafting) return;
    setIsRedrafting(true);
    setRedraftSuggestion(null);
    try {
      const selectedCat = conciergeCategories.find(c => c.id === conciergeCategory);
      const categoryLabel = conciergeSubCategory
        ? `${selectedCat?.label} > ${conciergeSubCategory}`
        : selectedCat?.label || "General";
      const { data, error } = await supabase.functions.invoke("redraft-concierge", {
        body: { description: conciergeDescription, category: categoryLabel },
      });
      if (error || !data?.redrafted) {
        toast.error("Couldn't redraft — please try again.");
      } else {
        setRedraftSuggestion(data.redrafted);
      }
    } catch {
      toast.error("Redraft failed.");
    } finally {
      setIsRedrafting(false);
    }
  }, [conciergeDescription, conciergeCategory, conciergeSubCategory, isRedrafting]);

  const handleExpenseRedraft = useCallback(async (index: number) => {
    const item = conciergeExpenseItems[index];
    if (!item || item.description.trim().length < 10 || isExpenseRedrafting !== null) return;
    setIsExpenseRedrafting(index);
    setExpenseRedraftSuggestion(null);
    try {
      const selectedCat = conciergeCategories.find(c => c.id === conciergeCategory);
      const categoryLabel = conciergeSubCategory
        ? `${selectedCat?.label} > ${conciergeSubCategory}`
        : selectedCat?.label || "General";
      const { data, error } = await supabase.functions.invoke("redraft-concierge", {
        body: { description: item.description, category: `${categoryLabel} — Expense Item` },
      });
      if (error || !data?.redrafted) {
        toast.error("Couldn't redraft — please try again.");
      } else {
        setExpenseRedraftSuggestion({ index, text: data.redrafted });
      }
    } catch {
      toast.error("Redraft failed.");
    } finally {
      setIsExpenseRedrafting(null);
    }
  }, [conciergeExpenseItems, conciergeCategory, conciergeSubCategory, isExpenseRedrafting]);

  const handleBookingSubmit = useCallback(async () => {
    if (!isFormValid) return;
    if (!user) {
      toast.error("Please sign in to book a delivery.");
      return;
    }

    setBookingState("loading");
    setLoadingProgress(0);

    try {
      const courialToken = localStorage.getItem("courial_api_token");
      if (!courialToken) {
        toast.error("Please sign in with your phone number to book a delivery.");
        setBookingState("input");
        return;
      }

      const isConcierge = selectedService === "concierge";
      const payload: Record<string, any> = {
        scheduleType: timeMode === "now" ? "now" : "later",
        serviceType: selectedService || "deliver",
        vehicleType: selectedVehicle || undefined,
        notes: isConcierge ? conciergeDescription : notes,
        pickup: isConcierge
          ? { address: conciergeStartAddress || "N/A", lat: 0, lng: 0 }
          : { address: pickup, lat: pickupCoords?.lat, lng: pickupCoords?.lng },
        dropoff: isConcierge
          ? { address: conciergeFinalAddress || "N/A", lat: 0, lng: 0 }
          : { address: dropoff, lat: dropoffCoords?.lat, lng: dropoffCoords?.lng },
        userId: user.id,
      };

      if (isConcierge) {
        const cat = conciergeCategories.find(c => c.id === conciergeCategory);
        payload.conciergeCategory = cat?.label || conciergeCategory;
        payload.conciergeSubCategory = conciergeSubCategory === "__direct__" ? cat?.label : conciergeSubCategory;
        if (conciergeStopAddress) payload.stopAddress = conciergeStopAddress;
        if (conciergeLanguage) payload.preferredLanguage = conciergeLanguage;
      }

      if (timeMode === "later" && selectedDate) {
        payload.date = format(selectedDate, "yyyy-MM-dd");
        payload.time = selectedTime;
      }

      if (over70lbs) {
        payload.weightCategory = "over_70_lbs";
      }
      if (twoCourials) {
        payload.requiresCourials = 2;
      }
      if (hasStairs) {
        payload.involvesStairs = true;
      }

      const { data, error } = await supabase.functions.invoke("book-delivery", {
        body: payload,
        headers: {
          Authorization: `Bearer ${courialToken}`,
        },
      });

      if (error) {
        console.error("[book-delivery] invoke error:", error);
        toast.error("Booking failed — please try again.");
        setBookingState("input");
        return;
      }

      if (data?.success === 1 && data?.data?.deliveryId) {
        deliveryIdRef.current = data.data.deliveryId;
        console.log("[book-delivery] Delivery created:", data.data.deliveryId);
      } else {
        console.error("[book-delivery] Unexpected response:", data);
        toast.error(data?.msg || "Booking failed — unexpected response.");
        setBookingState("input");
      }
    } catch (err) {
      console.error("[book-delivery] Error:", err);
      toast.error("Something went wrong — please try again.");
      setBookingState("input");
    }
  }, [isFormValid, user, timeMode, selectedService, selectedVehicle, notes, pickup, pickupCoords, dropoff, dropoffCoords, selectedDate, selectedTime, over70lbs, twoCourials, hasStairs, conciergeDescription, conciergeCategory, conciergeSubCategory, conciergeStartAddress, conciergeStopAddress, conciergeFinalAddress]);

  // Animate loading progress and transition to active
  useEffect(() => {
    if (bookingState !== "loading") return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBookingState("active");
          return 100;
        }
        return prev + (100 / 150); // 150 steps over 15s (100ms interval)
      });
    }, 100);
    return () => clearInterval(interval);
  }, [bookingState]);

  const handleCancelBooking = useCallback(() => {
    setBookingState("input");
    setLoadingProgress(0);
    setDeliveryStep(0);
  }, []);

  const deliveryStepsMap: Record<string, { label: string; desc: string }[]> = {
    deliver: [
      { label: "Order Accepted", desc: "Your delivery request has been confirmed" },
      { label: "Courial at Pickup", desc: "Your courier has arrived at the pickup location" },
      { label: "Courial Picked Up", desc: "Package has been collected" },
      { label: "Courial at Drop-off", desc: "Your courier has arrived at the destination" },
      { label: "Courial Dropped Off", desc: "Package has been delivered" },
      { label: "Order Complete", desc: "Invoice sent — thank you!" },
    ],
    concierge: [
      { label: "Request Accepted", desc: "Your concierge request has been confirmed" },
      { label: "Concierge En Route", desc: "Your concierge is on the way" },
      { label: "Concierge Arrived", desc: "Your concierge has arrived" },
      { label: "Task In Progress", desc: "Your concierge is working on your request" },
      { label: "Task Completed", desc: "Your request has been fulfilled" },
      { label: "Order Complete", desc: "Invoice sent — thank you!" },
    ],
    valet: [
      { label: "Request Accepted", desc: "Your valet request has been confirmed" },
      { label: "Valet En Route", desc: "Your valet is on the way" },
      { label: "Valet Arrived", desc: "Your valet has arrived at the location" },
      { label: "Vehicle In Transit", desc: "Your vehicle is being handled" },
      { label: "Vehicle Parked", desc: "Your vehicle has been parked" },
      { label: "Order Complete", desc: "Invoice sent — thank you!" },
    ],
  };
  const deliverySteps = deliveryStepsMap[selectedService || "deliver"] || deliveryStepsMap.deliver;

  const handlePickupSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setPickupCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      const name = place.name || null;
      const addr = place.formatted_address || "";
      const isEstablishment = name && !addr.startsWith(name);
      setPickupPlaceName(isEstablishment ? name : null);
    }
  }, []);

  const handleDropoffSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setDropoffCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      const name = place.name || null;
      const addr = place.formatted_address || "";
      const isEstablishment = name && !addr.startsWith(name);
      setDropoffPlaceName(isEstablishment ? name : null);
    }
  }, []);

  const handleConciergeStartSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setConciergeStartCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      const name = place.name || null;
      const addr = place.formatted_address || "";
      const isEstablishment = name && !addr.startsWith(name);
      setConciergeStartPlaceName(isEstablishment ? name : null);
    }
  }, []);

  const handleConciergeStopSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setConciergeStopCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      const name = place.name || null;
      const addr = place.formatted_address || "";
      const isEstablishment = name && !addr.startsWith(name);
      setConciergeStopPlaceName(isEstablishment ? name : null);
    }
  }, []);

  const handleConciergeFinalSelect = useCallback((place: any) => {
    if (place.geometry?.location) {
      setConciergeFinalCoords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
      const name = place.name || null;
      const addr = place.formatted_address || "";
      const isEstablishment = name && !addr.startsWith(name);
      setConciergeFinalPlaceName(isEstablishment ? name : null);
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
        <div className="w-full max-w-[440px] flex-shrink-0 border-r border-border overflow-y-auto bg-black/[0.025]">
          {bookingState === "input" && (
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
                    <div className="grid grid-cols-1 gap-3">
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
                            <div className="relative z-10 flex items-center gap-5 h-full">
                              <div className="flex gap-1.5 flex-shrink-0">
                                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                  {(() => { const FirstIcon = item.icons[0]; return <FirstIcon className="w-7 h-7 text-foreground" />; })()}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                  {item.label}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-snug whitespace-pre-line">{item.desc}</p>
                              </div>
                              {item.icons.length > 1 && (
                                <div className="flex gap-1.5 flex-shrink-0">
                                  {item.icons.slice(1).map((Icon, idx) => (
                                    <div key={idx} className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                      <Icon className="w-7 h-7 text-foreground" />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        );
                        const cardClass = `group relative rounded-2xl glass-card overflow-hidden h-[150px] p-6 flex flex-col justify-center transition-all duration-300 border border-foreground/10 ${isSelected ? "!border-primary !border-2" : "hover:border-primary/50"}`;

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
            {selectedService && !showAllServices && (
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
                <div className="flex bg-background rounded-full p-0.5 gap-0.5 border border-foreground/20">
                  <button
                    onClick={() => setTimeMode("now")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1",
                      timeMode === "now"
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Zap className="w-2.5 h-2.5" />
                    Now
                  </button>
                  <button
                    onClick={() => setTimeMode("later")}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1",
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
                    <AnimatePresence mode="wait">
                      {heavyExpanded ? (
                        <motion.div
                          key="selects"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5 overflow-hidden"
                        >
                          <Select value={heavyWeight} onValueChange={setHeavyWeight}>
                            <SelectTrigger className="h-auto px-2.5 py-1 rounded-full text-[11px] font-normal border leading-none w-auto min-w-0 gap-1 bg-background text-foreground/75 border-border/60 focus:ring-0 focus:ring-offset-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["70","75","80","90","100","125","150","175","200","250","300","350","400","450","500"].map(w => (
                                <SelectItem key={w} value={w}>{w} lbs</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={heavyItems} onValueChange={setHeavyItems}>
                            <SelectTrigger className="h-auto px-2.5 py-1 rounded-full text-[11px] font-normal border leading-none w-auto min-w-0 gap-1 bg-background text-foreground/75 border-border/60 focus:ring-0 focus:ring-offset-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25"].map(n => (
                                <SelectItem key={n} value={n}>{n} {parseInt(n) === 1 ? "item" : "items"}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <button
                            type="button"
                            onClick={() => setHeavyExpanded(false)}
                            className="px-2.5 py-1 rounded-full text-[11px] font-normal transition-all border leading-none bg-background text-foreground/75 border-border/60 hover:border-foreground/50"
                          >
                            ✓
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="pills"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          {/* Over 70 lbs / weight summary pill */}
                          <button
                            type="button"
                            onClick={() => {
                              if (over70lbs) {
                                // Already set — tap to edit
                                setHeavyExpanded(true);
                              } else {
                                // First tap — activate and expand
                                setOver70lbs(true);
                                setHeavyExpanded(true);
                                if (selectedVehicle === "walker" || selectedVehicle === "scooter") {
                                  setSelectedVehicle(null);
                                }
                              }
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-normal transition-all border leading-none",
                              over70lbs
                                ? "bg-background text-foreground border-primary"
                                : "bg-background text-foreground/75 border-border/60 hover:border-foreground/50"
                            )}
                          >
                            {over70lbs ? `${heavyWeight}lbs / ${heavyItems} ${parseInt(heavyItems) === 1 ? "item" : "items"}` : "Over 70 lbs"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newVal = twoCourials === true ? null : true;
                              setTwoCourials(newVal);
                              if (newVal === true && selectedVehicle !== "van" && selectedVehicle !== "truck") {
                                setSelectedVehicle(null);
                              }
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-normal transition-all border leading-none",
                              twoCourials === true
                                ? "bg-background text-foreground border-primary"
                                : "bg-background text-foreground/75 border-border/60 hover:border-foreground/50"
                            )}
                          >
                            Require 2 Courials
                          </button>
                          <button
                            type="button"
                            onClick={() => setHasStairs(hasStairs === true ? null : true)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[11px] font-normal transition-all border leading-none",
                              hasStairs === true
                                ? "bg-background text-foreground border-primary"
                                : "bg-background text-foreground/75 border-border/60 hover:border-foreground/50"
                            )}
                          >
                            Involves stairs
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

              {/* Concierge Category Drill-Down */}
              {/* Vehicle type icons for Concierge */}
              {selectedService === "concierge" && (
                <div className="mb-6">
                  <div className="flex items-end justify-center gap-4">
                    {vehicleOptions.map((v) => {
                      const isActive = conciergeVehicle === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setConciergeVehicle(isActive ? null : v.id)}
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
                    {conciergeVehicle && (
                      <motion.p
                        key={conciergeVehicle}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-muted-foreground text-center mt-2"
                      >
                        {vehicleCaptions[conciergeVehicle]}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Concierge Category Drill-Down */}
              {selectedService === "concierge" && (
                <div className="mb-4">
                  <AnimatePresence mode="wait">
                    {!conciergeCategory ? (
                      /* Level 1: Top-level categories */
                      <motion.div
                        key="categories"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex flex-wrap gap-2"
                      >
                        {conciergeCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setConciergeCategory(cat.id);
                              if (cat.subs.length === 0) {
                                setConciergeSubCategory("__direct__");
                              }
                            }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-normal border border-border/60 bg-background text-foreground/75 hover:border-foreground/50 transition-all leading-none"
                          >
                            {cat.label}
                          </button>
                        ))}
                      </motion.div>
                    ) : !conciergeSubCategory || conciergeSubCategory === "__direct__" ? (
                      /* Level 2: Sub-categories (or direct for "Something Else?") */
                      <motion.div
                        key="subcategories"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {(() => {
                          const cat = conciergeCategories.find(c => c.id === conciergeCategory)!;
                          return (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <button
                                  onClick={() => { setConciergeCategory(null); setConciergeSubCategory(null); }}
                                  className="p-0.5 hover:opacity-70 transition-opacity"
                                >
                                  <ChevronLeft className="w-4 h-4 text-foreground" />
                                </button>
                                 <span className="px-2.5 py-1 rounded-full text-[11px] font-normal border border-primary text-foreground leading-none">
                                   {cat.label}
                                 </span>
                                 {cat.desc && (
                                   <span className="text-[11px] text-muted-foreground">{cat.desc}</span>
                                )}
                              </div>
                              {cat.subs.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {cat.subs.map((sub) => (
                                     <button
                                      key={sub}
                                      onClick={() => setConciergeSubCategory(sub)}
                                      className="px-2.5 py-1 rounded-full text-[11px] font-normal border border-border/60 bg-background text-foreground hover:border-foreground/50 transition-all leading-none"
                                    >
                                      {sub}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    ) : (
                      /* Level 3: Selected — show breadcrumbs */
                      <motion.div
                        key="selected"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {(() => {
                          const cat = conciergeCategories.find(c => c.id === conciergeCategory)!;
                          return (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  onClick={() => { setConciergeCategory(null); setConciergeSubCategory(null); }}
                                  className="p-0.5 hover:opacity-70 transition-opacity"
                                >
                                  <ChevronLeft className="w-4 h-4 text-foreground" />
                                </button>
                                 <span className="px-2.5 py-1 rounded-full text-[11px] font-normal border border-primary text-foreground leading-none">
                                   {cat.label}
                                 </span>
                                 {cat.desc && (
                                   <span className="text-[11px] text-muted-foreground">{cat.desc}</span>
                                 )}
                               </div>
                               {conciergeSubCategory !== "__direct__" && (
                                 <div className="flex items-center gap-2">
                                   <button
                                     onClick={() => setConciergeSubCategory(null)}
                                     className="p-0.5 hover:opacity-70 transition-opacity"
                                   >
                                     <ChevronLeft className="w-4 h-4 text-foreground" />
                                   </button>
                                   <span className="px-2.5 py-1 rounded-full text-[11px] font-normal border border-primary text-foreground leading-none">
                                     {conciergeSubCategory}
                                   </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
            )}

            {/* Preferred Language for Concierge */}
            {selectedService === "concierge" && conciergeSubCategory && (
              <div className="mb-4">
                {conciergeLanguage ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConciergeLanguage(null)}
                      className="p-0.5 hover:opacity-70 transition-opacity"
                    >
                      <ChevronLeft className="w-4 h-4 text-foreground" />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground">Preferred Language</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-normal leading-none border border-primary text-foreground">
                      {conciergeLanguage}
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Select Preferred Language</p>
                    <div className="flex flex-wrap gap-2">
                      {["English", "Spanish", "French", "Portuguese", "Arabic", "Chinese", "Hindi", "Japanese", "Korean", "Thai"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setConciergeLanguage(lang)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-normal transition-all leading-none border border-border/60 bg-background text-foreground/75 hover:border-foreground/50"
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Concierge Task Details Form */}
            {selectedService === "concierge" && conciergeSubCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Address Toggle Pills */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {(["start", "stop", "final"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setConciergeAddressToggles(prev => {
                          const newVal = !prev[type];
                          if (!newVal) {
                            // Clear address data when toggle is turned off
                            if (type === "start") { setConciergeStartAddress(""); setConciergeStartPlaceName(null); setConciergeStartCoords(null); }
                            if (type === "stop") { setConciergeStopAddress(""); setConciergeStopPlaceName(null); setConciergeStopCoords(null); }
                            if (type === "final") { setConciergeFinalAddress(""); setConciergeFinalPlaceName(null); setConciergeFinalCoords(null); }
                          }
                          return { ...prev, [type]: newVal };
                        });
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-normal transition-all leading-none",
                        conciergeAddressToggles[type]
                          ? "bg-muted text-foreground border-none"
                          : "border border-border/60 bg-background text-foreground hover:border-foreground/50"
                      )}
                    >
                      + {type.charAt(0).toUpperCase() + type.slice(1)} address
                    </button>
                  ))}
                </div>

                {/* Address Inputs for enabled toggles */}
                <AnimatePresence>
                  {(conciergeAddressToggles.start || conciergeAddressToggles.stop || conciergeAddressToggles.final) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-2 mb-3 overflow-visible"
                    >
                      {conciergeAddressToggles.start && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background focus-within:border-foreground">
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500" />
                          <div className="flex-1 min-w-0">
                            {conciergeStartPlaceName && conciergeStartCoords && (
                              <div className="text-sm font-semibold text-foreground leading-tight">{conciergeStartPlaceName}</div>
                            )}
                            <AddressAutocomplete
                              placeholder="Start address"
                              value={conciergeStartAddress}
                              onChange={(v) => { setConciergeStartAddress(v); if (!v) { setConciergeStartPlaceName(null); setConciergeStartCoords(null); } }}
                              onPlaceSelect={handleConciergeStartSelect}
                              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${conciergeStartPlaceName && conciergeStartCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                            />
                          </div>
                          <button onClick={() => { setConciergeStartAddress(""); setConciergeStartPlaceName(null); setConciergeStartCoords(null); }} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          </button>
                        </div>
                      )}
                      {conciergeAddressToggles.stop && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background focus-within:border-foreground">
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-none bg-blue-500" />
                          <div className="flex-1 min-w-0">
                            {conciergeStopPlaceName && conciergeStopCoords && (
                              <div className="text-sm font-semibold text-foreground leading-tight">{conciergeStopPlaceName}</div>
                            )}
                            <AddressAutocomplete
                              placeholder="Stop address"
                              value={conciergeStopAddress}
                              onChange={(v) => { setConciergeStopAddress(v); if (!v) { setConciergeStopPlaceName(null); setConciergeStopCoords(null); } }}
                              onPlaceSelect={handleConciergeStopSelect}
                              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${conciergeStopPlaceName && conciergeStopCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                            />
                          </div>
                          <button onClick={() => { setConciergeStopAddress(""); setConciergeStopPlaceName(null); setConciergeStopCoords(null); }} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          </button>
                        </div>
                      )}
                      {conciergeAddressToggles.final && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background focus-within:border-foreground">
                          <div className="flex-shrink-0 w-2.5 h-2.5 rounded-none bg-destructive" />
                          <div className="flex-1 min-w-0">
                            {conciergeFinalPlaceName && conciergeFinalCoords && (
                              <div className="text-sm font-semibold text-foreground leading-tight">{conciergeFinalPlaceName}</div>
                            )}
                            <AddressAutocomplete
                              placeholder="Final address"
                              value={conciergeFinalAddress}
                              onChange={(v) => { setConciergeFinalAddress(v); if (!v) { setConciergeFinalPlaceName(null); setConciergeFinalCoords(null); } }}
                              onPlaceSelect={handleConciergeFinalSelect}
                              className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${conciergeFinalPlaceName && conciergeFinalCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                            />
                          </div>
                          <button onClick={() => { setConciergeFinalAddress(""); setConciergeFinalPlaceName(null); setConciergeFinalCoords(null); }} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                            <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Task Description Textarea with Redraft */}
                <div className="relative mb-1">
                  <div className="px-4 py-4 border border-border rounded-xl bg-background focus-within:border-foreground">
                    <textarea
                      placeholder="Outline the scope of work, preferences, timing requirements, special instructions, and any relevant contact names and phone numbers. Before confirming your booking, you may choose to have AI professionally refine your message for clarity, completeness, and precision."
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/35 outline-none resize-none overflow-hidden"
                      rows={1}
                      value={conciergeDescription}
                      onChange={(e) => { setConciergeDescription(e.target.value); setRedraftSuggestion(null); }}
                      onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                      ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                    />
                  </div>
                  {/* Redraft with AI button — centered on bottom border */}
                  {conciergeDescription.trim().length > 10 && (
                    <div className="flex justify-end -mt-3 relative z-10 pr-2">
                      <button
                        onClick={handleRedraft}
                        disabled={isRedrafting}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(210,100%,50%)] text-white hover:bg-[hsl(210,100%,45%)] transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        {isRedrafting ? "Redrafting…" : "Redraft with AI"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Redraft Suggestion */}
                <AnimatePresence>
                  {redraftSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mb-3"
                    >
                      <div className="p-3 rounded-xl border border-primary/30 bg-primary/5">
                        <p className="text-sm text-foreground mb-2">{redraftSuggestion}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setConciergeDescription(redraftSuggestion); setRedraftSuggestion(null); }}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setRedraftSuggestion(null)}
                            className="px-3 py-1 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-muted"
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Service Mode Toggle */}
                <div className="flex items-center gap-2 mb-3 pt-2">
                  <span className="text-xs font-medium text-muted-foreground">Service Type</span>
                  {[
                    { value: "hourly" as const, label: "Hourly" },
                    { value: "daily" as const, label: "Daily (8 Hrs)" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setConciergeServiceMode(mode.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-normal transition-all leading-none ${
                        conciergeServiceMode === mode.value
                          ? "bg-muted text-foreground"
                          : "border border-border/60 bg-background text-foreground/75 hover:border-foreground/50"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>

                {/* Additional Expenses */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-medium text-foreground">Additional Expenses</h4>
                    <input
                      type="checkbox"
                      id="concierge-expenses"
                      checked={conciergeHasExpenses === true}
                      onChange={(e) => setConciergeHasExpenses(e.target.checked)}
                      className="h-3 w-3 rounded border-border/60 accent-foreground cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    If the Concierge needs to make purchases on your behalf, add estimated costs below.
                  </p>
                </div>

                <AnimatePresence>
                  {conciergeHasExpenses === true && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 mb-3 overflow-hidden"
                    >

                      {/* Expense Items */}
                      {conciergeExpenseItems.map((item, index) => (
                        <div key={index} className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
                          <p className="text-[11px] font-medium text-foreground">Expense Item</p>
                          <div>
                            <textarea
                              ref={(el) => {
                                if (el) {
                                  el.style.height = 'auto';
                                  el.style.height = el.scrollHeight + 'px';
                                }
                              }}
                              value={item.description}
                              onChange={(e) => {
                                const updated = [...conciergeExpenseItems];
                                updated[index].description = e.target.value;
                                setConciergeExpenseItems(updated);
                                setExpenseRedraftSuggestion(prev => prev?.index === index ? null : prev);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              placeholder="Describe any expected purchases such as event tickets, specialty retail items, postage, shipping, or required supplies here."
                              rows={1}
                              className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none overflow-hidden"
                            />
                            {/* Redraft with AI button for expense description */}
                            {item.description.trim().length > 10 && (
                              <div className="flex justify-end -mt-3 relative z-10 pr-2">
                                <button
                                  type="button"
                                  onClick={() => handleExpenseRedraft(index)}
                                  disabled={isExpenseRedrafting !== null}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(210,100%,50%)] text-white hover:bg-[hsl(210,100%,45%)] transition-colors disabled:opacity-50"
                                >
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {isExpenseRedrafting === index ? "Redrafting…" : "Redraft with AI"}
                                </button>
                              </div>
                            )}
                            {/* Expense Redraft Suggestion */}
                            <AnimatePresence>
                              {expenseRedraftSuggestion?.index === index && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="p-2 rounded-lg border border-primary/30 bg-primary/5">
                                    <p className="text-xs text-foreground mb-1.5">{expenseRedraftSuggestion.text}</p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...conciergeExpenseItems];
                                          updated[index].description = expenseRedraftSuggestion.text;
                                          setConciergeExpenseItems(updated);
                                          setExpenseRedraftSuggestion(null);
                                        }}
                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setExpenseRedraftSuggestion(null)}
                                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-border text-foreground hover:bg-muted"
                                      >
                                        Ignore
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] text-muted-foreground/80 leading-tight">Estimated<br />Amount</label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                              <input
                                type="text"
                                inputMode="decimal"
                              value={item.amount ? Number(item.amount.replace(/,/g, '')).toLocaleString('en-US') : ''}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/,/g, '');
                                  if (raw === '' || /^\d+$/.test(raw)) {
                                    if (raw === '' || Number(raw) <= 500) {
                                      const updated = [...conciergeExpenseItems];
                                      updated[index].amount = raw;
                                      setConciergeExpenseItems(updated);
                                      setExpenseCapWarning(null);
                                    } else {
                                      setExpenseCapWarning(index);
                                      setTimeout(() => setExpenseCapWarning(prev => prev === index ? null : prev), 2500);
                                    }
                                  }
                                }}
                                placeholder="0"
                                onFocus={(e) => e.target.select()}
                                className="w-20 rounded-lg border border-border/60 bg-background pl-5 pr-2 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                              />
                            </div>
                            {expenseCapWarning === index && (
                              <span className="text-[9px] text-destructive font-medium whitespace-nowrap">Sorry, capped at $500</span>
                            )}
                          </div>
                          {conciergeExpenseItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setConciergeExpenseItems(conciergeExpenseItems.filter((_, i) => i !== index))}
                              className="text-[10px] text-primary font-medium underline underline-offset-2 hover:opacity-70"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Add Another Expense */}
                      <button
                        type="button"
                        onClick={() => setConciergeExpenseItems([...conciergeExpenseItems, { description: "", amount: "0" }])}
                        className="w-full rounded-lg border border-dashed border-border/60 bg-background py-2 text-[11px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        + Add Another Expense
                      </button>

                      {/* Allow minor overages */}
                      <div className="pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={conciergeAllowOverage}
                            onChange={(e) => setConciergeAllowOverage(e.target.checked)}
                            className="h-3 w-3 rounded border-border/60 accent-foreground cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground">
                            Allow minor overages up to:
                          </span>
                          <div className="relative inline-flex items-center">
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">$</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={conciergeOverageLimit}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                  const num = Number(val);
                                  if (val === '' || num <= 100) {
                                    setConciergeOverageLimit(val);
                                    setOverageCapWarning(false);
                                  } else {
                                    setOverageCapWarning(true);
                                    setTimeout(() => setOverageCapWarning(false), 2500);
                                  }
                                }
                              }}
                              placeholder="25"
                              disabled={!conciergeAllowOverage}
                              onFocus={(e) => e.target.select()}
                              className="w-14 rounded-lg border border-border/60 bg-background pl-4 pr-1 py-0 text-[10px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
                            />
                          </div>
                          {overageCapWarning && (
                            <span className="text-[9px] text-destructive font-medium whitespace-nowrap">Sorry, capped at $100</span>
                          )}
                        </label>
                        <p className="text-[9px] text-muted-foreground italic mt-0.5 ml-5">
                          If actual costs exceed your estimate, we may request approval before proceeding.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Concierge Service Requirements */}
                <Collapsible className="mt-5 text-xs text-foreground">
                  <CollapsibleTrigger className="flex items-center gap-1 font-semibold cursor-pointer hover:opacity-70 transition-opacity">
                    Concierge Service Requirements
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-2">
                    <div>
                      <p className="text-muted-foreground leading-relaxed">Before submitting your request, please ensure the following:</p>
                      <ul className="text-muted-foreground leading-relaxed mt-1 space-y-0.5">
                        <li>• Items must be legal and safe to handle</li>
                        <li>• Single items are limited to a $1,500 declared value</li>
                        <li>• High-value requests may require pre-approval</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Restricted Items</p>
                      <p className="text-muted-foreground leading-relaxed">Concierge services do not handle alcohol, firearms, hazardous materials, illegal goods, or cryptocurrency hardware wallets.</p>
                      <p className="text-muted-foreground leading-relaxed mt-1">All requests must comply with local, state, and federal laws. Requests involving restricted or unlawful items may be canceled, and accounts may be suspended.</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Insurance & Agreement</p>
                      <p className="text-muted-foreground leading-relaxed">Courial does not provide cargo insurance unless in a premium tier. By confirming your request, you acknowledge and accept Courial's Terms and Conditions.</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Concierge Pricing & Payment */}
                <div className="mt-3 rounded-2xl border border-border bg-background p-5">
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
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowPaymentMethods(true)}
                      className="flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img src={activePayment.icon} alt={activePayment.label} className="w-12 h-auto rounded" />
                      <span className="text-sm text-muted-foreground tracking-wide">••••&nbsp;{activePayment.last4}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                    <Button
                      disabled={!isFormValid}
                      onClick={handleBookingSubmit}
                      className="rounded h-10 text-lg font-semibold px-6"
                      variant={isFormValid ? "hero" : "secondary"}
                    >
                      Book Concierge
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deliver / Valet Form */}
            <AnimatePresence>
              {!showAllServices && selectedService !== "concierge" && (selectedVehicle || selectedService === "valet") && (
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
                      <div className="flex items-start gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-foreground mb-2">
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500 mt-[7px]" />
                        <div className="flex-1 min-w-0">
                          {pickupPlaceName && pickupCoords && (
                            <div className="text-sm font-semibold text-foreground leading-tight">{pickupPlaceName}</div>
                          )}
                          <AddressAutocomplete
                            placeholder="Pickup location"
                            value={pickup}
                            onChange={(v) => { setPickup(v); if (!v) setPickupPlaceName(null); }}
                            onPlaceSelect={handlePickupSelect}
                            className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${pickupPlaceName && pickupCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative group mt-2">
                      <div className="flex items-start gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-foreground">
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 mt-[7px]" />
                        <div className="flex-1 min-w-0">
                          {dropoffPlaceName && dropoffCoords && (
                            <div className="text-sm font-semibold text-foreground leading-tight">{dropoffPlaceName}</div>
                          )}
                          <AddressAutocomplete
                            placeholder="Dropoff location"
                            value={dropoff}
                            onChange={(v) => { setDropoff(v); if (!v) setDropoffPlaceName(null); }}
                            onPlaceSelect={handleDropoffSelect}
                            className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${dropoffPlaceName && dropoffCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ETA info — visible when both addresses set */}
                    {pickupCoords && dropoffCoords && (
                      <p className="text-[15px] font-medium text-muted-foreground text-center py-4 flex items-center justify-center gap-1.5">
                        <img src={deliverBox} alt="" className="w-5 h-5" />
                        4 mins away • 2:01 AM dropoff
                      </p>
                    )}
                  </div>

                  {/* Notes Field */}
                  <div className="relative group -mt-1">
                    <div className="flex items-start gap-3 px-4 py-4 border border-border rounded-xl bg-background transition-colors focus-within:border-foreground">
                      <textarea
                        placeholder="Provide all relevant pickup and drop-off details, including contact numbers, special instructions, access information, gate codes, and any other important notes."
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/35 outline-none resize-none overflow-hidden"
                        rows={1}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                      />
                    </div>
                  </div>

                  {/* Delivery Requirements Notice */}
                  <Collapsible className="mt-3 text-xs text-foreground">
                    <CollapsibleTrigger className="flex items-center gap-1 font-semibold cursor-pointer hover:opacity-70 transition-opacity">
                      {selectedService === "valet" ? "Valet Service Requirements" : "Delivery Requirements"}
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
                    <div className="flex items-center justify-between">
                      {/* Payment Card Icon + Down Arrow */}
                      <button
                        onClick={() => setShowPaymentMethods(true)}
                        className="flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <img src={activePayment.icon} alt={activePayment.label} className="w-12 h-auto rounded" />
                        <span className="text-sm text-muted-foreground tracking-wide">••••&nbsp;{activePayment.last4}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </button>

                      {/* Request Delivery Button */}
                      <Button
                        disabled={!isFormValid}
                        onClick={handleBookingSubmit}
                        className="rounded h-10 text-lg font-semibold px-6"
                        variant={isFormValid ? "hero" : "secondary"}
                      >
                        Book {selectedService ? serviceCards.find(s => s.id === selectedService)?.label : "Delivery"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

        {/* Loading state moved to map overlay */}
        {bookingState === "loading" && (
          <div className="p-8 flex flex-col items-center justify-center h-full">
            <div className="text-center text-muted-foreground text-sm">
              {selectedService === "concierge" ? "Finding your Concierge…" : selectedService === "valet" ? "Connecting with a Valet…" : "Searching nearby Courials…"}
            </div>
          </div>
        )}

        {/* Active Tracking State */}
        {bookingState === "active" && (
          <div className="p-8 h-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col h-full"
            >
              {/* Active header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live</span>
              </div>

              {/* Driver Card */}
              <div className="rounded-2xl border border-border bg-background p-5 mb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-15 h-15 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-foreground" style={{ width: 60, height: 60 }}>
                    M
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">Marcus</h3>
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">4.68</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Courial Since '25</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Black Toyota Corolla</div>
                    <div className="text-xs font-bold text-foreground mt-0.5">ABC1234</div>
                  </div>
                  {selectedVehicle && (
                    <img
                      src={vehicleOptions.find(v => v.id === selectedVehicle)?.image}
                      alt={selectedVehicle}
                      className="h-10 object-contain opacity-60"
                    />
                  )}
                </div>

                {/* Delivery Status Stepper */}
                <div className="mb-4">
                  <div className="space-y-0">
                    {deliverySteps.map((step, i) => {
                      const isCompleted = i < deliveryStep;
                      const isCurrent = i === deliveryStep;
                      const isFuture = i > deliveryStep;
                      return (
                        <div key={step.label} className="flex gap-3">
                          {/* Vertical line + dot */}
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                "w-3 h-3 rounded-full border-2 shrink-0 transition-all duration-300",
                                isCompleted
                                  ? "bg-primary border-primary"
                                  : isCurrent
                                  ? "bg-primary border-primary ring-4 ring-primary/20"
                                  : "bg-muted border-border"
                              )}
                            />
                            {i < deliverySteps.length - 1 && (
                              <div
                                className={cn(
                                  "w-0.5 flex-1 min-h-[24px] transition-colors duration-300",
                                  isCompleted ? "bg-primary" : "bg-border"
                                )}
                              />
                            )}
                          </div>
                          {/* Label */}
                          <div className={cn("pb-3", i === deliverySteps.length - 1 && "pb-0")}>
                            <p
                              className={cn(
                                "text-sm font-semibold leading-tight transition-colors",
                                isCurrent ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                              )}
                            >
                              {step.label}
                              {isCompleted && <span className="ml-1.5 text-primary">✓</span>}
                            </p>
                            {isCurrent && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-muted-foreground mt-0.5"
                              >
                                {step.desc}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-0 mb-1">
                  {notes.trim() && (
                    <div className="py-2 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Add'l Notes</p>
                      <p className="text-xs text-foreground">{notes}</p>
                    </div>
                  )}
                  {(over70lbs || twoCourials || hasStairs) && (
                    <div className="py-2 border-b border-border">
                      <div className="flex flex-wrap gap-1.5">
                        {over70lbs && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{heavyWeight}lbs / {heavyItems} {parseInt(heavyItems) === 1 ? "item" : "items"}</span>}
                        {twoCourials && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">2 Courials</span>}
                        {hasStairs && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Involves stairs</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Trip Summary */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500 mt-[5px]" />
                    <div className="min-w-0">
                      {pickupPlaceName && <p className="text-sm font-semibold text-foreground leading-tight">{pickupPlaceName}</p>}
                      <p className="text-xs text-muted-foreground truncate">{pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 mt-[5px]" />
                    <div className="min-w-0">
                      {dropoffPlaceName && <p className="text-sm font-semibold text-foreground leading-tight">{dropoffPlaceName}</p>}
                      <p className="text-xs text-muted-foreground truncate">{dropoff}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price / Receipt */}
              {deliveryStep >= 5 ? (
                <div className="rounded-xl border border-border bg-muted/50 p-4 mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Receipt</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base fare</span>
                      <span className="text-foreground">$5.40</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance (4.2 mi)</span>
                      <span className="text-foreground">$3.91</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time (18 min)</span>
                      <span className="text-foreground">$4.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add'l Weight / Items</span>
                      <span className="text-foreground">$3.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stairs fee</span>
                      <span className="text-foreground">$2.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add'l Courial</span>
                      <span className="text-foreground">$8.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wait time</span>
                      <span className="text-foreground">$2.50</span>
                    </div>
                    <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">$29.31</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-1 mb-4">
                  <span className="text-sm text-muted-foreground">Estimated fare</span>
                  <span className="text-sm font-bold text-foreground">$21.59</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto space-y-2">
                {deliveryStep < 5 && (
                  <button
                    onClick={() => setDeliveryStep((s) => Math.min(s + 1, 5))}
                    className="w-full py-3 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    {selectedService === "concierge"
                      ? ["En Route", "Arrive", "Begin Task", "Complete Task", "Finish"][deliveryStep]
                      : selectedService === "valet"
                      ? ["En Route", "Arrive", "Take Vehicle", "Park Vehicle", "Finish"][deliveryStep]
                      : ["Arrive at Pickup", "Pick Up Package", "Arrive at Drop-off", "Drop Off Package", "Complete Order"][deliveryStep]}
                  </button>
                )}
                {deliveryStep >= 5 ? (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-3 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                ) : (
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-3 rounded-full text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted/80 transition-colors"
                  >
                    Cancel {selectedService === "concierge" ? "Concierge" : selectedService === "valet" ? "Valet" : "Delivery"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
        </div>

        {/* Right Column — Map Placeholder */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
           {(() => {
               const isConcierge = selectedService === "concierge";
               const mapPickup = isConcierge ? (conciergeStartCoords || conciergeStopCoords || conciergeFinalCoords) : pickupCoords;
               const mapDropoff = isConcierge
                 ? (conciergeStartCoords ? (conciergeFinalCoords || conciergeStopCoords) : (conciergeStopCoords && conciergeFinalCoords ? conciergeFinalCoords : null))
                 : dropoffCoords;
               // Stop marker only when all 3 concierge addresses exist
               const mapStop = isConcierge && conciergeStartCoords && conciergeStopCoords && conciergeFinalCoords ? conciergeStopCoords : null;
               const mapStopAddr = mapStop ? conciergeStopAddress : "";
               const mapStopName = mapStop ? conciergeStopPlaceName : null;
               const mapPickupAddr = isConcierge ? (conciergeStartAddress || conciergeStopAddress || conciergeFinalAddress) : pickup;
               const mapDropoffAddr = isConcierge
                 ? (conciergeStartCoords ? (conciergeFinalAddress || conciergeStopAddress) : (conciergeStopCoords && conciergeFinalCoords ? conciergeFinalAddress : ""))
                 : dropoff;
               const mapPickupName = isConcierge ? (conciergeStartCoords ? conciergeStartPlaceName : (conciergeStopCoords ? conciergeStopPlaceName : conciergeFinalPlaceName)) : pickupPlaceName;
               const mapDropoffName = isConcierge
                 ? (conciergeStartCoords ? (conciergeFinalCoords ? conciergeFinalPlaceName : conciergeStopPlaceName) : (conciergeStopCoords && conciergeFinalCoords ? conciergeFinalPlaceName : null))
                 : dropoffPlaceName;
               const mapVehicle = isConcierge ? conciergeVehicle : selectedVehicle;
               const hasCoords = mapPickup || mapDropoff;
               return hasCoords ? (
             <div className="flex-1 relative">
               <BookingMap pickupCoords={mapPickup} dropoffCoords={mapPickup !== mapDropoff ? mapDropoff : null} stopCoords={mapStop} pickupAddress={mapPickupAddr} dropoffAddress={mapDropoffAddr} stopAddress={mapStopAddr} pickupPlaceName={mapPickupName} dropoffPlaceName={mapDropoffName} stopPlaceName={mapStopName} bookingState={bookingState} vehicleType={mapVehicle} />
              
              {/* Loading Overlay Popup */}
              <AnimatePresence>
                {bookingState === "loading" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    style={{ backgroundColor: "hsla(0, 0%, 0%, 0.35)", backdropFilter: "blur(6px)" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm mx-4"
                      style={{ backgroundColor: "hsla(0, 0%, 0%, 0.3)", backdropFilter: "blur(20px)" }}
                    >
                      {/* Circular Progress with flashing profile photos */}
                      <div className="relative w-28 h-28">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                          <circle cx="56" cy="56" r="50" fill="none" stroke="hsla(0,0%,100%,0.15)" strokeWidth="4" />
                          <circle
                            cx="56" cy="56" r="50" fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 50}
                            strokeDashoffset={2 * Math.PI * 50 * (1 - loadingProgress / 100)}
                            className="transition-all duration-100"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={currentProfileIndex}
                              src={courialProfiles[currentProfileIndex]}
                              alt="Courial nearby"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.25 }}
                              className="w-[92px] h-[92px] rounded-full object-cover"
                            />
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-1">
                          {selectedService === "concierge"
                            ? "Finding the perfect Concierge for your request."
                            : selectedService === "valet"
                            ? "Connecting you with a nearby Valet—right now."
                            : "Connecting you with the best available Courial—right now."}
                        </h2>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleCancelBooking}
                        className="mt-2 rounded-full px-10 bg-black/75 text-white border-0 hover:bg-black/90 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
          );
            })()}
        </div>
      </div>
      {/* Price Breakdown Dialog */}
      <Dialog open={showPriceBreakdown} onOpenChange={setShowPriceBreakdown}>
        <DialogContent className="sm:max-w-md bg-background border-border !rounded-[25px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden">
          {selectedService === "concierge" ? (
            <>
              <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
                <div className="flex items-center gap-3">
                  <img src={conciergeIcon} alt="Concierge" className="w-8 h-8" />
                  <span className="text-[1.65rem] font-bold text-foreground">Concierge</span>
                </div>
              </div>
              <div className="px-7">
                <div className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-foreground">Fare Summary</DialogTitle>
                </div>
                <div className="space-y-4 mb-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your Concierge rate is calculated in advance based on the selected service option (Hourly or 8-Hour Daily), estimated service time, and any required travel. The price shown before checkout reflects the projected cost of completing your request efficiently and professionally.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By confirming your request, you authorize Courial to charge the estimated amount, along with any applicable overtime, mileage, expense processing fees, or scope-related adjustments.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Final pricing may vary if service time exceeds the original booking, if travel is added or modified, if third-party expenses differ from the estimate, or if real-time demand requires dynamic pricing adjustments.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our pricing model is designed to ensure discretion, responsiveness, and dependable execution across every Concierge engagement.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4">Rate Structure</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Hourly Service (1-Hour Minimum)", value: "$65 / hr", muted: false },
                      { label: "Daily Service (8 Hours)", value: "$480 flat", muted: false },
                      { label: "Overtime – Hourly Bookings", value: "1.25× rate, per 15 min", muted: true },
                      { label: "Overtime – Daily (After 8 Hrs)", value: "1.5× rate, per 30 min", muted: true },
                      { label: "Per Mile (Travel Added)", value: "$1.10 / mi", muted: true },
                      { label: "Expense Processing Fee", value: "10% ($10 min)", muted: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${row.muted ? 'text-foreground/50' : 'font-semibold text-foreground'}`}>{row.label}</span>
                        <div className="flex-1 border-b border-dotted border-muted-foreground/30 mx-2" />
                        <span className={`text-sm whitespace-nowrap ${row.muted ? 'text-foreground/50' : 'font-semibold text-foreground'}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-muted/80 px-7 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-base text-foreground">Estimated Total</span>
                  <span className="text-base font-bold text-foreground">Varies</span>
                </div>
              </div>
              <div className="px-7 pb-7">
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-foreground mb-1">Wait Time Policy</h3>
                  <p className="text-[0.625rem] text-muted-foreground leading-relaxed">
                    Concierges begin active service at the scheduled start time or upon arrival. A 5-minute grace period is provided. Additional time beyond the reserved service window is billed according to the applicable overtime rate.
                  </p>
                </div>
                <Button
                  onClick={() => setShowPriceBreakdown(false)}
                  className="w-auto mx-auto rounded-xl h-9 px-8 text-sm font-semibold"
                  variant="hero"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Methods Dialog */}
      <Dialog open={showPaymentMethods} onOpenChange={(open) => { setShowPaymentMethods(open); if (!open) setShowAddCard(false); }}>
        <DialogContent className="sm:max-w-md bg-background border-border !rounded-[25px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden">
          <AnimatePresence mode="wait">
            {!showAddCard ? (
              <motion.div key="methods" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
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
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl border border-dashed border-border hover:bg-muted/40 transition-colors mb-6"
                  >
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
              </motion.div>
            ) : (
              <motion.div key="add-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowAddCard(false)} className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors">
                      <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                    <CreditCard className="w-7 h-7 text-foreground" />
                    <span className="text-[1.65rem] font-bold text-foreground">Payment</span>
                  </div>
                </div>

                <div className="px-7 pb-2">
                  <DialogTitle className="text-2xl font-bold text-foreground mb-4">Add Card</DialogTitle>

                  {/* Card Number */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Card number</label>
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={newCard.number}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                        setNewCard(prev => ({ ...prev, number: formatted }));
                      }}
                      inputMode="numeric"
                      className="placeholder:text-foreground/30 hover:border-primary/40 transition-colors font-mono tracking-wider"
                    />
                  </div>

                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Expiry date</label>
                      <Input
                        placeholder="MM / YY"
                        value={newCard.expiry}
                        onChange={(e) => {
                          let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                          if (raw.length >= 3) raw = raw.slice(0, 2) + " / " + raw.slice(2);
                          setNewCard(prev => ({ ...prev, expiry: raw }));
                        }}
                        inputMode="numeric"
                        className="placeholder:text-foreground/30 hover:border-primary/40 transition-colors font-mono tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">CVV</label>
                      <div className="relative">
                        <Input
                          type={showCvv ? "text" : "password"}
                          placeholder="•••"
                          value={newCard.cvv}
                          onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          inputMode="numeric"
                          className="placeholder:text-foreground/30 hover:border-primary/40 transition-colors font-mono tracking-wider pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Set as default */}
                  <div className="flex items-center justify-between py-3 mb-4">
                    <span className="text-sm font-medium text-foreground">Set as default method</span>
                    <button
                      onClick={() => setNewCard(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        newCard.isDefault ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform",
                        newCard.isDefault ? "translate-x-[22px]" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>

                  {/* Security note */}
                  <div className="flex items-start gap-2 mb-6">
                    <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">Your card details will be saved securely and encrypted end-to-end.</p>
                  </div>

                  {/* Terms note */}
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    Your card may be charged to verify it's valid. That amount will be automatically refunded. By adding a card, you agree to our{" "}
                    <Link to="/terms" className="text-primary hover:underline">terms and conditions</Link>.
                  </p>
                </div>

                <div className="px-7 pb-7">
                  <Button
                    onClick={() => {
                      setNewCard({ number: "", expiry: "", cvv: "", isDefault: false });
                      setShowCvv(false);
                      setShowAddCard(false);
                    }}
                    disabled={newCard.number.replace(/\s/g, "").length < 15 || newCard.expiry.length < 7 || newCard.cvv.length < 3}
                    className="w-full rounded-xl h-9 px-8 text-sm font-semibold"
                    variant="hero"
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Book;
