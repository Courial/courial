import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useCourialSocket, type CourialDriver } from "@/hooks/useCourialSocket";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell, Clock, CalendarIcon, ChevronDown, ChevronLeft, Info, Plus, Trash2, CreditCard, Star, X, Weight, Sparkles, Zap, ArrowLeft, Shield, Eye, EyeOff, MessageCircle, Headset, Send, Phone, Mail } from "lucide-react";
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
  const [deliverRedraftSuggestion, setDeliverRedraftSuggestion] = useState<string | null>(null);
  const [isDeliverRedrafting, setIsDeliverRedrafting] = useState(false);

  // Deliver-specific: multi-stop
  const [deliverMultiStop, setDeliverMultiStop] = useState(false);
  const [deliverExtraStops, setDeliverExtraStops] = useState<Array<{ address: string; placeName: string | null; coords: { lat: number; lng: number } | null }>>([]);

  // Deliver-specific: language + expenses
  const [deliverLanguage, setDeliverLanguage] = useState<string | null>(null);
   const [deliverHasExpenses, setDeliverHasExpenses] = useState<boolean | null>(null);
   const [deliverOrderValue, setDeliverOrderValue] = useState("");
    const [showHighValueDialog, setShowHighValueDialog] = useState(false);
    const [declineProtection, setDeclineProtection] = useState(false);
  const [deliverExpenseItems, setDeliverExpenseItems] = useState<Array<{ description: string; amount: string }>>([{ description: "", amount: "0" }]);
  const [deliverAllowOverage, setDeliverAllowOverage] = useState(false);
  const [deliverOverageLimit, setDeliverOverageLimit] = useState("0");
  const [deliverExpenseCapWarning, setDeliverExpenseCapWarning] = useState<number | null>(null);
  const [deliverOverageCapWarning, setDeliverOverageCapWarning] = useState(false);
  const [deliverExpenseRedraftSuggestion, setDeliverExpenseRedraftSuggestion] = useState<{ index: number; text: string } | null>(null);
  const [isDeliverExpenseRedrafting, setIsDeliverExpenseRedrafting] = useState<number | null>(null);

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
  const [nearbyCourials, setNearbyCourials] = useState<{ id: number; name: string; image: string; distance: string }[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: "user" | "courial"; text: string; time: string }[]>([
    { from: "courial", text: "Hey! I'm on my way to the pickup. Let me know if you have any instructions.", time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setChatMessages(prev => [...prev, { from: "user", text: chatInput.trim(), time: now }]);
    setChatInput("");
    // Simulate courial reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Got it, thanks for letting me know!",
        "No problem, I'll handle that.",
        "Sure thing! Almost there.",
        "Thanks for the heads up 👍",
        "On it!",
      ];
      setChatMessages(prev => [...prev, {
        from: "courial",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      }]);
    }, 1500);
  }, [chatInput]);

  const [showContactSupport, setShowContactSupport] = useState(false);
  const [acceptedCourial, setAcceptedCourial] = useState<CourialDriver | null>(null);
  const [socketEnabled, setSocketEnabled] = useState(false);

  // Socket: connect after successful booking, listen for courial acceptance
  const handleCourialAccepted = useCallback((driver: CourialDriver) => {
    console.log("[Book] Courial accepted order:", driver);
    setAcceptedCourial(driver);
    // Immediately transition to active tracking when a courial accepts
    setBookingState("active");
    setLoadingProgress(100);
    setDeliveryStep(0);
    toast.success(`${driver.name} accepted your order!`);
  }, []);

  // Read token reactively when socket becomes enabled
  const [courialToken, setCourialToken] = useState<string | null>(null);
  useEffect(() => {
    if (socketEnabled) {
      const token = localStorage.getItem("courial_api_token");
      console.log("[Book] socketEnabled=true, courialToken:", token ? `${token.substring(0, 20)}...` : "NULL");
      setCourialToken(token);
    }
  }, [socketEnabled]);

  useCourialSocket({
    token: courialToken,
    enabled: socketEnabled,
    onAccepted: handleCourialAccepted,
  });
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

  // Use real courial photos when available, otherwise stock
  const activeProfiles = useMemo(() => {
    if (nearbyCourials.length > 0) return nearbyCourials.map(c => c.image);
    return courialProfiles;
  }, [nearbyCourials, courialProfiles]);

  // Cycle through profile photos during loading
  useEffect(() => {
    if (bookingState !== "loading") return;
    const interval = setInterval(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % activeProfiles.length);
    }, 600);
    return () => clearInterval(interval);
  }, [bookingState, activeProfiles.length]);

  const paymentMethods = [
    { id: "visa-4242", type: "visa", label: "Visa", last4: "4242", icon: visaIcon },
    { id: "mc-8831", type: "mastercard", label: "Mastercard", last4: "8831", icon: mastercardIcon },
  ];

  const activePayment = paymentMethods.find(p => p.id === selectedPaymentMethod) || paymentMethods[0];

  const needsVehicle = selectedService === "deliver";
  const conciergeReady = selectedService === "concierge" && (conciergeSubCategory !== null || conciergeCategory === "something-else") && conciergeDescription.trim().length > 0;
  const isBaseFormValid = selectedService === "concierge"
    ? conciergeReady
    : pickup.trim().length > 0 && dropoff.trim().length > 0 && (!needsVehicle || selectedVehicle !== null) && notes.trim().length > 0;
  const isFormValid = selectedService === "concierge"
    ? conciergeReady
    : isBaseFormValid && deliverOrderValue.trim().length > 0 && Number(deliverOrderValue.replace(/,/g, '')) > 0;

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

  // Redraft handler for Deliver expense items
  const handleDeliverExpenseRedraft = useCallback(async (index: number) => {
    const item = deliverExpenseItems[index];
    if (!item || item.description.trim().length < 10 || isDeliverExpenseRedrafting !== null) return;
    setIsDeliverExpenseRedrafting(index);
    setDeliverExpenseRedraftSuggestion(null);
    try {
      const { data, error } = await supabase.functions.invoke("redraft-concierge", {
        body: { description: item.description, category: `${selectedService === "valet" ? "Valet" : "Delivery"} — Expense Item` },
      });
      if (error || !data?.redrafted) {
        toast.error("Couldn't redraft — please try again.");
      } else {
        setDeliverExpenseRedraftSuggestion({ index, text: data.redrafted });
      }
    } catch {
      toast.error("Redraft failed.");
    } finally {
      setIsDeliverExpenseRedrafting(null);
    }
  }, [deliverExpenseItems, selectedService, isDeliverExpenseRedrafting]);

  // Redraft with AI handler for Deliver/Valet notes
  const handleDeliverRedraft = useCallback(async () => {
    if (notes.trim().length < 10 || isDeliverRedrafting) return;
    setIsDeliverRedrafting(true);
    setDeliverRedraftSuggestion(null);
    try {
      const { data, error } = await supabase.functions.invoke("redraft-concierge", {
        body: { description: notes, category: `${selectedService === "valet" ? "Valet" : "Delivery"} Notes` },
      });
      if (error || !data?.redrafted) {
        toast.error("Couldn't redraft — please try again.");
      } else {
        setDeliverRedraftSuggestion(data.redrafted);
      }
    } catch {
      toast.error("Redraft failed.");
    } finally {
      setIsDeliverRedrafting(false);
    }
  }, [notes, selectedService, isDeliverRedrafting]);

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
        if (conciergeServiceMode) payload.serviceMode = conciergeServiceMode;
        if (conciergeHasExpenses && conciergeExpenseItems.length > 0) {
          payload.expenseItems = conciergeExpenseItems.filter(e => e.description.trim());
          payload.allowOverage = conciergeAllowOverage;
          if (conciergeAllowOverage && conciergeOverageLimit !== "0") {
            payload.overageLimit = Number(conciergeOverageLimit);
          }
        }
      } else {
        // Deliver / Valet specific fields
        if (deliverLanguage) payload.preferredLanguage = deliverLanguage;
        if (deliverMultiStop && deliverExtraStops.length > 0) {
          payload.extraStops = deliverExtraStops.filter(s => s.address && s.coords).map(s => ({
            address: s.address,
            placeName: s.placeName,
            lat: s.coords!.lat,
            lng: s.coords!.lng,
          }));
        }
        if (deliverHasExpenses && deliverExpenseItems.length > 0) {
          payload.expenseItems = deliverExpenseItems.filter(e => e.description.trim());
          payload.allowOverage = deliverAllowOverage;
          if (deliverAllowOverage && deliverOverageLimit !== "0") {
            payload.overageLimit = Number(deliverOverageLimit);
          }
        }
      }

      if (timeMode === "later" && selectedDate) {
        payload.date = format(selectedDate, "yyyy-MM-dd");
        payload.time = selectedTime;
      }

      if (over70lbs) {
        payload.weightCategory = "over_70_lbs";
        if (heavyWeight) payload.weight = Number(heavyWeight);
        if (heavyItems) payload.itemCount = Number(heavyItems);
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
        // FunctionsHttpError contains the response context — try to read the body
        let errorBody: any = null;
        try {
          if (error?.context?.body) {
            const reader = error.context.body.getReader?.();
            if (reader) {
              const { value } = await reader.read();
              errorBody = JSON.parse(new TextDecoder().decode(value));
            }
          }
        } catch (_) { /* ignore parse errors */ }

        const is401 =
          errorBody?.details?.code === 401 ||
          errorBody?.error?.message?.includes?.("Invalid Token") ||
          String(error?.message || "").includes("401");

        if (is401) {
          console.warn("[book-delivery] Courial token expired — clearing and prompting re-auth");
          localStorage.removeItem("courial_api_token");
          toast.error("Your session has expired. Please sign out and sign back in to refresh your token.", { duration: 6000 });
        } else {
          toast.error(errorBody?.error?.message || "Booking failed — please try again.");
        }
        setBookingState("input");
        return;
      }

      // Also check for inline error responses (supabase.functions.invoke may not throw on 401)
      if (data?.error || data?.details?.code === 401) {
        console.error("[book-delivery] API error response:", data);
        if (data?.details?.code === 401 || data?.error?.message?.includes?.("Invalid Token")) {
          localStorage.removeItem("courial_api_token");
          toast.error("Your session has expired. Please sign out and sign back in to refresh your token.", { duration: 6000 });
        } else {
          toast.error(data?.error?.message || data?.error || "Booking failed.");
        }
        setBookingState("input");
        return;
      }

      if (data?.success === 1 && data?.data?.deliveryId) {
        deliveryIdRef.current = data.data.deliveryId;
        if (data.data.nearbyCourials?.length) {
          setNearbyCourials(data.data.nearbyCourials);
        }
        // Enable socket connection to listen for courial acceptance
        setSocketEnabled(true);
        console.log("[book-delivery] Delivery created:", data.data.deliveryId, "— socket enabled, listening for AcceptOrder_listener");
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
  }, [isFormValid, user, timeMode, selectedService, selectedVehicle, notes, pickup, pickupCoords, dropoff, dropoffCoords, selectedDate, selectedTime, over70lbs, heavyWeight, heavyItems, twoCourials, hasStairs, conciergeDescription, conciergeCategory, conciergeSubCategory, conciergeStartAddress, conciergeStopAddress, conciergeFinalAddress, conciergeLanguage, conciergeServiceMode, conciergeHasExpenses, conciergeExpenseItems, conciergeAllowOverage, conciergeOverageLimit, deliverLanguage, deliverMultiStop, deliverExtraStops, deliverHasExpenses, deliverExpenseItems, deliverAllowOverage, deliverOverageLimit]);

  // Animate loading progress — caps at 95% and waits for socket AcceptOrder_listener
  useEffect(() => {
    if (bookingState !== "loading") return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 95) {
          // Hold at 95% — transition happens via handleCourialAccepted when socket fires
          return 95;
        }
        return prev + (95 / 150); // reach 95% in ~15s (100ms interval)
      });
    }, 100);
    return () => clearInterval(interval);
  }, [bookingState]);

  const handleCancelBooking = useCallback(() => {
    setBookingState("input");
    setLoadingProgress(0);
    setDeliveryStep(0);
    setSocketEnabled(false);
    setAcceptedCourial(null);
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

  const handleExtraStopSelect = useCallback((index: number, place: any) => {
    if (place.geometry?.location) {
      const name = place.name || null;
      const addr = place.formatted_address || "";
      const isEstablishment = name && !addr.startsWith(name);
      setDeliverExtraStops(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          placeName: isEstablishment ? name : null,
          coords: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
        };
        return updated;
      });
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
                      <div className="group relative rounded-2xl glass-card overflow-hidden h-[80px] p-4 flex items-center gap-4 border-primary border transition-all duration-300">
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
                        const cardClass = `group relative rounded-2xl glass-card overflow-hidden h-[150px] p-6 flex flex-col justify-center transition-all duration-300 border border-foreground/10 ${isSelected ? "!border-primary" : "hover:border-primary/50"}`;

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
                          className="h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-border transition-colors w-[110px]"
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
                            isActive ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-40 scale-100"
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
                            isActive ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-40 scale-100"
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
                  <>
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
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug italic">We will make our best efforts to match you with your preferred language; however, this is subject to availability.</p>
                  </>
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
                          ? "border border-primary text-foreground"
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
                        <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background focus-within:border-border">
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
                        <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background focus-within:border-border">
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
                        <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background focus-within:border-border">
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
                  <div className="px-4 py-4 border border-border rounded-xl bg-background focus-within:border-border">
                    <textarea
                      placeholder="Outline the scope of work, preferences, timing requirements, special instructions, relevant contact names and phone numbers, and any external links the Courial will need access to. You may choose to have AI refine your message for clarity and completeness before confirming your booking."
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
                          ? "border border-primary text-foreground"
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
                      className="h-3 w-3 rounded border border-border/60 accent-foreground cursor-pointer appearance-none checked:appearance-auto bg-background"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    Check box if the Courial needs to make purchases on your behalf.
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
                              className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 resize-none overflow-hidden"
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
                                className="w-20 rounded-lg border border-border/60 bg-background pl-5 pr-2 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
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
                              className="w-14 rounded-lg border border-border/60 bg-background pl-4 pr-1 py-0 text-[10px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 disabled:opacity-40"
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

                  {/* Multiple Stops */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-foreground">Multiple Stops</h4>
                      <input
                        type="checkbox"
                        checked={deliverMultiStop}
                        onChange={(e) => {
                          setDeliverMultiStop(e.target.checked);
                          if (!e.target.checked) setDeliverExtraStops([]);
                        }}
                        className="h-3 w-3 rounded border border-border/60 accent-foreground cursor-pointer appearance-none checked:appearance-auto bg-background"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      Check box if the Courial is required to make multiple stops.
                    </p>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-0">
                    <div className="relative group">
                      <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-border mb-2">
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500" />
                        <div className="flex-1 min-w-0">
                          {pickupPlaceName && pickupCoords && (
                            <div className="text-sm font-semibold text-foreground leading-tight">{pickupPlaceName}</div>
                          )}
                          <AddressAutocomplete
                            placeholder="Pickup location"
                            value={pickup}
                            onChange={(v) => { setPickup(v); if (!v) { setPickupPlaceName(null); setPickupCoords(null); } }}
                            onPlaceSelect={handlePickupSelect}
                            className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${pickupPlaceName && pickupCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                          />
                        </div>
                        <button onClick={() => { setPickup(""); setPickupPlaceName(null); setPickupCoords(null); }} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                          <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                        </button>
                      </div>
                    </div>
                    <div className="relative group mt-2">
                      <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-border">
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500" />
                        <div className="flex-1 min-w-0">
                          {dropoffPlaceName && dropoffCoords && (
                            <div className="text-sm font-semibold text-foreground leading-tight">{dropoffPlaceName}</div>
                          )}
                          <AddressAutocomplete
                            placeholder={deliverMultiStop ? "Dropoff #1" : "Dropoff location"}
                            value={dropoff}
                            onChange={(v) => { setDropoff(v); if (!v) { setDropoffPlaceName(null); setDropoffCoords(null); } }}
                            onPlaceSelect={handleDropoffSelect}
                            className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${dropoffPlaceName && dropoffCoords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                          />
                        </div>
                        <button onClick={() => { setDropoff(""); setDropoffPlaceName(null); setDropoffCoords(null); }} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                          <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                        </button>
                      </div>
                    </div>

                    {/* Extra stop fields when multi-stop enabled */}
                    <AnimatePresence>
                      {deliverMultiStop && deliverExtraStops.map((stop, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="relative group pt-2"
                        >
                          <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-border">
                            <div
                              className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 cursor-pointer"
                              onDoubleClick={() => setDeliverExtraStops(prev => prev.filter((_, idx) => idx !== i))}
                              title="Double-tap to remove"
                            />
                            <div className="flex-1 min-w-0">
                              {stop.placeName && stop.coords && (
                                <div className="text-sm font-semibold text-foreground leading-tight">{stop.placeName}</div>
                              )}
                              <AddressAutocomplete
                                placeholder={`Dropoff #${i + 2}`}
                                value={stop.address}
                                onChange={(v) => {
                                  setDeliverExtraStops(prev => {
                                    const updated = [...prev];
                                    updated[i] = { ...updated[i], address: v, ...(v ? {} : { placeName: null, coords: null }) };
                                    return updated;
                                  });
                                }}
                                onPlaceSelect={(place) => handleExtraStopSelect(i, place)}
                                className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${stop.placeName && stop.coords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                              />
                            </div>
                            <button
                              onClick={() => { setDeliverExtraStops(prev => { const u = [...prev]; u[i] = { address: "", placeName: null, coords: null }; return u; }); }}
                              className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add Stop button */}
                    {deliverMultiStop && (
                      <div className="pt-2 mt-1 flex items-center justify-center gap-3">
                        <Button
                          type="button"
                          variant="hero"
                          className="rounded-lg h-10 text-lg font-semibold px-6"
                          onClick={() => {
                            if (deliverExtraStops.length >= 19) {
                              toast.error("Maximum of 20 dropoffs reached.");
                              return;
                            }
                            setDeliverExtraStops(prev => [...prev, { address: "", placeName: null, coords: null }]);
                          }}
                        >
                          Add Stop
                        </Button>
                        <p className="text-[13px] text-muted-foreground leading-tight">
                          Double tap <span className="inline-block w-2.5 h-2.5 bg-red-500 align-middle mx-0.5" /> to<br />remove stop
                        </p>
                      </div>
                    )}

                    {/* ETA info — visible when both addresses set */}
                    {pickupCoords && dropoffCoords && (
                      <p className="text-[15px] font-medium text-muted-foreground text-center py-4 flex items-center justify-center gap-1.5">
                        <img src={deliverBox} alt="" className="w-5 h-5" />
                        4 mins away • 2:01 AM dropoff
                      </p>
                    )}
                  </div>

                  {/* Preferred Language for Deliver/Valet */}
                  <div className="mb-4 mt-3">
                    {deliverLanguage ? (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeliverLanguage(null)}
                            className="p-0.5 hover:opacity-70 transition-opacity"
                          >
                            <ChevronLeft className="w-4 h-4 text-foreground" />
                          </button>
                          <span className="text-xs font-medium text-muted-foreground">Preferred Language</span>
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-normal leading-none border border-primary text-foreground">
                            {deliverLanguage}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug italic">We will make our best efforts to match you with your preferred language; however, this is subject to availability.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Select Preferred Language</p>
                        <div className="flex flex-wrap gap-2">
                          {["English", "Spanish", "French", "Portuguese", "Arabic", "Chinese", "Hindi", "Japanese", "Korean", "Thai"].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setDeliverLanguage(lang)}
                              className="px-2.5 py-1 rounded-full text-[11px] font-normal transition-all leading-none border border-border/60 bg-background text-foreground/75 hover:border-foreground/50"
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notes Field with Redraft */}
                   <div className="relative mb-1 mt-2">
                    <div className="px-4 py-4 border border-border rounded-xl bg-background focus-within:border-border">
                      <textarea
                        placeholder="Please provide all relevant pickup and drop-off details, including contact numbers, special instructions, access information, gate codes, and any other important notes, as well as any external links the Courial will need access to."
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/35 outline-none resize-none overflow-hidden"
                        rows={1}
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); setDeliverRedraftSuggestion(null); }}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }}
                        ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                      />
                    </div>
                    {/* Redraft with AI button */}
                    {notes.trim().length > 10 && (
                      <div className="flex justify-end -mt-3 relative z-10 pr-2">
                        <button
                          onClick={handleDeliverRedraft}
                          disabled={isDeliverRedrafting}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(210,100%,50%)] text-white hover:bg-[hsl(210,100%,45%)] transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          {isDeliverRedrafting ? "Redrafting…" : "Redraft with AI"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Deliver Redraft Suggestion */}
                  <AnimatePresence>
                    {deliverRedraftSuggestion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="p-3 rounded-xl border border-primary/30 bg-primary/5">
                          <p className="text-sm text-foreground mb-2">{deliverRedraftSuggestion}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setNotes(deliverRedraftSuggestion); setDeliverRedraftSuggestion(null); }}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => setDeliverRedraftSuggestion(null)}
                              className="px-3 py-1 rounded-full text-xs font-semibold border border-border text-foreground hover:bg-muted"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Additional Expenses for Deliver/Valet */}
                  <div className="mb-3 mt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-foreground">Additional Expenses</h4>
                      <input
                        type="checkbox"
                        checked={deliverHasExpenses === true}
                        onChange={(e) => setDeliverHasExpenses(e.target.checked)}
                        className="h-3 w-3 rounded border border-border/60 accent-foreground cursor-pointer appearance-none checked:appearance-auto bg-background"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                      Check box if the Courial needs to make purchases on your behalf.
                    </p>
                  </div>

                  <AnimatePresence>
                    {deliverHasExpenses === true && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3 mb-3 overflow-hidden"
                      >
                        {deliverExpenseItems.map((item, index) => (
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
                                  const updated = [...deliverExpenseItems];
                                  updated[index].description = e.target.value;
                                  setDeliverExpenseItems(updated);
                                  setDeliverExpenseRedraftSuggestion(prev => prev?.index === index ? null : prev);
                                  e.target.style.height = 'auto';
                                  e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                placeholder="Describe any expected purchases such as packaging, supplies, or other items here."
                                rows={1}
                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 resize-none overflow-hidden"
                              />
                              {item.description.trim().length > 10 && (
                                <div className="flex justify-end -mt-3 relative z-10 pr-2">
                                  <button
                                    type="button"
                                    onClick={() => handleDeliverExpenseRedraft(index)}
                                    disabled={isDeliverExpenseRedrafting !== null}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(210,100%,50%)] text-white hover:bg-[hsl(210,100%,45%)] transition-colors disabled:opacity-50"
                                  >
                                    <Sparkles className="w-2.5 h-2.5" />
                                    {isDeliverExpenseRedrafting === index ? "Redrafting…" : "Redraft with AI"}
                                  </button>
                                </div>
                              )}
                              <AnimatePresence>
                                {deliverExpenseRedraftSuggestion?.index === index && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <div className="p-2 rounded-lg border border-primary/30 bg-primary/5">
                                      <p className="text-xs text-foreground mb-1.5">{deliverExpenseRedraftSuggestion.text}</p>
                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...deliverExpenseItems];
                                            updated[index].description = deliverExpenseRedraftSuggestion.text;
                                            setDeliverExpenseItems(updated);
                                            setDeliverExpenseRedraftSuggestion(null);
                                          }}
                                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeliverExpenseRedraftSuggestion(null)}
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
                                        const updated = [...deliverExpenseItems];
                                        updated[index].amount = raw;
                                        setDeliverExpenseItems(updated);
                                        setDeliverExpenseCapWarning(null);
                                      } else {
                                        setDeliverExpenseCapWarning(index);
                                        setTimeout(() => setDeliverExpenseCapWarning(prev => prev === index ? null : prev), 2500);
                                      }
                                    }
                                  }}
                                  placeholder="0"
                                  onFocus={(e) => e.target.select()}
                                  className="w-20 rounded-lg border border-border/60 bg-background pl-5 pr-2 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                                />
                              </div>
                              {deliverExpenseCapWarning === index && (
                                <span className="text-[9px] text-destructive font-medium whitespace-nowrap">Sorry, capped at $500</span>
                              )}
                            </div>
                            {deliverExpenseItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setDeliverExpenseItems(deliverExpenseItems.filter((_, i) => i !== index))}
                                className="text-[10px] text-primary font-medium underline underline-offset-2 hover:opacity-70"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => setDeliverExpenseItems([...deliverExpenseItems, { description: "", amount: "0" }])}
                          className="w-full rounded-lg border border-dashed border-border/60 bg-background py-2 text-[11px] font-medium text-foreground hover:bg-muted/50 transition-colors"
                        >
                          + Add Another Expense
                        </button>

                        <div className="pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={deliverAllowOverage}
                              onChange={(e) => setDeliverAllowOverage(e.target.checked)}
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
                                value={deliverOverageLimit}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) {
                                    const num = Number(val);
                                    if (val === '' || num <= 100) {
                                      setDeliverOverageLimit(val);
                                      setDeliverOverageCapWarning(false);
                                    } else {
                                      setDeliverOverageCapWarning(true);
                                      setTimeout(() => setDeliverOverageCapWarning(false), 2500);
                                    }
                                  }
                                }}
                                placeholder="25"
                                disabled={!deliverAllowOverage}
                                onFocus={(e) => e.target.select()}
                                className="w-14 rounded-lg border border-border/60 bg-background pl-4 pr-1 py-0 text-[10px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 disabled:opacity-40"
                              />
                            </div>
                            {deliverOverageCapWarning && (
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

                  {/* Order Value — only show when required fields are filled */}
                  {isBaseFormValid && (
                  <div className="mb-3 mt-4">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-xs font-medium text-foreground leading-none">Order Value</h4>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={deliverOrderValue ? Number(deliverOrderValue.replace(/,/g, '')).toLocaleString('en-US') : ''}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/,/g, '');
                            if (raw === '' || /^\d+$/.test(raw)) {
                              setDeliverOrderValue(raw);
                            }
                          }}
                          placeholder="0"
                          onFocus={(e) => e.target.select()}
                          className="w-20 rounded-lg border border-border/60 bg-background pl-5 pr-2 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                      Complimentary coverage is included for total declared order values up to $100.
                    </p>

                    <AnimatePresence>
                      {Number(deliverOrderValue) > 100 && Number(deliverOrderValue) <= 200 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1.5">
                            <p className="text-[11px] font-medium text-foreground">For orders exceeding $100 in declared value:</p>
                            <ul className="text-[10px] text-muted-foreground leading-relaxed space-y-0.5">
                              <li>• $101–$200: Protection fee added at 5% of value.</li>
                              <li>• Supporting documentation verifying value will be required as well as photos of item(s) being packaged.</li>
                              <li>• For eligible high-value orders over $200, the Courial must physically witness the item being placed into the package prior to sealing.</li>
                            </ul>
                            <p className="text-[10px] text-muted-foreground mt-1">All protection is subject to Courial's Delivery Protection & Coverage Policy.</p>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={declineProtection}
                                onChange={(e) => setDeclineProtection(e.target.checked)}
                                className="h-3 w-3 rounded border border-border/60 accent-foreground cursor-pointer appearance-none checked:appearance-auto bg-background"
                              />
                              <span className="text-[10px] text-muted-foreground">I decline additional protection coverage and wish to proceed without it.</span>
                            </label>
                          </div>
                        </motion.div>
                      )}
                      {Number(deliverOrderValue) > 200 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
                            <p className="text-[11px] font-medium text-foreground">
                              For orders valued at $200 or more, please contact{" "}
                              <Link to="/help" className="text-primary hover:opacity-80">Courial Support</Link>{" "}
                              to complete this booking.
                            </p>
                            <Button
                              variant="hero"
                              size="sm"
                              className="text-xs h-8"
                              onClick={() => setShowHighValueDialog(true)}
                            >
                              Send to Courial
                            </Button>
                            <label className="flex items-center gap-2 mt-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={declineProtection}
                                onChange={(e) => setDeclineProtection(e.target.checked)}
                                className="h-3 w-3 rounded border border-border/60 accent-foreground cursor-pointer appearance-none checked:appearance-auto bg-background"
                              />
                              <span className="text-[10px] text-muted-foreground">I decline additional protection coverage and wish to proceed without it.</span>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  )}

                  {/* Delivery Requirements Notice */}
                  <Collapsible className="mt-3 text-xs text-foreground">
                    <CollapsibleTrigger className="flex items-center gap-1 font-semibold cursor-pointer hover:opacity-70 transition-opacity">
                      {selectedService === "valet" ? "Valet Service Requirements" : "Delivery Requirements"}
                      <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-2">
                      <div>
                        <p className="text-muted-foreground leading-relaxed">Before placing your order, please confirm:</p>
                        <ul className="text-muted-foreground leading-relaxed mt-1 space-y-0.5">
                          <li>• The declared value is accurate</li>
                          <li>• Items are properly packaged and ready at pickup</li>
                          <li>• Contents are not restricted</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Restricted Items</p>
                        <p className="text-muted-foreground leading-relaxed">Courial does not transport alcohol, drugs, firearms, hazardous materials, illegal goods, cash, or items of extraordinary sentimental value.</p>
                        <p className="text-muted-foreground leading-relaxed mt-1">All deliveries must comply with applicable laws and Courial platform policies. Non-compliant orders may be canceled.</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Delivery Protection</p>
                        <p className="text-muted-foreground leading-relaxed">Eligible deliveries include complimentary protection for declared values up to $100.</p>
                        <p className="text-muted-foreground leading-relaxed mt-1">For items exceeding $100 in declared value, Extended Protection may be added during booking. Additional documentation and packaging requirements may apply.</p>
                        <p className="text-muted-foreground leading-relaxed mt-1">Protection terms, eligibility, and claim guidelines are outlined in our Delivery Protection & Coverage Policy.</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground leading-relaxed">By confirming your order, you agree to Courial's <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and Delivery Protection & Coverage Policy.</p>
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
                        disabled={!isFormValid || (Number(deliverOrderValue) > 200 && !declineProtection)}
                        onClick={handleBookingSubmit}
                        className="rounded h-10 text-lg font-semibold px-6"
                        variant={isFormValid && !(Number(deliverOrderValue) > 200 && !declineProtection) ? "hero" : "secondary"}
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
                  {acceptedCourial?.image ? (
                    <img src={acceptedCourial.image} alt={acceptedCourial.name} className="w-[60px] h-[60px] rounded-full object-cover border border-border" />
                  ) : (
                    <div className="rounded-full bg-muted flex items-center justify-center text-xl font-bold text-foreground" style={{ width: 60, height: 60 }}>
                      {(acceptedCourial?.name || "M").charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{acceptedCourial?.name || "Marcus"}</h3>
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">{acceptedCourial?.rating?.toFixed(2) || "4.68"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {acceptedCourial?.memberSince
                        ? `Courial Since '${new Date(acceptedCourial.memberSince).getFullYear().toString().slice(-2)}`
                        : "Courial Since '25"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {acceptedCourial
                        ? `${acceptedCourial.vehicleColor} ${acceptedCourial.vehicleMake} ${acceptedCourial.vehicleModel}`.trim() || "Vehicle info pending"
                        : "Black Toyota Corolla"}
                    </div>
                    <div className="text-xs font-bold text-foreground mt-0.5">{acceptedCourial?.licensePlate || "ABC1234"}</div>
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
                  {deliverLanguage && (
                    <div className="py-2 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Preferred Language</p>
                      <p className="text-xs text-foreground">{deliverLanguage}</p>
                    </div>
                  )}
                  {deliverOrderValue && (
                    <div className="py-2 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Order Value</p>
                      <p className="text-xs font-semibold text-foreground">${deliverOrderValue}</p>
                    </div>
                  )}
                  {deliverHasExpenses && deliverExpenseItems.some(e => e.description.trim()) && (
                    <div className="py-2 border-b border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Expenses</p>
                      <div className="space-y-1">
                        {deliverExpenseItems.filter(e => e.description.trim()).map((item, i) => (
                          <div key={i} className="flex justify-between items-start gap-2">
                            <p className="text-xs text-foreground flex-1">{item.description}</p>
                            {Number(item.amount) > 0 && <span className="text-xs text-muted-foreground shrink-0">~${item.amount}</span>}
                          </div>
                        ))}
                        {deliverAllowOverage && Number(deliverOverageLimit) > 0 && (
                          <p className="text-[10px] text-muted-foreground italic">Overage allowed up to ${deliverOverageLimit}</p>
                        )}
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
                  {deliverMultiStop && deliverExtraStops.length > 0 && deliverExtraStops.filter(s => s.address).map((stop, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2.5 h-2.5 rounded-sm bg-primary/60 mt-[5px]" />
                      <div className="min-w-0">
                        {stop.placeName && <p className="text-sm font-semibold text-foreground leading-tight">{stop.placeName}</p>}
                        <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                      </div>
                    </div>
                  ))}
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

              {/* Contact & Chat */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setShowContactSupport(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 transition-colors text-sm font-semibold text-foreground"
                >
                  <Headset className="w-4 h-4" />
                  Contact Support
                </button>
                <button
                  onClick={() => setShowChat(prev => !prev)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors text-sm font-semibold",
                    showChat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/40 hover:bg-muted/70 text-foreground"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Message Courial
                </button>
              </div>

              {/* Chat Box */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="rounded-xl border border-border bg-background">
                      <div className="p-3 border-b border-border">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chat with Marcus</p>
                      </div>
                      <div className="p-3 space-y-2.5 max-h-[200px] overflow-y-auto">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}>
                            <div
                              className={cn(
                                "max-w-[75%] rounded-2xl px-3 py-2",
                                msg.from === "user"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              )}
                            >
                              <p className="text-sm leading-snug">{msg.text}</p>
                              <p className={cn(
                                "text-[10px] mt-0.5",
                                msg.from === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                              )}>{msg.time}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="p-2 border-t border-border flex gap-2">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                          placeholder="Type a message..."
                          className="text-sm h-9"
                        />
                        <button
                          onClick={handleSendChat}
                          disabled={!chatInput.trim()}
                          className="shrink-0 w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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

        {/* Contact Support Dialog */}
        <Dialog open={showContactSupport} onOpenChange={setShowContactSupport}>
          <DialogContent className="sm:max-w-sm bg-background/75 backdrop-blur-md border-border">
            <DialogTitle className="text-xl font-bold text-foreground text-center">Contact Us</DialogTitle>
            <p className="text-sm text-muted-foreground text-center mb-4">Reach out through your preferred channel</p>
            <div className="flex items-center justify-center gap-5">
              {[
                { icon: Phone, title: "Call Us", href: "tel:+14152754707", color: "bg-emerald-500" },
                { icon: Mail, title: "Email Us", href: "mailto:support@courial.com?subject=I%20have%20a%20support%20request&body=Hi%20Courial%20Support%2C%0A%0AI%20need%20help%20with%20the%20following%20issue(s)%3A%0A%0A%7BPlease%20list%20your%20concerns%20here%7D", color: "bg-blue-500" },
                { icon: ({ className }: { className?: string }) => (
                  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                ), title: "WhatsApp", href: "https://api.whatsapp.com/message/PHOLSBHGQKTEO1", color: "bg-green-500" },
                { icon: ({ className }: { className?: string }) => (
                  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                ), title: "Line", href: "https://lin.ee/DJiZWFw", color: "bg-green-400" },
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <a
                    key={method.title}
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group"
                    title={method.title}
                  >
                    <div className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </a>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

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
               const mapExtraStops = !isConcierge ? deliverExtraStops.filter(s => s.coords).map(s => ({ coords: s.coords, address: s.address, placeName: s.placeName })) : [];
               const hasCoords = mapPickup || mapDropoff;
               return hasCoords ? (
             <div className="flex-1 relative">
               <BookingMap pickupCoords={mapPickup} dropoffCoords={mapPickup !== mapDropoff ? mapDropoff : null} stopCoords={mapStop} extraStops={mapExtraStops} pickupAddress={mapPickupAddr} dropoffAddress={mapDropoffAddr} stopAddress={mapStopAddr} pickupPlaceName={mapPickupName} dropoffPlaceName={mapDropoffName} stopPlaceName={mapStopName} bookingState={bookingState} vehicleType={mapVehicle} />
              
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
                              src={activeProfiles[currentProfileIndex]}
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
      <PaymentMethodsModal
        open={showPaymentMethods}
        onOpenChange={(open) => setShowPaymentMethods(open)}
        selectedPaymentMethod={selectedPaymentMethod}
        onSelectPaymentMethod={setSelectedPaymentMethod}
      />
      {/* High-Value Order Dialog */}
      <Dialog open={showHighValueDialog} onOpenChange={setShowHighValueDialog}>
        <DialogContent className="max-w-xs rounded-2xl text-center p-7">
          <DialogTitle className="text-base font-bold">Request Received</DialogTitle>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            Someone from the Courial Logistics team will contact you within 30 minutes to complete this order on your behalf.
          </p>
          <Button
            variant="hero"
            className="mt-4 w-full"
            onClick={() => setShowHighValueDialog(false)}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Book;
