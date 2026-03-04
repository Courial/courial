import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { getSavedAddresses, loadSavedAddressesFromDB } from "@/components/SavedAddressModal";
import { useCourialSocket, type CourialDriver } from "@/hooks/useCourialSocket";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ActivityPanel } from "@/components/booking/ActivityPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MapPin, Search, CarFront, ParkingCircle, Leaf, Box, ConciergeBell, Clock, CalendarIcon, ChevronDown, ChevronLeft, Info, Plus, Trash2, CreditCard, Star, X, Weight, Sparkles, Zap, ArrowLeft, Shield, Eye, EyeOff, MessageCircle, Headset, Phone, Mail, Check, Pause, Play } from "lucide-react";
import { RideChat } from "@/components/booking/RideChat";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import visaIcon from "@/assets/card-icons/visa.svg";
import mastercardIcon from "@/assets/card-icons/mastercard.svg";
import amexIcon from "@/assets/card-icons/amex.svg";
import discoverIcon from "@/assets/card-icons/discover.svg";
import { PaymentMethodsModal } from "@/components/PaymentMethodsModal";
import { SettingsModal } from "@/components/SettingsModal";

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
import conciergeBox from "@/assets/concierge-box.png";
import valetBox from "@/assets/valet-box.png";
import conciergeIcon from "@/assets/concierge-icon.png";
import deliverServiceIcon from "@/assets/service-icons/deliver.png";
import conciergeServiceIcon from "@/assets/service-icons/concierge.png";
import chauffeurServiceIcon from "@/assets/service-icons/chauffeur.png";
import valetServiceIcon from "@/assets/service-icons/valet.png";
import vehicleWalker from "@/assets/vehicle-walker.png";
import noVehicleIcon from "@/assets/no-vehicle-icon.png";
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
  { id: "roadside-assistance", label: "Roadside Assistance", desc: "Help when you need it most", subs: ["Towing", "Flat Tire", "Dead Battery / Jump Start", "Out of Gas", "Locked Out", "Something Else"] },
  { id: "home-support", label: "Home Support", desc: "Professional home services", subs: ["Locksmith", "Plumbing", "Electrical", "Appliance Installation", "Handyman Services", "Mounting Services (TVs & Art)", "Home Cleaning", "Event Cleanup", "Yard Cleanup", "Heavy Item Moving", "Furniture Assembly", "Junk Removal", "Donation Drop-Off"] },
  { id: "something-else", label: "Something Else?", desc: "Whatever the task, consider it handled.", subs: [] },
];

const valetCategories: ConciergeCategory[] = [
  { id: "charge", label: "Charge", desc: "EV charging & battery care", subs: ["Charging Station", "Mobile Charging Unit"] },
  { id: "drive", label: "Drive", desc: "We drive your car, so you can relax.", subs: ["Drive and wait", "Drive and park", "Personal Errand", "Car pick-up or drop-off"] },
];

const serviceCards: { id: ServiceId; label: string; desc: string; href: string; external?: boolean; image: string; icons: LucideIcon[]; serviceIcon: string }[] = [
  { id: "deliver", label: "Deliver", desc: "Your products deserve more than just a driver. They deserve Courial.", href: "/book", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80", icons: [Box], serviceIcon: deliverServiceIcon },
  { id: "concierge", label: "Concierge", desc: "Whatever. Whenever.\nIf it's possible, we'll get it done.", href: "/book", image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80", icons: [ConciergeBell], serviceIcon: conciergeServiceIcon },
  { id: "chauffeur", label: "Chauffeur", desc: "Professional drivers, ready when you need more than just a ride.", href: "https://chauffeured.ai/booking", external: true, image: chauffeurImage, icons: [CarFront], serviceIcon: chauffeurServiceIcon },
  { id: "valet", label: "Valet", desc: "More than parking. We park it, charge it, or drive it—whatever you need.", href: "/book", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&q=80", icons: [ParkingCircle, Leaf], serviceIcon: valetServiceIcon },
];


const Book = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showActivity = searchParams.get("view") === "activity";
  const sidebarRef = useRef<HTMLDivElement>(null);
  const deliveryIdRef = useRef<string | null>(null);
  const orderIdRef = useRef<string | null>(null);
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
  const [conciergeVehicle, setConciergeVehicle] = useState<VehicleId | "none" | null>(null);
  const [conciergeCategory, setConciergeCategory] = useState<string | null>(null);
  const [conciergeSubCategory, setConciergeSubCategory] = useState<string | null>(null);
  const [conciergeIsRemote, setConciergeIsRemote] = useState(false);
  const [wfhSearchPhase, setWfhSearchPhase] = useState<"home" | "work" | "area_code" | "address_initial" | "address_retry" | "exhausted" | null>(null);
  const [showKeepSearching, setShowKeepSearching] = useState(false);
  const wfhTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const [conciergeShowLangPicker, setConciergeShowLangPicker] = useState(false);
  const [conciergeServiceMode, setConciergeServiceMode] = useState<"hourly" | "daily" | null>(null);
  const [conciergeHasExpenses, setConciergeHasExpenses] = useState<boolean | null>(null);
  const [conciergeExpenseItems, setConciergeExpenseItems] = useState<Array<{ description: string; amount: string }>>([{ description: "", amount: "0" }]);
  const [conciergeAllowOverage, setConciergeAllowOverage] = useState(false);
  const [conciergeOverageLimit, setConciergeOverageLimit] = useState("0");
  const [conciergeOrderValue, setConciergeOrderValue] = useState("");
  const [expenseCapWarning, setExpenseCapWarning] = useState<number | null>(null);
  const [overageCapWarning, setOverageCapWarning] = useState(false);
  const [redraftSuggestion, setRedraftSuggestion] = useState<string | null>(null);
  const [isRedrafting, setIsRedrafting] = useState(false);
  const [expenseRedraftSuggestion, setExpenseRedraftSuggestion] = useState<{ index: number; text: string } | null>(null);
  const [isExpenseRedrafting, setIsExpenseRedrafting] = useState<number | null>(null);
  const [deliverRedraftSuggestion, setDeliverRedraftSuggestion] = useState<string | null>(null);
  const [isDeliverRedrafting, setIsDeliverRedrafting] = useState(false);

  // WFH task timer state
  const [wfhTaskElapsed, setWfhTaskElapsed] = useState(0); // seconds elapsed
  const [wfhTaskPaused, setWfhTaskPaused] = useState(false);
  const [wfhTaskRunning, setWfhTaskRunning] = useState(false);
  const wfhTaskIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Roadside Assistance vehicle details
  const [roadsideVehicleMake, setRoadsideVehicleMake] = useState("");
  const [roadsideVehicleModel, setRoadsideVehicleModel] = useState("");
  const [roadsideVehicleColor, setRoadsideVehicleColor] = useState("");
  const [roadsideLicensePlate, setRoadsideLicensePlate] = useState("");
  const [roadsideSafeLocation, setRoadsideSafeLocation] = useState<boolean | null>(null);
  const [roadsideCustomMake, setRoadsideCustomMake] = useState(false);
  const [roadsideCustomModel, setRoadsideCustomModel] = useState(false);
  const [roadsideCustomColor, setRoadsideCustomColor] = useState(false);
  const [roadsideModelSuggestions, setRoadsideModelSuggestions] = useState<string[]>([]);
  const [roadsideModelsLoading, setRoadsideModelsLoading] = useState(false);
  const [roadsideMakeOpen, setRoadsideMakeOpen] = useState(false);
  const [roadsideModelOpen, setRoadsideModelOpen] = useState(false);
  const [roadsideColorOpen, setRoadsideColorOpen] = useState(false);
  const [roadsidePortType, setRoadsidePortType] = useState("");
  const [roadsidePortTypeOpen, setRoadsidePortTypeOpen] = useState(false);
  const [roadsidePortTypeSuggestions, setRoadsidePortTypeSuggestions] = useState<string[]>([]);
  const [roadsidePortTypesLoading, setRoadsidePortTypesLoading] = useState(false);
  const [batteryCurrentCharge, setBatteryCurrentCharge] = useState("");
  const [batteryTargetCharge, setBatteryTargetCharge] = useState("");
  const [batteryCurrentOpen, setBatteryCurrentOpen] = useState(false);
  const [batteryTargetOpen, setBatteryTargetOpen] = useState(false);

  // Deliver-specific: multi-stop
  const [deliverMultiStop, setDeliverMultiStop] = useState(false);
  const [deliverExtraStops, setDeliverExtraStops] = useState<Array<{ address: string; placeName: string | null; coords: { lat: number; lng: number } | null }>>([]);

  // Deliver-specific: language + expenses
  const [deliverLanguage, setDeliverLanguage] = useState<string | null>(null);
  const [deliverShowLangPicker, setDeliverShowLangPicker] = useState(false);
   const [deliverHasExpenses, setDeliverHasExpenses] = useState<boolean | null>(null);
   const [deliverOrderValue, setDeliverOrderValue] = useState("");
    const [showHighValueDialog, setShowHighValueDialog] = useState(false);
    const [declineProtection, setDeclineProtection] = useState(false);
  const [deliverExpenseItems, setDeliverExpenseItems] = useState<Array<{ description: string; amount: string }>>([{ description: "", amount: "0" }]);
  const [deliverAllowOverage, setDeliverAllowOverage] = useState(false);
  const [deliverOverageLimit, setDeliverOverageLimit] = useState("0");
  const [deliverExpenseCapWarning, setDeliverExpenseCapWarning] = useState<number | null>(null);
  const [deliverOverageCapWarning, setDeliverOverageCapWarning] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [deliverExpenseRedraftSuggestion, setDeliverExpenseRedraftSuggestion] = useState<{ index: number; text: string } | null>(null);
  const [isDeliverExpenseRedrafting, setIsDeliverExpenseRedrafting] = useState<number | null>(null);

  // Home address gate
  const [showHomeAddressGate, setShowHomeAddressGate] = useState(false);
  const [showSettingsFromGate, setShowSettingsFromGate] = useState(false);

  // Sign in gate
  const [showSignInGate, setShowSignInGate] = useState(false);

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
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string | null>(null);
  const [completionDate, setCompletionDate] = useState<Date | null>(null);
  const [dropoffPhotoUrl, setDropoffPhotoUrl] = useState<string | null>(null);
  const [dropoffPhotoLoading, setDropoffPhotoLoading] = useState(false);
  const [pickupPhotoUrl, setPickupPhotoUrl] = useState<string | null>(null);
  const [pickupPhotoLoading, setPickupPhotoLoading] = useState(false);
  const [numberOfPackages, setNumberOfPackages] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isConciergeStyle = selectedService === "concierge" || selectedService === "valet";
  const activeCategories = selectedService === "valet" ? valetCategories : conciergeCategories;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const [showContactSupport, setShowContactSupport] = useState(false);
  const [acceptedCourial, setAcceptedCourial] = useState<CourialDriver | null>(null);
  const [socketEnabled, setSocketEnabled] = useState(false);
  const [courialCoords, setCourialCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [courialEta, setCourialEta] = useState<{ duration: string; distance: string } | null>(null);

  // Socket: connect after successful booking, listen for courial acceptance
  const handleCourialAccepted = useCallback((driver: CourialDriver) => {
    console.log("[Book] Courial accepted order:", driver);
    setAcceptedCourial(driver);
    // Set initial courial position from Provider.latitude/longitude
    if (driver.latitude && driver.longitude) {
      setCourialCoords({ lat: driver.latitude, lng: driver.longitude });
    }
    // Immediately transition to active tracking when a courial accepts
    setBookingState("active");
    setLoadingProgress(100);
    setDeliveryStep(0);
    toast.success(`${driver.name} accepted your order!`);
  }, []);

  // Handle real-time location updates from socket
  const handleLocationUpdate = useCallback((coords: { lat: number; lng: number }) => {
    console.log("[Book] Courial location update:", coords);
    setCourialCoords(coords);
  }, []);

  // Calculate ETA from Courial to pickup using Google Distance Matrix
  useEffect(() => {
    if (!courialCoords || !window.google?.maps) return;
    const pickupPt = isConciergeStyle ? conciergeStartCoords : pickupCoords;
    if (!pickupPt) return;

    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(courialCoords.lat, courialCoords.lng)],
        destinations: [new window.google.maps.LatLng(pickupPt.lat, pickupPt.lng)],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.IMPERIAL,
      },
      (response, status) => {
        if (status === "OK" && response?.rows?.[0]?.elements?.[0]?.status === "OK") {
          const element = response.rows[0].elements[0];
          const durationText = element.duration?.text || "";
          const distanceText = element.distance?.text || "";
          setCourialEta({ duration: durationText, distance: distanceText });
        }
      }
    );
  }, [courialCoords, conciergeStartCoords, pickupCoords, selectedService]);

  // Read token reactively when socket becomes enabled
  const [courialToken, setCourialToken] = useState<string | null>(null);
  useEffect(() => {
    if (socketEnabled) {
      const token = localStorage.getItem("courial_api_token");
      console.log("[Book] socketEnabled=true, courialToken:", token ? `${token.substring(0, 20)}...` : "NULL");
      setCourialToken(token);
    }
  }, [socketEnabled]);

  const handleStatusChange = useCallback((status: string) => {
    console.log("[Book] Delivery status changed:", status);
    const isWfh = selectedService === "concierge" && conciergeIsRemote;
    const statusStepMap: Record<string, number> = isWfh
      ? {
          "Courial at Pickup": 1, // maps to "Task In Progress"
          "Courial Picked Up": 1,
          "Courial at Drop-off": 2, // maps to "Task Completed"
          "Order Complete": 3,
        }
      : {
          "Courial at Pickup": 1,
          "Courial Picked Up": 2,
          "Courial at Drop-off": 3,
          "Order Complete": 5,
        };
    const stepIndex = statusStepMap[status];
    if (stepIndex !== undefined) {
      setDeliveryStep(stepIndex);
      toast.info(status);
      if (status === "Order Complete") {
        setCompletionDate(new Date());
      }
    }
  }, [selectedService, conciergeIsRemote]);

  const handleCompletionPhoto = useCallback((photoUrl: string) => {
    console.log("[Book] Completion photo received:", photoUrl);
    setCompletionPhotoUrl(photoUrl);
  }, []);


  const handleDropoffPhoto = useCallback((photoUrl: string) => {
    console.log("[Book] Dropoff photo received:", photoUrl);
    setDropoffPhotoLoading(true);
    setDropoffPhotoUrl(photoUrl);
  }, []);

  const handlePickupPhoto = useCallback((photoUrl: string) => {
    console.log("[Book] Pickup photo received:", photoUrl);
    setPickupPhotoUrl((prev) => {
      if (prev === photoUrl) return prev; // same URL, skip to avoid flicker
      setPickupPhotoLoading(true);
      return photoUrl;
    });
  }, []);

  const handleNumberOfPackages = useCallback((count: number) => {
    console.log("[Book] Number of packages received:", count);
    setNumberOfPackages(count);
  }, []);

  const { socketRef } = useCourialSocket({
    token: courialToken,
    enabled: socketEnabled,
    acceptedDriverId: acceptedCourial?.id || null,
    onAccepted: handleCourialAccepted,
    onLocationUpdate: handleLocationUpdate,
    onStatusChange: handleStatusChange,
    onCompletionPhoto: handleCompletionPhoto,
    onDropoffPhoto: handleDropoffPhoto,
    onPickupPhoto: handlePickupPhoto,
    onNumberOfPackages: handleNumberOfPackages,
  });
  const courialProfiles = useMemo(() => [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=300&h=400&fit=crop&crop=face&facepad=2",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=400&fit=crop&crop=face&facepad=2",
  ], []);

  // Use real courial photos when available (filter out non-face/placeholder images), otherwise stock
  const activeProfiles = useMemo(() => {
    if (nearbyCourials.length > 0) {
      const validImages = nearbyCourials
        .map(c => c.image)
        .filter(img => {
          if (!img) return false;
          const lower = img.toLowerCase();
          // Skip placeholder, default, or non-portrait images
          if (lower.includes("placeholder") || lower.includes("default") || lower.includes("avatar") || lower.includes("no-image") || lower.includes("noimage")) return false;
          return true;
        });
      if (validImages.length > 0) return validImages;
    }
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
  const conciergeReady = isConciergeStyle && (conciergeSubCategory !== null || conciergeCategory === "something-else") && conciergeDescription.trim().length > 0;
  const isBaseFormValid = isConciergeStyle
    ? conciergeReady
    : pickup.trim().length > 0 && dropoff.trim().length > 0 && (!needsVehicle || selectedVehicle !== null) && notes.trim().length > 0;
  const isFormValid = isConciergeStyle
    ? conciergeReady && conciergeOrderValue.trim().length > 0 && Number(conciergeOrderValue.replace(/,/g, '')) > 0
    : isBaseFormValid && deliverOrderValue.trim().length > 0 && Number(deliverOrderValue.replace(/,/g, '')) > 0 && !deliverMultiStop;

  // Sync booking state to localStorage for Navbar
  const formStarted = selectedService !== null && (
    isConciergeStyle
      ? (conciergeCategory !== null)
      : (pickup.trim().length > 0 || dropoff.trim().length > 0)
  );

  useEffect(() => {
    localStorage.setItem("courial_booking_state", bookingState);
    localStorage.setItem("courial_form_started", formStarted ? "true" : "false");
    window.dispatchEvent(new Event("courial-booking-update"));
    return () => {
      // Clean up on unmount only if we're leaving the page in input state
      if (bookingState === "input") {
        // Keep formStarted so navbar still shows orange if user navigates away mid-form
      }
    };
  }, [bookingState, formStarted]);

  const fetchVehicleModels = useCallback(async (make: string) => {
    if (!make || roadsideCustomModel) return;
    setRoadsideModelsLoading(true);
    setRoadsideModelSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("vehicle-models", {
        body: { make, evOnly: selectedService === "valet" },
      });
      if (error) throw error;
      if (data?.models && Array.isArray(data.models)) {
        setRoadsideModelSuggestions(data.models);
      }
    } catch (e) {
      console.error("Failed to fetch vehicle models:", e);
    } finally {
      setRoadsideModelsLoading(false);
    }
  }, [roadsideCustomModel, selectedService]);

  const fetchVehiclePortTypes = useCallback(async (make: string, model: string) => {
    if (!make || !model || selectedService !== "valet") return;
    setRoadsidePortTypesLoading(true);
    setRoadsidePortTypeSuggestions([]);
    setRoadsidePortType("");
    try {
      const { data, error } = await supabase.functions.invoke("vehicle-port-types", {
        body: { make, model },
      });
      if (error) throw error;
      if (data?.portTypes && Array.isArray(data.portTypes)) {
        setRoadsidePortTypeSuggestions(data.portTypes);
        if (data.portTypes.length === 1) {
          setRoadsidePortType(data.portTypes[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch port types:", e);
    } finally {
      setRoadsidePortTypesLoading(false);
    }
  }, [selectedService]);

  // Close roadside dropdowns on outside click
  useEffect(() => {
    const handler = () => { setRoadsideMakeOpen(false); setRoadsideModelOpen(false); setRoadsideColorOpen(false); setRoadsidePortTypeOpen(false); };
    if (roadsideMakeOpen || roadsideModelOpen || roadsideColorOpen || roadsidePortTypeOpen) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [roadsideMakeOpen, roadsideModelOpen, roadsideColorOpen, roadsidePortTypeOpen]);

  // Redraft with AI handler
  const handleRedraft = useCallback(async () => {
    if (conciergeDescription.trim().length < 10 || isRedrafting) return;
    setIsRedrafting(true);
    setRedraftSuggestion(null);
    try {
      const selectedCat = activeCategories.find(c => c.id === conciergeCategory);
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
      const selectedCat = activeCategories.find(c => c.id === conciergeCategory);
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

      const isConcierge = selectedService === "concierge" || selectedService === "valet";

      // For concierge: resolve best pickup/dropoff from available addresses, duplicating if only one exists
      let concPickup = { address: "N/A", lat: 0, lng: 0 };
      let concDropoff = { address: "N/A", lat: 0, lng: 0 };
      if (isConcierge) {
         if (conciergeIsRemote) {
           // Remote/WFH — refresh addresses from DB first, then cascade: Home → Work → Area Code
           const freshAddresses = await loadSavedAddressesFromDB();
           const homeAddr = freshAddresses.find(a => a.type === "home");
           const workAddr = freshAddresses.find(a => a.type === "work");
           
           if (homeAddr && homeAddr.lat && homeAddr.lng) {
             concPickup = { address: `Remote / WFH — ${homeAddr.name}`, lat: homeAddr.lat, lng: homeAddr.lng };
             concDropoff = { ...concPickup };
             setWfhSearchPhase("home");
           } else if (workAddr && workAddr.lat && workAddr.lng) {
             concPickup = { address: `Remote / WFH — ${workAddr.name}`, lat: workAddr.lat, lng: workAddr.lng };
             concDropoff = { ...concPickup };
             setWfhSearchPhase("work");
           } else {
             // Fallback to area code / user location
             concPickup = { address: "Remote / WFH", lat: 0, lng: 0 };
             concDropoff = { address: "Remote / WFH", lat: 0, lng: 0 };
             setWfhSearchPhase("area_code");
           }
        } else {
          // In-person concierge — collect addresses and start address-based search
          const available: { address: string; lat: number; lng: number }[] = [];
          if (conciergeStartAddress && conciergeStartCoords) available.push({ address: conciergeStartAddress, ...conciergeStartCoords });
          if (conciergeStopAddress && conciergeStopCoords) available.push({ address: conciergeStopAddress, ...conciergeStopCoords });
          if (conciergeFinalAddress && conciergeFinalCoords) available.push({ address: conciergeFinalAddress, ...conciergeFinalCoords });

          if (available.length >= 2) {
            concPickup = available[0];
            concDropoff = available[available.length - 1];
          } else if (available.length === 1) {
            concPickup = available[0];
            concDropoff = available[0];
          }
          // Start address search phase: 30s initial, then 60s retry
          if (available.length > 0) {
            setWfhSearchPhase("address_initial");
          }
        }
      }

      const payload: Record<string, any> = {
        scheduleType: timeMode === "now" ? "now" : "later",
        serviceType: selectedService || "deliver",
        vehicleType: selectedVehicle || undefined,
        notes: isConcierge ? conciergeDescription : notes,
        pickup: isConcierge ? concPickup : { address: pickup, lat: pickupCoords?.lat, lng: pickupCoords?.lng },
        dropoff: isConcierge ? concDropoff : { address: dropoff, lat: dropoffCoords?.lat, lng: dropoffCoords?.lng },
        userId: user.user_metadata?.courial_id || user.id,
      };
      if (isConcierge && conciergeIsRemote) {
        payload.isRemote = true;
      }

      if (isConcierge) {
        const cat = activeCategories.find(c => c.id === conciergeCategory);
        payload.conciergeCategory = cat?.label || conciergeCategory;
        payload.conciergeSubCategory = conciergeSubCategory === "__direct__" ? cat?.label : conciergeSubCategory;
        if (conciergeOrderValue) payload.orderValue = Number(conciergeOrderValue.replace(/,/g, ''));
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
        payload.orderType = deliverHasExpenses ? "COURIAL PAYS" : "PRE-PAID";
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
        orderIdRef.current = data.data.orderId ? String(data.data.orderId) : null;
        if (data.data.nearbyCourials?.length) {
          setNearbyCourials(data.data.nearbyCourials);
        }
        // Enable socket connection to listen for courial acceptance
        setSocketEnabled(true);
        console.log("[book-delivery] Delivery created:", data.data.deliveryId, "orderId:", data.data.orderId, "— socket enabled");
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
  }, [isFormValid, user, timeMode, selectedService, selectedVehicle, notes, pickup, pickupCoords, dropoff, dropoffCoords, selectedDate, selectedTime, over70lbs, heavyWeight, heavyItems, twoCourials, hasStairs, conciergeDescription, conciergeCategory, conciergeSubCategory, conciergeIsRemote, conciergeStartAddress, conciergeStartCoords, conciergeStopAddress, conciergeStopCoords, conciergeFinalAddress, conciergeFinalCoords, conciergeLanguage, conciergeServiceMode, conciergeHasExpenses, conciergeExpenseItems, conciergeAllowOverage, conciergeOverageLimit, conciergeOrderValue, deliverLanguage, deliverMultiStop, deliverExtraStops, deliverHasExpenses, deliverExpenseItems, deliverAllowOverage, deliverOverageLimit]);

  // Scroll sidebar to top when entering loading/active states or toggling chat
  useEffect(() => {
    if (bookingState === "loading" || bookingState === "active") {
      sidebarRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [bookingState, showChat]);

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

  // Reset UI only — used when delivery is complete ("Done" button)
  const handleDoneBooking = useCallback(() => {
    deliveryIdRef.current = null;
    orderIdRef.current = null;
    setBookingState("input");
    setLoadingProgress(0);
    setDeliveryStep(0);
    setSocketEnabled(false);
    setAcceptedCourial(null);
    setCourialEta(null);
    setWfhSearchPhase(null);
    setShowKeepSearching(false);
    if (wfhTimerRef.current) clearTimeout(wfhTimerRef.current);

    // Reset form to default start
    setSelectedService(null);
    setShowAllServices(true);
    setPickup("");
    setDropoff("");
    setPickupCoords(null);
    setDropoffCoords(null);
    setPickupPlaceName(null);
    setDropoffPlaceName(null);
    setTimeMode("now");
    setSelectedDate(undefined);
    setSelectedTime("12:00");
    setSelectedVehicle(null);
    setNotes("");
    setOver70lbs(null);
    setHeavyExpanded(false);
    setHeavyWeight("70");
    setHeavyItems("1");
    setTwoCourials(null);
    setHasStairs(null);
    setDeliverLanguage(null);
    setDeliverHasExpenses(null);
    setDeliverOrderValue("");
    setShowOrderDetails(false);
    setCompletionPhotoUrl(null);
    setCompletionDate(null);
    setDropoffPhotoUrl(null);
    setDropoffPhotoLoading(false);
    setPickupPhotoUrl(null);
    setPickupPhotoLoading(false);
    setNumberOfPackages(null);
    setShowChat(false);
  }, []);

  // Cancel with backend API — used when user actively cancels an in-progress order
  const handleCancelBooking = useCallback(async () => {
    const orderId = deliveryIdRef.current;
    if (orderId) {
      const courialToken = localStorage.getItem("courial_api_token");
      if (courialToken) {
        try {
          console.log("[cancel-delivery] Cancelling orderId:", orderId);
          const { data, error } = await supabase.functions.invoke("cancel-delivery", {
            body: { orderId },
            headers: { Authorization: `Bearer ${courialToken}` },
          });
          if (error) {
            console.error("[cancel-delivery] Edge function error:", error);
          } else {
            console.log("[cancel-delivery] Response:", data);
          }
        } catch (err) {
          console.error("[cancel-delivery] Exception:", err);
        }
      }
    }
    handleDoneBooking();
  }, [handleDoneBooking]);

  // Re-submit booking with new location coords for WFH cascading search
  const resubmitWithLocation = useCallback(async (loc: { address: string; lat: number; lng: number }) => {
    if (!user) return;
    const courialToken = localStorage.getItem("courial_api_token");
    if (!courialToken) return;

    setLoadingProgress(0);
    setSocketEnabled(false);

    const cat = conciergeCategories.find(c => c.id === conciergeCategory);
    const payload: Record<string, any> = {
      scheduleType: timeMode === "now" ? "now" : "later",
      serviceType: "concierge",
      notes: conciergeDescription,
      pickup: loc,
      dropoff: loc,
      userId: user?.user_metadata?.courial_id || user.id,
      isRemote: true,
      conciergeCategory: cat?.label || conciergeCategory,
      conciergeSubCategory: conciergeSubCategory === "__direct__" ? cat?.label : conciergeSubCategory,
    };
    if (conciergeOrderValue) payload.orderValue = Number(conciergeOrderValue.replace(/,/g, ''));
    if (conciergeLanguage) payload.preferredLanguage = conciergeLanguage;
    if (conciergeServiceMode) payload.serviceMode = conciergeServiceMode;
    if (conciergeHasExpenses && conciergeExpenseItems.length > 0) {
      payload.expenseItems = conciergeExpenseItems.filter(e => e.description.trim());
      payload.allowOverage = conciergeAllowOverage;
      if (conciergeAllowOverage && conciergeOverageLimit !== "0") {
        payload.overageLimit = Number(conciergeOverageLimit);
      }
    }
    if (timeMode === "later" && selectedDate) {
      payload.date = format(selectedDate, "yyyy-MM-dd");
      payload.time = selectedTime;
    }

    try {
      const { data, error } = await supabase.functions.invoke("book-delivery", {
        body: payload,
        headers: { Authorization: `Bearer ${courialToken}` },
      });
      if (!error && data?.success === 1 && data?.data?.deliveryId) {
        deliveryIdRef.current = data.data.deliveryId;
        orderIdRef.current = data.data.orderId ? String(data.data.orderId) : null;
        if (data.data.nearbyCourials?.length) setNearbyCourials(data.data.nearbyCourials);
        setSocketEnabled(true);
        console.log("[WFH cascade] Re-submitted with location:", loc.address, "deliveryId:", data.data.deliveryId, "orderId:", data.data.orderId);
      }
    } catch (err) {
      console.error("[WFH cascade] resubmit error:", err);
    }
  }, [user, conciergeCategory, conciergeSubCategory, conciergeDescription, conciergeOrderValue, conciergeLanguage, conciergeServiceMode, conciergeHasExpenses, conciergeExpenseItems, conciergeAllowOverage, conciergeOverageLimit, timeMode, selectedDate, selectedTime]);

  // Concierge cascading search timer
  useEffect(() => {
    if (bookingState !== "loading" || !wfhSearchPhase) return;
    if (acceptedCourial) return;

    // Determine timeout based on phase
    let phaseTimeout = 30000; // 30s default
    if (wfhSearchPhase === "address_retry") phaseTimeout = 60000; // 60s retry

    wfhTimerRef.current = setTimeout(() => {
      if (wfhSearchPhase === "address_initial") {
        // In-person concierge: retry same address for 60s
        setWfhSearchPhase("address_retry");
        setLoadingProgress(0);
        // Resubmit with same address
        const available: { address: string; lat: number; lng: number }[] = [];
        if (conciergeStartAddress && conciergeStartCoords) available.push({ address: conciergeStartAddress, ...conciergeStartCoords });
        if (conciergeStopAddress && conciergeStopCoords) available.push({ address: conciergeStopAddress, ...conciergeStopCoords });
        if (conciergeFinalAddress && conciergeFinalCoords) available.push({ address: conciergeFinalAddress, ...conciergeFinalCoords });
        if (available.length > 0) {
          resubmitWithLocation(available[0]);
        }
      } else if (wfhSearchPhase === "address_retry") {
        // Exhausted in-person search
        setWfhSearchPhase("exhausted");
        setShowKeepSearching(true);
      } else if (conciergeIsRemote) {
        // WFH cascading: home → work → area_code → exhausted
        const saved = getSavedAddresses();
        const homeAddr = saved.find(a => a.type === "home");
        const workAddr = saved.find(a => a.type === "work");

        if (wfhSearchPhase === "home") {
          if (workAddr && workAddr.lat && workAddr.lng) {
            setWfhSearchPhase("work");
            setLoadingProgress(0);
            resubmitWithLocation({ address: `Remote / WFH — ${workAddr.name}`, lat: workAddr.lat, lng: workAddr.lng });
          } else {
            setWfhSearchPhase("area_code");
            setLoadingProgress(0);
            const phone = user?.user_metadata?.phone || user?.phone || "";
            resubmitWithLocation({ address: `Remote / WFH — ${phone ? "Phone area" : "General area"}`, lat: 0, lng: 0 });
          }
        } else if (wfhSearchPhase === "work") {
          setWfhSearchPhase("area_code");
          setLoadingProgress(0);
          const phone = user?.user_metadata?.phone || user?.phone || "";
          resubmitWithLocation({ address: `Remote / WFH — ${phone ? "Phone area" : "General area"}`, lat: 0, lng: 0 });
        } else if (wfhSearchPhase === "area_code") {
          setWfhSearchPhase("exhausted");
          setShowKeepSearching(true);
        }
      }
    }, phaseTimeout);

    return () => {
      if (wfhTimerRef.current) clearTimeout(wfhTimerRef.current);
    };
  }, [bookingState, conciergeIsRemote, wfhSearchPhase, acceptedCourial, user, resubmitWithLocation, conciergeStartAddress, conciergeStartCoords, conciergeStopAddress, conciergeStopCoords, conciergeFinalAddress, conciergeFinalCoords]);

   // Concierge task timer — start on "Task In Progress", stop on "Task Completed"
  useEffect(() => {
    if (selectedService !== "concierge") return;
    const isWfh = conciergeIsRemote;
    // WFH: step 1 = Task In Progress, step 2 = completed
    // In-person: step 3 = Task In Progress, step 4 = completed
    const startStep = isWfh ? 1 : 3;
    const stopStep = isWfh ? 2 : 4;
    if (deliveryStep >= startStep && deliveryStep < stopStep) {
      setWfhTaskRunning(true);
    } else if (deliveryStep >= stopStep) {
      setWfhTaskRunning(false);
    }
  }, [selectedService, conciergeIsRemote, deliveryStep]);

  useEffect(() => {
    if (wfhTaskRunning && !wfhTaskPaused) {
      wfhTaskIntervalRef.current = setInterval(() => {
        setWfhTaskElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (wfhTaskIntervalRef.current) {
        clearInterval(wfhTaskIntervalRef.current);
        wfhTaskIntervalRef.current = null;
      }
    }
    return () => {
      if (wfhTaskIntervalRef.current) clearInterval(wfhTaskIntervalRef.current);
    };
  }, [wfhTaskRunning, wfhTaskPaused]);

  // Handle "keep searching" responses
  const handleKeepSearchingYes = useCallback(() => {
    setShowKeepSearching(false);
    setWfhSearchPhase("home");
    setLoadingProgress(0);
    // Re-start the cascade from home
    const saved = getSavedAddresses();
    const homeAddr = saved.find(a => a.type === "home");
    if (homeAddr && homeAddr.lat && homeAddr.lng) {
      resubmitWithLocation({ address: `Remote / WFH — ${homeAddr.name}`, lat: homeAddr.lat, lng: homeAddr.lng });
    } else {
      resubmitWithLocation({ address: "Remote / WFH", lat: 0, lng: 0 });
    }
  }, [resubmitWithLocation]);

  const handleKeepSearchingNo = useCallback(() => {
    setShowKeepSearching(false);
    handleCancelBooking();
    toast.info("Booking cancelled. You can try again anytime.");
  }, [handleCancelBooking]);

  const deliveryStepsMap: Record<string, { label: string; desc: string; isComplete?: boolean }[]> = {
    deliver: [
      { label: "Order Accepted", desc: "Your delivery request has been confirmed" },
      { label: "Courial at Pickup", desc: "Your courier has arrived at the pickup location" },
      { label: "Courial Picked Up", desc: "Package has been collected" },
      { label: "Courial at Drop-off", desc: "Your courier has arrived at the destination" },
      { label: "Courial Dropped Off", desc: "Package has been delivered" },
      { label: "Order Complete", desc: "Invoice sent — thank you!", isComplete: true },
    ],
    concierge: [
      { label: "Request Accepted", desc: "Concierge confirmed" },
      { label: "Concierge En Route", desc: "Your concierge is on the way" },
      { label: "Concierge Arrived", desc: "Your concierge has arrived" },
      { label: "Task In Progress", desc: "Task has begun" },
      { label: "Task Completed", desc: "Task completed" },
      { label: "Order Complete", desc: "Invoice sent — thank you!", isComplete: true },
    ],
    concierge_wfh: [
      { label: "Request Accepted", desc: "Concierge confirmed" },
      { label: "Task In Progress", desc: "Task has begun" },
      { label: "Task Completed", desc: "Task completed" },
      { label: "Order Complete", desc: "Invoice sent — thank you!", isComplete: true },
    ],
    valet: [
      { label: "Request Accepted", desc: "Your valet request has been confirmed" },
      { label: "Valet En Route", desc: "Your valet is on the way" },
      { label: "Valet Arrived", desc: "Your valet has arrived" },
      { label: "Task In Progress", desc: "Service has begun" },
      { label: "Task Completed", desc: "Service completed" },
      { label: "Order Complete", desc: "Invoice sent — thank you!", isComplete: true },
    ],
  };
  const isWfhConcierge = selectedService === "concierge" && conciergeIsRemote;
  const deliveryStepsKey = isWfhConcierge ? "concierge_wfh" : (selectedService || "deliver");
  const deliverySteps = deliveryStepsMap[deliveryStepsKey] || deliveryStepsMap.deliver;

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
    <>
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Book a Courier — Courial</title>
        <meta name="description" content="Send packages, receive deliveries, or schedule store pickups with Courial's premium courier service." />
      </Helmet>
      <Navbar />

      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Left Column — Booking Card */}
        <div ref={sidebarRef} className="w-full max-w-[440px] flex-shrink-0 border-r border-border overflow-y-auto bg-black/[0.025]">
          {showActivity ? (
            <ActivityPanel onBack={() => setSearchParams({})} />
          ) : bookingState === "input" && (
          <div className="p-8">
            {/* Service Bento Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >



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
                                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors overflow-hidden">
                                  <img src={item.serviceIcon} alt={item.label} className="w-10 h-10 object-contain" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                  {item.label}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-snug whitespace-pre-line">{item.desc}</p>
                              </div>
                            </div>
                          </>
                        );
                        const cardClass = `group relative rounded-2xl glass-card overflow-hidden h-[150px] p-6 flex flex-col justify-center transition-all duration-300 border border-foreground/10 ${isSelected ? "!border-primary" : "hover:border-primary/50"}`;

                        const handleClick = (e: React.MouseEvent) => {
                          if (!item.external) {
                            e.preventDefault();
                            // Must be signed in
                            if (!user) {
                              setShowSignInGate(true);
                              return;
                            }
                            // Check for home address before allowing booking
                            const addresses = getSavedAddresses();
                            const hasHome = addresses.some((a) => a.type === "home");
                            if (!hasHome) {
                              setShowHomeAddressGate(true);
                              return;
                            }
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
                  {selectedService === "concierge" && (
                    <img src={conciergeBox} alt="Concierge" className="w-10 h-10" />
                  )}
                  {selectedService === "valet" && (
                    <img src={valetBox} alt="Valet" className="w-10 h-10" />
                  )}
                  <h1 className="text-3xl font-bold text-foreground">
                    {serviceCards.find(s => s.id === selectedService)?.label || "Service"}
                  </h1>
                  <button
                    onClick={() => { setShowAllServices(true); setSelectedService(null); }}
                    className="ml-1 flex items-center justify-center"
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  </button>
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
                              {["<70","70","75","80","90","100","125","150","175","200","250","300","350","400","450","500"].map(w => (
                                <SelectItem key={w} value={w}>{w === "<70" ? "< 70 lbs" : `${w} lbs`}</SelectItem>
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
                      if (over70lbs === true && heavyWeight !== "<70" && (v.id === "walker" || v.id === "scooter")) return false;
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
                            isActive ? "grayscale-0 opacity-100 scale-110"
                              : selectedVehicle === null ? "grayscale-0 opacity-100 scale-100"
                              : "grayscale opacity-40 scale-100"
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

              {/* Vehicle type icons for Concierge */}
              {isConciergeStyle && (
                <div className="mb-6">
                  <div className="flex items-end justify-center gap-4">
                    {/* "None" icon - no vehicle needed */}
                    {(() => {
                      const isNoneActive = conciergeVehicle === "none";
                      return (
                        <button
                          onClick={() => setConciergeVehicle(isNoneActive ? null : "none")}
                          className="bg-transparent border-none outline-none cursor-pointer flex items-center"
                        >
                          <div className={cn(
                            "h-[36px] flex items-end justify-center transition-all duration-300",
                            isNoneActive ? "grayscale-0 opacity-100 scale-110"
                              : conciergeVehicle === null ? "grayscale-0 opacity-100 scale-100"
                              : "grayscale opacity-40 scale-100"
                          )}>
                            <img src={noVehicleIcon} alt="No vehicle needed" className="max-h-[30px] object-contain" />
                          </div>
                        </button>
                      );
                    })()}
                    {vehicleOptions.filter(v => selectedService !== "valet" || v.id === "van").map((v) => {
                      const isActive = conciergeVehicle === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setConciergeVehicle(isActive ? null : v.id)}
                          className="bg-transparent border-none outline-none cursor-pointer flex items-center"
                        >
                          <div className={cn(
                            "h-[36px] flex items-end justify-center transition-all duration-300",
                            isActive ? "grayscale-0 opacity-100 scale-110"
                              : conciergeVehicle === null ? "grayscale-0 opacity-100 scale-100"
                              : "grayscale opacity-40 scale-100"
                          )}>
                            <img src={v.image} alt={v.label} className={cn("object-contain", v.imgClass)} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence mode="wait">
                    {conciergeVehicle && conciergeVehicle !== "none" && (
                      <motion.p
                        key={conciergeVehicle}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-muted-foreground text-center mt-2"
                      >
                        {vehicleCaptions[conciergeVehicle as VehicleId]}
                      </motion.p>
                    )}
                    {conciergeVehicle === "none" && (
                      <motion.p
                        key="none"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-muted-foreground text-center mt-2"
                      >
                        No vehicle needed
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Category Drill-Down */}
              {isConciergeStyle && conciergeVehicle && (
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
                        className="flex flex-wrap gap-2 justify-center"
                      >
                        {activeCategories.map((cat) => (
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
                          const cat = activeCategories.find(c => c.id === conciergeCategory)!;
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
                          const cat = activeCategories.find(c => c.id === conciergeCategory)!;
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

            {/* Vehicle Details - Roadside Assistance & Valet */}
            {((selectedService === "concierge" && conciergeCategory === "roadside-assistance" && conciergeSubCategory && conciergeSubCategory !== "__direct__") || (selectedService === "valet" && conciergeSubCategory && conciergeSubCategory !== "__direct__")) && (
              <div className="mb-4 mt-4 space-y-3">
                <span className="text-xs font-medium text-muted-foreground">Vehicle Details</span>
                <div className="space-y-2">
                  <div className="flex gap-1.5 w-full min-w-0">
                    {/* Make dropdown or custom input */}
                    <div className="w-1/2 min-w-0 relative">
                      {roadsideCustomMake ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Enter make"
                            value={roadsideVehicleMake}
                            onChange={(e) => {
                              setRoadsideVehicleMake(e.target.value);
                              setRoadsideVehicleModel("");
                              setRoadsideModelSuggestions([]);
                            }}
                            className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors"
                          />
                          <button onClick={() => { setRoadsideCustomMake(false); setRoadsideVehicleMake(""); setRoadsideVehicleModel(""); }} className="text-[10px] text-muted-foreground hover:text-foreground px-1">✕</button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoadsideMakeOpen(!roadsideMakeOpen); setRoadsideModelOpen(false); setRoadsideColorOpen(false); }}
                            className="w-full px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs text-left flex items-center justify-between hover:border-foreground/30 transition-colors"
                          >
                            <span className={roadsideVehicleMake ? "text-foreground" : "text-muted-foreground"}>{roadsideVehicleMake || "Make"}</span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          </button>
                          {roadsideMakeOpen && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
                              {(selectedService === "valet" ? ["Acura","Audi","BMW","BYD","Cadillac","Chevrolet","Chrysler","Dodge","Ferrari","Fiat","Fisker","Ford","Genesis","GMC","Honda","Hyundai","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Lucid","Mazda","McLaren","Mercedes-Benz","Mini","Mitsubishi","Nissan","Polestar","Porsche","Ram","Rivian","Rolls-Royce","Scout","Subaru","Tesla","Toyota","VinFast","Volkswagen","Volvo"] : ["Acura","Audi","BMW","Buick","Cadillac","Chevrolet","Chrysler","Dodge","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Mazda","Mercedes-Benz","Mini","Mitsubishi","Nissan","Porsche","Ram","Rivian","Subaru","Tesla","Toyota","Volkswagen","Volvo"]).map((make) => (
                                <button
                                  key={make}
                                  onClick={() => {
                                    setRoadsideVehicleMake(make);
                                    setRoadsideMakeOpen(false);
                                    setRoadsideVehicleModel("");
                                    setRoadsideCustomModel(false);
                                    fetchVehicleModels(make);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted transition-colors"
                                >
                                  {make}
                                </button>
                              ))}
                              <button
                                onClick={() => { setRoadsideCustomMake(true); setRoadsideMakeOpen(false); setRoadsideVehicleMake(""); setRoadsideVehicleModel(""); }}
                                className="w-full px-2 py-1.5 text-xs text-left text-primary hover:bg-muted transition-colors border-t border-border/40"
                              >
                                Other (type manually)
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Model dropdown or custom input */}
                    <div className="w-1/2 min-w-0 relative">
                      {roadsideCustomModel ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Enter model"
                            value={roadsideVehicleModel}
                            onChange={(e) => setRoadsideVehicleModel(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors"
                          />
                          <button onClick={() => { setRoadsideCustomModel(false); setRoadsideVehicleModel(""); }} className="text-[10px] text-muted-foreground hover:text-foreground px-1">✕</button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (roadsideVehicleMake) { setRoadsideModelOpen(!roadsideModelOpen); setRoadsideMakeOpen(false); setRoadsideColorOpen(false); } }}
                            className={`w-full px-2 py-2 rounded-lg border border-border/60 bg-background text-xs text-left flex items-center justify-between transition-colors ${roadsideVehicleMake ? "text-foreground hover:border-foreground/30" : "text-muted-foreground opacity-60 cursor-not-allowed"}`}
                          >
                            <span className={roadsideVehicleModel ? "text-foreground" : "text-muted-foreground"}>
                              {roadsideModelsLoading ? "Loading..." : roadsideVehicleModel || "Model"}
                            </span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          </button>
                          {roadsideModelOpen && roadsideModelSuggestions.length > 0 && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
                              {roadsideModelSuggestions.map((model) => (
                                <button
                                  key={model}
                                  onClick={() => { setRoadsideVehicleModel(model); setRoadsideModelOpen(false); if (selectedService === "valet") fetchVehiclePortTypes(roadsideVehicleMake, model); }}
                                  className="w-full px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted transition-colors"
                                >
                                  {model}
                                </button>
                              ))}
                              <button
                                onClick={() => { setRoadsideCustomModel(true); setRoadsideModelOpen(false); setRoadsideVehicleModel(""); }}
                                className="w-full px-2 py-1.5 text-xs text-left text-primary hover:bg-muted transition-colors border-t border-border/40"
                              >
                                Other (type manually)
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 w-full min-w-0">
                    {/* Color dropdown or custom input */}
                    <div className={`${selectedService === "valet" ? "w-1/3" : "w-1/2"} min-w-0 relative`}>
                      {roadsideCustomColor ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Enter color"
                            value={roadsideVehicleColor}
                            onChange={(e) => setRoadsideVehicleColor(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors"
                          />
                          <button onClick={() => { setRoadsideCustomColor(false); setRoadsideVehicleColor(""); }} className="text-[10px] text-muted-foreground hover:text-foreground px-1">✕</button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoadsideColorOpen(!roadsideColorOpen); setRoadsideMakeOpen(false); setRoadsideModelOpen(false); setRoadsidePortTypeOpen(false); }}
                            className="w-full px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs text-left flex items-center justify-between hover:border-foreground/30 transition-colors"
                          >
                            <span className={roadsideVehicleColor ? "text-foreground" : "text-muted-foreground"}>{roadsideVehicleColor || "Color"}</span>
                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                          </button>
                          {roadsideColorOpen && (
                            <div onClick={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
                              {["White","Black","Gray","Silver","Blue","Red","Brown","Green","Beige","Orange"].map((color) => (
                                <button
                                  key={color}
                                  onClick={() => { setRoadsideVehicleColor(color); setRoadsideColorOpen(false); }}
                                  className="w-full px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted transition-colors"
                                >
                                  {color}
                                </button>
                              ))}
                              <button
                                onClick={() => { setRoadsideCustomColor(true); setRoadsideColorOpen(false); setRoadsideVehicleColor(""); }}
                                className="w-full px-2 py-1.5 text-xs text-left text-primary hover:bg-muted transition-colors border-t border-border/40"
                              >
                                Other (type manually)
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Port Type dropdown - Valet only */}
                    {selectedService === "valet" && (
                      <div className="w-1/3 min-w-0 relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); if (roadsidePortTypeSuggestions.length > 0) { setRoadsidePortTypeOpen(!roadsidePortTypeOpen); setRoadsideMakeOpen(false); setRoadsideModelOpen(false); setRoadsideColorOpen(false); } }}
                          className={`w-full px-2 py-2 rounded-lg border border-border/60 bg-background text-xs text-left flex items-center justify-between transition-colors ${roadsidePortTypeSuggestions.length > 0 ? "text-foreground hover:border-foreground/30" : "text-muted-foreground opacity-60 cursor-not-allowed"}`}
                        >
                          <span className={roadsidePortType ? "text-foreground" : "text-muted-foreground"}>
                            {roadsidePortTypesLoading ? "Loading..." : roadsidePortType || "Port Type"}
                          </span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {roadsidePortTypeOpen && roadsidePortTypeSuggestions.length > 0 && (
                          <div onClick={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
                            {roadsidePortTypeSuggestions.map((pt) => (
                              <button
                                key={pt}
                                onClick={() => { setRoadsidePortType(pt); setRoadsidePortTypeOpen(false); }}
                                className="w-full px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted transition-colors"
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="License Plate"
                      value={roadsideLicensePlate}
                      onChange={(e) => setRoadsideLicensePlate(e.target.value)}
                      className={`${selectedService === "valet" ? "w-1/3" : "w-1/2"} min-w-0 px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:border-border transition-colors`}
                    />
                  </div>
                  {/* Current Charge & Future Charge - Valet only, inside Vehicle Details */}
                  {selectedService === "valet" && (
                    <div className="flex gap-1.5 w-full min-w-0 mt-1.5">
                      {/* Current Charge */}
                      <div className="w-1/2 min-w-0 relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setBatteryCurrentOpen(!batteryCurrentOpen); setBatteryTargetOpen(false); }}
                          className="w-full px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs text-left flex items-center justify-between hover:border-foreground/30 transition-colors"
                        >
                          <span className={batteryCurrentCharge ? "text-foreground" : "text-muted-foreground"}>{batteryCurrentCharge ? `${batteryCurrentCharge}%` : "Current Charge"}</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {batteryCurrentOpen && (
                          <div onClick={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
                            {Array.from({ length: 11 }, (_, i) => i * 10).map((v) => (
                              <button
                                key={v}
                                onClick={() => { setBatteryCurrentCharge(String(v)); setBatteryCurrentOpen(false); }}
                                className="w-full px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted transition-colors"
                              >
                                {v}%
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Future Charge */}
                      <div className="w-1/2 min-w-0 relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setBatteryTargetOpen(!batteryTargetOpen); setBatteryCurrentOpen(false); }}
                          className="w-full px-2 py-2 rounded-lg border border-border/60 bg-background text-foreground text-xs text-left flex items-center justify-between hover:border-foreground/30 transition-colors"
                        >
                          <span className={batteryTargetCharge ? "text-foreground" : "text-muted-foreground"}>{batteryTargetCharge ? `${batteryTargetCharge}%` : "Future Charge"}</span>
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {batteryTargetOpen && (
                          <div onClick={(e) => e.stopPropagation()} className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-background shadow-lg">
                            {Array.from({ length: 10 }, (_, i) => (i + 1) * 10).map((v) => (
                              <button
                                key={v}
                                onClick={() => { setBatteryTargetCharge(String(v)); setBatteryTargetOpen(false); }}
                                className="w-full px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted transition-colors"
                              >
                                {v}%
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}





            {/* Task Details Form */}
            {isConciergeStyle && conciergeSubCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {/* Address Toggle Pills + WFH — all on same row */}
                {selectedService === "valet" && (
                  <span className="text-xs font-medium text-muted-foreground mb-1 block">Pick-up, Drop-off and Charging Station Info</span>
                )}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {selectedService === "concierge" && (
                  <button
                    onClick={() => {
                      setConciergeIsRemote(prev => {
                        const newVal = !prev;
                        // Always clear all address toggles and data
                        setConciergeAddressToggles({ start: false, stop: false, final: false });
                        setConciergeStartAddress(""); setConciergeStartPlaceName(null); setConciergeStartCoords(null);
                        setConciergeStopAddress(""); setConciergeStopPlaceName(null); setConciergeStopCoords(null);
                        setConciergeFinalAddress(""); setConciergeFinalPlaceName(null); setConciergeFinalCoords(null);
                        return newVal;
                      });
                    }}
                    className={cn(
                      "flex-1 py-1 rounded-full text-[11px] font-normal transition-all leading-none text-center flex items-center justify-center gap-1",
                      conciergeIsRemote
                        ? "border border-primary text-foreground"
                        : "border border-border/60 bg-background text-foreground hover:border-foreground/50"
                    )}
                  >
                    🏠 WFH
                  </button>
                  )}
                  {(["start", "stop", "final"] as const).map((type) => {
                    const labels: Record<string, string> = selectedService === "valet" ? { start: "Pick-up", stop: "Station", final: "Drop-off" } : { start: "Start", stop: "Stop", final: "Finish" };
                    const iconColors: Record<string, string> = { start: "text-green-500", stop: "text-blue-500", final: "text-destructive" };
                    return (
                      <button
                        key={type}
                         onClick={() => {
                          // Deselect WFH
                          setConciergeIsRemote(false);
                          setConciergeAddressToggles(prev => {
                            const newVal = !prev[type];
                            // Clear all address data first
                            setConciergeStartAddress(""); setConciergeStartPlaceName(null); setConciergeStartCoords(null);
                            setConciergeStopAddress(""); setConciergeStopPlaceName(null); setConciergeStopCoords(null);
                            setConciergeFinalAddress(""); setConciergeFinalPlaceName(null); setConciergeFinalCoords(null);
                            // Only allow one at a time
                            return { start: type === "start" && newVal, stop: type === "stop" && newVal, final: type === "final" && newVal };
                          });
                        }}
                        className={cn(
                          "flex-1 py-1 rounded-full text-[11px] font-normal transition-all leading-none text-center flex items-center justify-center gap-1",
                          conciergeAddressToggles[type]
                            ? "border border-primary text-foreground"
                            : "border border-border/60 bg-background text-foreground hover:border-foreground/50"
                        )}
                      >
                        <MapPin className={cn("h-3 w-3", iconColors[type])} />
                        {labels[type]}
                      </button>
                    );
                  })}
                </div>

                {!conciergeIsRemote && (
                <>
                {/* Address Inputs for enabled toggles — Draggable to swap */}
                <AnimatePresence>
                  {(conciergeAddressToggles.start || conciergeAddressToggles.stop || conciergeAddressToggles.final) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mb-3 overflow-visible"
                    >
                      {(() => {
                        type ConcFieldDef = { id: string; dotClass: string; placeName: string | null; coords: any; value: string; placeholder: string; onChange: (v: string) => void; onPlaceSelect: (p: any) => void; onClear: () => void };
                        const concFields: ConcFieldDef[] = [];
                        if (conciergeAddressToggles.start) concFields.push({ id: "start", dotClass: "rounded-full bg-green-500", placeName: conciergeStartPlaceName, coords: conciergeStartCoords, value: conciergeStartAddress, placeholder: "Start here", onChange: (v) => { setConciergeStartAddress(v); if (!v) { setConciergeStartPlaceName(null); setConciergeStartCoords(null); } }, onPlaceSelect: handleConciergeStartSelect, onClear: () => { setConciergeStartAddress(""); setConciergeStartPlaceName(null); setConciergeStartCoords(null); } });
                        if (conciergeAddressToggles.stop) concFields.push({ id: "stop", dotClass: "rounded-none bg-blue-500", placeName: conciergeStopPlaceName, coords: conciergeStopCoords, value: conciergeStopAddress, placeholder: "Stop here", onChange: (v) => { setConciergeStopAddress(v); if (!v) { setConciergeStopPlaceName(null); setConciergeStopCoords(null); } }, onPlaceSelect: handleConciergeStopSelect, onClear: () => { setConciergeStopAddress(""); setConciergeStopPlaceName(null); setConciergeStopCoords(null); } });
                        if (conciergeAddressToggles.final) concFields.push({ id: "final", dotClass: "rounded-none bg-destructive", placeName: conciergeFinalPlaceName, coords: conciergeFinalCoords, value: conciergeFinalAddress, placeholder: "Finish here", onChange: (v) => { setConciergeFinalAddress(v); if (!v) { setConciergeFinalPlaceName(null); setConciergeFinalCoords(null); } }, onPlaceSelect: handleConciergeFinalSelect, onClear: () => { setConciergeFinalAddress(""); setConciergeFinalPlaceName(null); setConciergeFinalCoords(null); } });

                        const concSwap = (a: number, b: number) => {
                          if (a < 0 || b < 0 || a >= concFields.length || b >= concFields.length) return;
                          const fieldA = concFields[a], fieldB = concFields[b];
                          const stateMap: Record<string, { get: () => { addr: string; name: string | null; coords: any }; set: (s: { addr: string; name: string | null; coords: any }) => void }> = {
                            start: { get: () => ({ addr: conciergeStartAddress, name: conciergeStartPlaceName, coords: conciergeStartCoords }), set: (s) => { setConciergeStartAddress(s.addr); setConciergeStartPlaceName(s.name); setConciergeStartCoords(s.coords); } },
                            stop: { get: () => ({ addr: conciergeStopAddress, name: conciergeStopPlaceName, coords: conciergeStopCoords }), set: (s) => { setConciergeStopAddress(s.addr); setConciergeStopPlaceName(s.name); setConciergeStopCoords(s.coords); } },
                            final: { get: () => ({ addr: conciergeFinalAddress, name: conciergeFinalPlaceName, coords: conciergeFinalCoords }), set: (s) => { setConciergeFinalAddress(s.addr); setConciergeFinalPlaceName(s.name); setConciergeFinalCoords(s.coords); } },
                          };
                          const stA = stateMap[fieldA.id].get(), stB = stateMap[fieldB.id].get();
                          stateMap[fieldA.id].set(stB); stateMap[fieldB.id].set(stA);
                        };

                        return concFields.map((field, idx) => (
                          <div key={field.id} className={`relative group ${idx === 0 ? '' : 'mt-1.5'}`}>
                            <div className="flex items-center gap-2">
                              {concFields.length > 1 && (
                                <button
                                  type="button"
                                  className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none select-none p-1"
                                  onPointerDown={(e) => {
                                    const startY = e.clientY;
                                    const el = e.currentTarget.closest('.relative.group') as HTMLElement;
                                    if (!el) return;
                                    el.style.zIndex = '10'; el.style.transition = 'none';
                                    let dragged = false;
                                    const onMove = (ev: PointerEvent) => { const dy = ev.clientY - startY; if (Math.abs(dy) > 8) dragged = true; el.style.transform = `translateY(${dy}px)`; el.style.opacity = '0.85'; };
                                    const onUp = (ev: PointerEvent) => {
                                      document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp);
                                      el.style.transition = 'transform 0.2s, opacity 0.2s'; el.style.transform = ''; el.style.opacity = '';
                                      setTimeout(() => { el.style.zIndex = ''; el.style.transition = ''; }, 200);
                                      const dy = ev.clientY - startY;
                                      if (dragged && dy > 30) concSwap(idx, idx + 1);
                                      else if (dragged && dy < -30) concSwap(idx, idx - 1);
                                    };
                                    document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
                                  }}
                                >
                                  <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                                    <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" />
                                    <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
                                    <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
                                  </svg>
                                </button>
                              )}
                              <div className="flex-1 flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-border">
                                <div className={`flex-shrink-0 w-2.5 h-2.5 ${field.dotClass}`} />
                                <div className="flex-1 min-w-0">
                                  {field.placeName && field.coords && (
                                    <div className="text-sm font-semibold text-foreground leading-tight truncate">{field.placeName}</div>
                                  )}
                                  <AddressAutocomplete
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onPlaceSelect={field.onPlaceSelect}
                                    className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${field.placeName && field.coords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                                  />
                                </div>
                                <button onClick={field.onClear} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                                  <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
                </>
                )}
                {/* Remote indicator text */}
                {conciergeIsRemote && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-muted/50 mb-3">
                    <span className="text-sm">🏠</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Remote Task</p>
                      <p className="text-xs text-muted-foreground">The Courial will complete this task from their own location — no travel required.</p>
                    </div>
                  </div>
                )}

                {/* Task Description Textarea with Redraft */}
                <div className="relative mb-1">
                  <div className="px-4 py-4 border border-border rounded-xl bg-background focus-within:border-border">
                    <textarea
                      placeholder={selectedService === "valet" ? "Please let us know exactly where your car is located, including your parking space, any required gate codes, and your preferred method for key exchange (meeting the valet, leaving a keycard at reception, or remote unlock). There's no need to manage charging apps or accounts—our valet will cover the session, and the electricity cost will be added to your final invoice along with the valet fee." : conciergeCategory === "roadside-assistance" ? "Describe the situation and assistance needed, including, urgency level, access instructions, any safety notes, and any relevant contacts or gate codes. If you're out of gas, specify fuel type; if you have a flat tire, confirm whether a spare is available. You may also include external links if third-party coordination is required." : "Outline the scope of work, preferences, timing requirements, special instructions, relevant contact names and phone numbers, and any external links the Courial will need access to. You may choose to have AI refine your message for clarity and completeness before confirming your booking."}
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
                  {(conciergeCategory === "roadside-assistance" ? [
                    { value: "hourly" as const, label: conciergeSubCategory === "Towing" ? "Hourly (+ truck fees)" : conciergeSubCategory === "Flat Tire" ? "Hourly (+ new tire if required)" : conciergeSubCategory === "Dead Battery / Jump Start" ? "Hourly (+ new battery if required)" : conciergeSubCategory === "Out of Gas" ? "Hourly (+ price of gas)" : "Hourly" },
                  ] : selectedService === "valet" ? [
                    { value: "hourly" as const, label: "Hourly + charging" },
                    { value: "daily" as const, label: "Per Minute + charging" },
                  ] : [
                    { value: "hourly" as const, label: "Hourly" },
                    { value: "daily" as const, label: "Daily (8 Hrs)" },
                  ]).map((mode) => (
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

                {/* Preferred Language - Concierge/Valet */}
                {isConciergeStyle && conciergeSubCategory && (
                  <div className="mb-4 mt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-foreground">Preferred Language</h4>
                      <input
                        type="checkbox"
                        checked={conciergeShowLangPicker || !!conciergeLanguage}
                        onChange={(e) => {
                          if (!e.target.checked) { setConciergeLanguage(null); setConciergeShowLangPicker(false); }
                          else { setConciergeShowLangPicker(true); }
                        }}
                        className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
                      />
                      {conciergeLanguage && (
                        <button
                          onClick={() => { setConciergeLanguage(null); setConciergeShowLangPicker(true); }}
                          className="px-2.5 py-1 rounded-full text-[11px] font-normal leading-none border border-primary text-foreground hover:opacity-70 transition-opacity"
                        >
                          {conciergeLanguage}
                        </button>
                      )}
                    </div>
                    {conciergeShowLangPicker && !conciergeLanguage && (
                      <>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["English", "Spanish", "French", "Portuguese", "Arabic", "Chinese", "Hindi", "Japanese", "Korean", "Thai"].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => { setConciergeLanguage(lang); setConciergeShowLangPicker(false); }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-normal transition-all leading-none border border-border/60 bg-background text-foreground/75 hover:border-foreground/50"
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug italic">We will make our best efforts to match you with your preferred language; however, this is subject to availability.</p>
                      </>
                    )}
                  </div>
                )}

                {/* Additional Expenses */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-medium text-foreground">Additional Expenses</h4>
                    <input
                      type="checkbox"
                      id="concierge-expenses"
                      checked={conciergeHasExpenses === true}
                      onChange={(e) => setConciergeHasExpenses(e.target.checked)}
                      className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
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
                            className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
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

                {/* Order Value — only show when concierge form is ready */}
                {conciergeReady && (
                <div className="mb-3 mt-4">
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-xs font-medium text-foreground leading-none">Order Value</h4>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={conciergeOrderValue ? Number(conciergeOrderValue.replace(/,/g, '')).toLocaleString('en-US') : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, '');
                          if (raw === '' || /^\d+$/.test(raw)) {
                            setConciergeOrderValue(raw);
                          }
                        }}
                        placeholder="0"
                        onFocus={(e) => e.target.select()}
                        className="w-20 rounded-lg border border-border/60 bg-background pl-5 pr-2 py-0.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Estimated value of the task or items involved. Complimentary coverage is included for values up to $100.
                  </p>

                  <AnimatePresence>
                    {Number(conciergeOrderValue) > 100 && Number(conciergeOrderValue) <= 200 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1.5">
                          <p className="text-[11px] font-medium text-foreground">For tasks exceeding $100 in declared value:</p>
                          <ul className="text-[10px] text-muted-foreground leading-relaxed space-y-0.5">
                            <li>• $101–$200: Protection fee added at 5% of value.</li>
                            <li>• Supporting documentation verifying value will be required.</li>
                            <li>• For eligible high-value tasks over $200, the Concierge must physically verify items prior to starting the task.</li>
                          </ul>
                          <p className="text-[10px] text-muted-foreground mt-1">All protection is subject to Courial's Service Protection & Coverage Policy.</p>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={declineProtection}
                              onChange={(e) => setDeclineProtection(e.target.checked)}
                              className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
                            />
                            <span className="text-[10px] text-muted-foreground">I decline additional protection coverage and wish to proceed without it.</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                    {Number(conciergeOrderValue) > 200 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
                          <p className="text-[11px] font-medium text-foreground">
                            For tasks valued at $200 or more, please contact{" "}
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
                            className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
                            />
                            <span className="text-[10px] text-muted-foreground">I decline additional protection coverage and wish to proceed without it.</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                )}

                {/* Concierge Service Requirements */}
                <Collapsible className="mt-5 text-xs text-foreground">
                  <CollapsibleTrigger className="flex items-center gap-1 font-semibold cursor-pointer hover:opacity-70 transition-opacity">
                    {selectedService === "valet" ? "Valet" : "Concierge"} Service Requirements
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
                      disabled={!isFormValid || (Number(conciergeOrderValue) > 200 && !declineProtection)}
                      onClick={handleBookingSubmit}
                      className="rounded h-10 text-lg font-semibold px-6"
                      variant={isFormValid && !(Number(conciergeOrderValue) > 200 && !declineProtection) ? "hero" : "secondary"}
                    >
                      Book {selectedService === "valet" ? "Valet" : "Concierge"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deliver / Valet Form */}
            <AnimatePresence>
              {!showAllServices && !isConciergeStyle && selectedVehicle && (
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
                        className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
                      />
                    </div>
                    {deliverMultiStop ? (
                      <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed bg-muted/60 rounded-lg p-3">
                        Our 'Multiple Stops' option is temporarily disabled while we complete updates to our mobile apps over the next few weeks. If you'd still like to proceed, please contact our{" "}
                        <button
                          type="button"
                          onClick={() => setShowContactSupport(true)}
                          className="text-primary hover:opacity-80 transition-opacity"
                        >
                          OPS Support
                        </button>{" "}
                        team and they'll be happy to set up the booking for you.
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        Check box if the Courial is required to make multiple stops.
                      </p>
                    )}
                  </div>

                  {/* Input Fields — hidden when multi-stop temporarily disabled */}
                  {!deliverMultiStop && (
                  <div>
                    {(() => {
                      type FieldDef = { id: string; dotClass: string; placeName: string | null; coords: any; value: string; placeholder: string; onChange: (v: string) => void; onPlaceSelect: (p: any) => void; onClear: () => void; onDoubleClickDot?: () => void };
                      const allFields: FieldDef[] = [
                        { id: "pickup", dotClass: "rounded-full bg-green-500", placeName: pickupPlaceName, coords: pickupCoords, value: pickup, placeholder: "Pickup location", onChange: (v: string) => { setPickup(v); if (!v) { setPickupPlaceName(null); setPickupCoords(null); } }, onPlaceSelect: handlePickupSelect, onClear: () => { setPickup(""); setPickupPlaceName(null); setPickupCoords(null); } },
                        { id: "dropoff", dotClass: "bg-red-500", placeName: dropoffPlaceName, coords: dropoffCoords, value: dropoff, placeholder: "Dropoff location", onChange: (v: string) => { setDropoff(v); if (!v) { setDropoffPlaceName(null); setDropoffCoords(null); } }, onPlaceSelect: handleDropoffSelect, onClear: () => { setDropoff(""); setDropoffPlaceName(null); setDropoffCoords(null); } },
                      ];
                      const swapByIndex = (a: number, b: number) => {
                        if (a < 0 || b < 0 || a >= allFields.length || b >= allFields.length) return;
                        const getState = (idx: number) => {
                          if (idx === 0) return { addr: pickup, name: pickupPlaceName, coords: pickupCoords };
                          if (idx === 1) return { addr: dropoff, name: dropoffPlaceName, coords: dropoffCoords };
                          const si = idx - 2; const s = deliverExtraStops[si];
                          return { addr: s?.address || "", name: s?.placeName || null, coords: s?.coords || null };
                        };
                        const stA = getState(a), stB = getState(b);
                        const setState = (idx: number, s: { addr: string; name: string | null; coords: any }) => {
                          if (idx === 0) { setPickup(s.addr); setPickupPlaceName(s.name); setPickupCoords(s.coords); }
                          else if (idx === 1) { setDropoff(s.addr); setDropoffPlaceName(s.name); setDropoffCoords(s.coords); }
                          else { const si = idx - 2; setDeliverExtraStops(prev => { const u = [...prev]; u[si] = { address: s.addr, placeName: s.name, coords: s.coords }; return u; }); }
                        };
                        setState(a, stB); setState(b, stA);
                      };
                      return allFields.map((field, idx) => (
                        <div key={field.id} className={`relative group ${idx === 0 ? '' : 'mt-1.5'}`}>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none select-none p-1"
                              onPointerDown={(e) => {
                                const startY = e.clientY;
                                const el = e.currentTarget.closest('.relative.group') as HTMLElement;
                                if (!el) return;
                                el.style.zIndex = '10'; el.style.transition = 'none';
                                let dragged = false;
                                const onMove = (ev: PointerEvent) => { const dy = ev.clientY - startY; if (Math.abs(dy) > 8) dragged = true; el.style.transform = `translateY(${dy}px)`; el.style.opacity = '0.85'; };
                                const onUp = (ev: PointerEvent) => {
                                  document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp);
                                  el.style.transition = 'transform 0.2s, opacity 0.2s'; el.style.transform = ''; el.style.opacity = '';
                                  setTimeout(() => { el.style.zIndex = ''; el.style.transition = ''; }, 200);
                                  const dy = ev.clientY - startY;
                                  if (dragged && dy > 30) swapByIndex(idx, idx + 1);
                                  else if (dragged && dy < -30) swapByIndex(idx, idx - 1);
                                };
                                document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
                              }}
                            >
                              <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                                <circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" />
                                <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
                                <circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" />
                              </svg>
                            </button>
                            <div className="flex-1 flex items-center gap-3 px-4 py-3 border border-border rounded-xl bg-background transition-colors focus-within:border-border">
                              <div
                                className={`flex-shrink-0 w-2.5 h-2.5 ${field.dotClass}${field.onDoubleClickDot ? ' cursor-pointer' : ''}`}
                                onDoubleClick={field.onDoubleClickDot}
                                title={field.onDoubleClickDot ? "Double-tap to remove" : undefined}
                              />
                              <div className="flex-1 min-w-0">
                                {field.placeName && field.coords && (
                                  <div className="text-sm font-semibold text-foreground leading-tight">{field.placeName}</div>
                                )}
                                <AddressAutocomplete
                                  placeholder={field.placeholder}
                                  value={field.value}
                                  onChange={field.onChange}
                                  onPlaceSelect={field.onPlaceSelect}
                                  className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ${field.placeName && field.coords ? 'text-muted-foreground text-xs mt-0.5' : 'text-sm'}`}
                                />
                              </div>
                              <button onClick={field.onClear} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity">
                                <X className="w-2.5 h-2.5 text-muted-foreground/50" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  )}

                  {!deliverMultiStop && (<>
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

                  {/* Preferred Language for Deliver */}
                  {selectedService === "deliver" && (
                    <div className="mb-4 mt-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-medium text-foreground">Preferred Language</h4>
                        <input
                          type="checkbox"
                          checked={deliverShowLangPicker || !!deliverLanguage}
                          onChange={(e) => {
                            if (!e.target.checked) { setDeliverLanguage(null); setDeliverShowLangPicker(false); }
                            else { setDeliverShowLangPicker(true); }
                          }}
                          className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
                        />
                        {deliverLanguage && (
                          <button
                            onClick={() => { setDeliverLanguage(null); setDeliverShowLangPicker(true); }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-normal leading-none border border-primary text-foreground hover:opacity-70 transition-opacity"
                          >
                            {deliverLanguage}
                          </button>
                        )}
                      </div>
                      {deliverShowLangPicker && !deliverLanguage && (
                        <>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {["English", "Spanish", "French", "Portuguese", "Arabic", "Chinese", "Hindi", "Japanese", "Korean", "Thai"].map((lang) => (
                              <button
                                key={lang}
                                onClick={() => { setDeliverLanguage(lang); setDeliverShowLangPicker(false); }}
                                className="px-2.5 py-1 rounded-full text-[11px] font-normal transition-all leading-none border border-border/60 bg-background text-foreground/75 hover:border-foreground/50"
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug italic">We will make our best efforts to match you with your preferred language; however, this is subject to availability.</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Additional Expenses for Deliver/Valet */}
                  <div className="mb-3 mt-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-foreground">Additional Expenses</h4>
                      <input
                        type="checkbox"
                        checked={deliverHasExpenses === true}
                        onChange={(e) => setDeliverHasExpenses(e.target.checked)}
                        className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
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
                              className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
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
                                className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
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
                                className="h-3 w-3 rounded border-foreground/25 accent-foreground cursor-pointer"
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
                      Delivery Requirements
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
                </>)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

        {/* Loading state — frosted-glass modal style */}
        {bookingState === "loading" && (
          <div className="p-8 h-full flex flex-col">
            {/* Heading — matches LIVE page */}
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-foreground">
                 {selectedService === "concierge" ? "Concierge Task" : selectedService === "valet" ? "Valet Service" : "Delivery"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isConciergeStyle && conciergeCategory
                  ? `${conciergeCategory.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}${conciergeSubCategory ? ` • ${conciergeSubCategory}` : ""}`
                  : deliverMultiStop && deliverExtraStops.length > 0 ? "Multiple Stops" : "Single Pick-up and Drop-off"}
              </p>
            </div>

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[19.2rem] mx-auto"
            >
              <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col items-center">
                {/* Cycling circle avatar */}
                <div className="relative mb-5">
                  {/* Pulsing ring behind avatar */}
                  <motion.div
                    className="absolute inset-[-8px] rounded-full border-2 border-primary/40"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-[-16px] rounded-full border border-primary/20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentProfileIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.4 }}
                      className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary"
                    >
                      <img
                        src={activeProfiles[currentProfileIndex % activeProfiles.length]}
                        alt="Courial"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <p className="text-sm font-medium text-background text-center max-w-[260px]">
                  Finding the best Courial for this task.
                </p>

                {/* Progress bar */}
                <div className="mt-4 w-full max-w-[200px] h-1 rounded-full bg-background/20 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Cancel button — below modal */}
              <Button
                variant="ghost"
                onClick={handleCancelBooking}
                className="w-full rounded-lg h-10 text-sm font-semibold mt-4 bg-transparent border border-muted-foreground/40 text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
            </motion.div>
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
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-foreground">
                 {selectedService === "concierge" ? "Concierge Task" : selectedService === "valet" ? "Valet Service" : "Delivery"}
                </h2>
                {!isConciergeStyle && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {deliverMultiStop && deliverExtraStops.length > 0 ? "Multiple Stops" : "Single Pick-up and Drop-off"}
                  </p>
                )}
                <p className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center justify-center gap-1.5">
                  {/* Green pulsing dot for ETA */}
                  {(selectedService !== "concierge" && !isWfhConcierge && courialEta) && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                  )}
                  {isConciergeStyle && conciergeCategory
                    ? `${conciergeCategory.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}${conciergeSubCategory ? ` • ${conciergeSubCategory}` : ""}${isWfhConcierge ? " • WFH Service" : ""}`
                    : !isWfhConcierge
                      ? courialEta ? `${courialEta.duration} away • ${new Date(Date.now() + parseInt(courialEta.duration) * 60000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} dropoff` : "Calculating ETA..."
                      : "WFH Service"
                  }
                </p>
                {selectedService === "concierge" && !isWfhConcierge && (
                  <p className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center justify-center gap-1.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    {courialEta ? `${courialEta.duration} away • ${courialEta.distance}` : "Calculating..."}
                  </p>
                )}
              </div>

              {/* Driver Card */}
              <div className="rounded-xl border border-border bg-background p-4 mb-3">
                <div className="flex items-center gap-4">
                  {acceptedCourial?.image ? (
                    <img src={acceptedCourial.image} alt={acceptedCourial.name} className="w-[60px] h-[60px] rounded-full object-cover border border-border" />
                  ) : (
                    <div className="rounded-full bg-muted flex items-center justify-center text-xl font-bold text-foreground" style={{ width: 60, height: 60 }}>
                      {(acceptedCourial?.name || "M").charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{(acceptedCourial?.name || "Marcus").split(" ")[0]}</h3>
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">{acceptedCourial?.rating?.toFixed(2) || "4.68"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {acceptedCourial?.memberSince
                        ? `Courial Since ${acceptedCourial.memberSince}`
                        : "Courial Since '25"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {acceptedCourial
                        ? `${acceptedCourial.vehicleColor ? acceptedCourial.vehicleColor + " " : ""}${acceptedCourial.vehicleYear ? acceptedCourial.vehicleYear + " " : ""}${acceptedCourial.vehicleMake} ${acceptedCourial.vehicleModel}`.trim() || "Vehicle info pending"
                        : "Black Toyota Corolla"}
                    </div>
                    <div className="text-xs text-foreground mt-0.5"><span className="font-normal text-muted-foreground">Plate No.</span> <span className="font-bold">{acceptedCourial?.licensePlate || "ABC1234"}</span></div>
                  </div>
                  {isConciergeStyle ? (
                    conciergeVehicle === "none" || !conciergeVehicle ? (
                      <img src={noVehicleIcon} alt="No vehicle needed" className="h-[60px] w-[60px] shrink-0 object-contain" />
                    ) : (
                      <img
                        src={vehicleOptions.find(v => v.id === conciergeVehicle)?.image}
                        alt={conciergeVehicle}
                        className="h-10 object-contain"
                      />
                    )
                  ) : selectedVehicle ? (
                    <img
                      src={vehicleOptions.find(v => v.id === selectedVehicle)?.image}
                      alt={selectedVehicle}
                      className="h-10 object-contain"
                    />
                  ) : null}
                </div>
              </div>

              {/* Status & Progress */}
              <div className="rounded-xl border border-border bg-background p-4 mb-3">

                {/* Delivery Status Stepper */}
                <div className="mb-4">
                  <div className="space-y-0 relative">
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
                              {step.isComplete && deliveryIdRef.current
                                ? `Order ${deliveryIdRef.current} Complete`
                                : step.label}
                              {isCompleted && <span className="ml-1.5 text-primary">✓</span>}
                            </p>
                            {isCurrent && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-0.5"
                              >
                                {step.isComplete && completionDate ? (
                                  <p className="text-xs text-muted-foreground">
                                    {format(completionDate, "d MMMM yyyy")} at {format(completionDate, "h:mm a")}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground">
                                    {step.label === "Task Completed" && wfhTaskElapsed > 0
                                      ? `${Math.floor(wfhTaskElapsed / 3600) > 0 && Math.floor((wfhTaskElapsed % 3600) / 60) > 0 ? `${Math.floor(wfhTaskElapsed / 3600)} hrs • ${Math.floor((wfhTaskElapsed % 3600) / 60)} mins` : Math.floor(wfhTaskElapsed / 3600) > 0 ? `${Math.floor(wfhTaskElapsed / 3600)} hrs` : `${Math.floor((wfhTaskElapsed % 3600) / 60)} mins`} task`
                                      : step.desc}
                                  </p>
                                )}
                              </motion.div>
                            )}


                            {/* Pickup photo + item count after "Courial Picked Up" step (deliver/concierge only) */}
                            {step.label === "Courial Picked Up" && (isCompleted || isCurrent) && (selectedService === "deliver" || selectedService === "concierge") && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2 space-y-2"
                              >
                                {pickupPhotoLoading && !pickupPhotoUrl && (
                                  <div className="w-full max-w-[200px] h-[120px] rounded-lg bg-muted animate-pulse" />
                                )}
                                {pickupPhotoUrl && (
                                  <div className="relative w-full max-w-[200px] rounded-lg overflow-hidden border border-border shadow-sm">
                                    {pickupPhotoLoading && (
                                      <div className="absolute inset-0 bg-muted animate-pulse z-10" />
                                    )}
                                    <img
                                      src={pickupPhotoUrl}
                                      alt="Pickup proof"
                                      className="w-full h-auto object-cover rounded-lg"
                                      onLoad={() => setPickupPhotoLoading(false)}
                                      onError={() => { setPickupPhotoLoading(false); setPickupPhotoUrl(null); }}
                                    />
                                    <button
                                      onClick={() => window.open(pickupPhotoUrl, "_blank")}
                                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 backdrop-blur-sm"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-foreground" />
                                    </button>
                                  </div>
                                )}
                                {numberOfPackages != null && (
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Items picked up: {numberOfPackages}
                                  </p>
                                )}
                              </motion.div>
                            )}

                            {/* Drop-off proof photo after "Courial Dropped Off" step */}
                            {step.label === "Courial Dropped Off" && (isCompleted || isCurrent) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2"
                              >
                                {dropoffPhotoLoading && !dropoffPhotoUrl && (
                                  <div className="w-full max-w-[200px] h-[120px] rounded-lg bg-muted animate-pulse" />
                                )}
                                {dropoffPhotoUrl && (
                                  <div className="relative w-full max-w-[200px] rounded-lg overflow-hidden border border-border shadow-sm">
                                    {dropoffPhotoLoading && (
                                      <div className="absolute inset-0 bg-muted animate-pulse z-10" />
                                    )}
                                    <img
                                      src={dropoffPhotoUrl}
                                      alt="Drop-off proof"
                                      className="w-full h-auto object-cover rounded-lg"
                                      onLoad={() => setDropoffPhotoLoading(false)}
                                      onError={() => { setDropoffPhotoLoading(false); setDropoffPhotoUrl(null); }}
                                    />
                                    <button
                                      onClick={() => window.open(dropoffPhotoUrl, "_blank")}
                                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 backdrop-blur-sm"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-foreground" />
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* WFH Clock - circular arc timer */}
                    {selectedService === "concierge" && (() => {
                      const isActive = wfhTaskRunning && !wfhTaskPaused;
                      const size = 110;
                      const stroke = 6;
                      const radius = (size - stroke) / 2;
                      const circumference = 2 * Math.PI * radius;
                      // Animate arc: full circle over 60s per minute cycle
                      const progress = (wfhTaskElapsed % 60) / 60;
                      const dashOffset = circumference * (1 - progress);
                      return (
                        <div className="absolute top-1/2 flex flex-col items-center gap-1.5" style={{ left: '75%', transform: 'translate(-50%, -50%)' }}>
                          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                            {/* Background ring */}
                            <svg width={size} height={size} className="absolute inset-0 -rotate-90">
                              <circle
                                cx={size / 2} cy={size / 2} r={radius}
                                fill="none"
                                strokeWidth={stroke}
                                className={isActive ? "stroke-primary/20" : "stroke-muted-foreground/10"}
                                strokeLinecap="round"
                              />
                              {/* Active arc */}
                              <circle
                                cx={size / 2} cy={size / 2} r={radius}
                                fill="none"
                                strokeWidth={stroke}
                                className={isActive ? "stroke-primary" : "stroke-muted-foreground/20"}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={dashOffset}
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                              />
                            </svg>
                            {/* Time text */}
                            <div className="flex flex-col items-center z-10">
                              <span className={cn(
                                "text-xl font-bold tabular-nums tracking-tight font-mono transition-colors",
                                isActive ? "text-foreground" : "text-muted-foreground/40"
                              )}>
                                {String(Math.floor(wfhTaskElapsed / 3600)).padStart(2, "0")}
                                :{String(Math.floor((wfhTaskElapsed % 3600) / 60)).padStart(2, "0")}
                              </span>
                              <span className={cn(
                                "text-[8px] font-medium uppercase tracking-wider transition-colors",
                                isActive ? "text-muted-foreground" : "text-muted-foreground/30"
                              )}>
                                Elapsed
                              </span>
                            </div>
                          </div>
                          {wfhTaskRunning && (
                            <button
                              onClick={() => setWfhTaskPaused(p => !p)}
                              className={cn(
                                "flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors",
                                wfhTaskPaused
                                  ? "border-primary text-primary hover:bg-primary/10"
                                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                              )}
                            >
                              {wfhTaskPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                              {wfhTaskPaused ? "Resume" : "Pause"}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>


                {/* Trip Summary — addresses with colored dots */}
                {isConciergeStyle && !isWfhConcierge ? (
                  <div className="space-y-3 pt-2">
                    {conciergeStartAddress && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500 mt-[5px]" />
                        <div className="min-w-0">
                          
                          <p className="text-xs text-muted-foreground">{conciergeStartPlaceName ? `${conciergeStartPlaceName}, ${conciergeStartAddress}` : conciergeStartAddress}</p>
                        </div>
                      </div>
                    )}
                    {conciergeStopAddress && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-sm bg-primary/60 mt-[5px]" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{conciergeStopPlaceName ? `${conciergeStopPlaceName}, ${conciergeStopAddress}` : conciergeStopAddress}</p>
                        </div>
                      </div>
                    )}
                    {conciergeFinalAddress && (
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 mt-[5px]" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">{conciergeFinalPlaceName ? `${conciergeFinalPlaceName}, ${conciergeFinalAddress}` : conciergeFinalAddress}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !isConciergeStyle && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500 mt-[5px]" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{pickupPlaceName ? `${pickupPlaceName}, ${pickup}` : pickup}</p>
                    </div>
                  </div>
                  {deliverMultiStop && deliverExtraStops.length > 0 && deliverExtraStops.filter(s => s.address).map((stop, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2.5 h-2.5 rounded-sm bg-primary/60 mt-[5px]" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{stop.placeName ? `${stop.placeName}, ${stop.address}` : stop.address}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 mt-[5px]" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{dropoffPlaceName ? `${dropoffPlaceName}, ${dropoff}` : dropoff}</p>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Completion Photo — shown on Order Complete */}
              {deliveryStep >= (isWfhConcierge ? 3 : 5) && completionPhotoUrl && (
                <div className="relative rounded-2xl overflow-hidden mb-3 border border-border">
                  <img
                    src={completionPhotoUrl}
                    alt="Order completion photo"
                    className="w-full h-auto object-cover cursor-pointer"
                    onClick={() => window.open(completionPhotoUrl, "_blank")}
                  />
                  <button
                    onClick={() => window.open(completionPhotoUrl, "_blank")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    aria-label="View full photo"
                  >
                    <Eye className="w-3.5 h-3.5 text-foreground" />
                  </button>
                </div>
              )}

              {/* Contact, Chat & Action - centered row */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  onClick={() => setShowContactSupport(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
                  aria-label="Contact Support"
                >
                  <Headset className="w-4.5 h-4.5 text-white" />
                </button>
                <button
                  onClick={() => setShowChat(prev => !prev)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground hover:bg-foreground/80 transition-colors"
                  aria-label="Message Courial"
                >
                  <MessageCircle className="w-4.5 h-4.5 text-background" />
                </button>
                {deliveryStep < (isWfhConcierge ? 3 : 5) && (
                  <button
                    onClick={() => setDeliveryStep((s) => Math.min(s + 1, isWfhConcierge ? 3 : 5))}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  >
                    {isWfhConcierge
                      ? ["Begin Task", "Complete Task", "Finish"][deliveryStep]
                      : selectedService === "concierge"
                      ? ["En Route", "Arrive", "Begin Task", "Complete Task", "Finish"][deliveryStep]
                      : selectedService === "valet"
                      ? ["En Route", "Arrive", "Take Vehicle", "Park Vehicle", "Finish"][deliveryStep]
                      : ["Arrive at Pickup", "Pick Up Package", "Arrive at Drop-off", "Drop Off Package", "Complete Order"][deliveryStep]}
                  </button>
                )}
                {deliveryStep >= (isWfhConcierge ? 3 : 5) && (
                  <div className="flex-1 flex justify-end">
                    <button
                      onClick={handleDoneBooking}
                      className="px-6 py-2.5 rounded-full text-sm font-semibold text-background bg-foreground hover:bg-foreground/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              {/* Order Details */}
              <div className="rounded-xl border border-border bg-background px-4 py-2.5 mb-4">
                <button
                  onClick={() => setShowOrderDetails(p => !p)}
                  className="flex items-center justify-between w-full"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Details</p>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", showOrderDetails && "rotate-180")} />
                </button>
                {showOrderDetails && (
                  <div className="mt-3 space-y-0 divide-y divide-border text-sm">
                    {/* Row: Language + Mode (for deliver) or Language + Rate + Mode (for roadside) */}
                    {(deliverLanguage || conciergeLanguage) && (
                      <div className="grid grid-cols-3 gap-4 py-2.5">
                        <div>
                          <p className="text-xs font-medium text-foreground mb-0.5">Language</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            {deliverLanguage || conciergeLanguage}
                            {acceptedCourial && (() => {
                              const userLang = (deliverLanguage || conciergeLanguage || "").toLowerCase();
                              const courialLang = (acceptedCourial.language || "").toLowerCase();
                              const isMatch = courialLang && courialLang === userLang;
                              const hasData = !!courialLang;
                              if (!hasData) return null;
                              return isMatch
                                ? <Check className="w-3.5 h-3.5 text-green-500" />
                                : <X className="w-3.5 h-3.5 text-red-500" />;
                            })()}
                          </p>
                        </div>
                        {selectedService === "concierge" && conciergeCategory === "roadside-assistance" && conciergeServiceMode && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Rate</p>
                            <p className="text-[11px] text-muted-foreground">
                              {conciergeServiceMode === "hourly" ? "$65 per Hour" : conciergeServiceMode === "daily" ? "$480 Daily" : conciergeServiceMode}
                            </p>
                          </div>
                        )}
                        {selectedService === "concierge" && conciergeCategory === "roadside-assistance" && conciergeVehicle && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Mode</p>
                            <p className="text-[11px] text-muted-foreground capitalize">{conciergeVehicle === "none" ? "None" : conciergeVehicle}</p>
                          </div>
                        )}
                        {/* Deliver: show Mode (vehicle) on same row as Language */}
                        {!isConciergeStyle && selectedVehicle && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Mode</p>
                            <p className="text-[11px] text-muted-foreground capitalize">{selectedVehicle}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Extras row — right after Language */}
                    {!isConciergeStyle && (hasStairs || (over70lbs && Number(heavyWeight) >= 70) || twoCourials) && (
                      <div className="py-2.5">
                        <p className="text-xs font-medium text-foreground mb-0.5">Extras</p>
                        <p className="text-[11px] text-muted-foreground">
                          {[
                            hasStairs ? "Stairs" : null,
                            over70lbs && Number(heavyWeight) >= 70 ? `${heavyWeight} lbs / ${heavyItems} ${parseInt(heavyItems) === 1 ? "item" : "items"}` : null,
                            twoCourials ? "2 Courials Required" : null,
                          ].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}
                    {/* Concierge Task Description — right after Language */}
                    {isConciergeStyle && conciergeDescription.trim() && (
                      <div className="py-2.5">
                        <p className="text-xs font-medium text-foreground mb-0.5">Task Description</p>
                        <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{conciergeDescription}</p>
                      </div>
                    )}
                    {/* Row: Rate & Vehicle (same row for concierge non-roadside) */}
                    {isConciergeStyle && conciergeCategory !== "roadside-assistance" && (conciergeServiceMode || conciergeVehicle) && (
                    <div className="grid grid-cols-3 gap-4 py-2.5">
                      {conciergeServiceMode && (
                        <div>
                          <p className="text-xs font-medium text-foreground mb-0.5">Rate</p>
                          <p className="text-[11px] text-muted-foreground">
                            {conciergeServiceMode === "hourly" ? "$65 per Hour" : conciergeServiceMode === "daily" ? "$480 Daily" : conciergeServiceMode}
                          </p>
                        </div>
                      )}
                      {conciergeVehicle && (
                        <div>
                          <p className="text-xs font-medium text-foreground mb-0.5">Vehicle</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{conciergeVehicle === "none" ? "None" : conciergeVehicle}</p>
                        </div>
                      )}
                    </div>
                    )}
                    {/* Roadside vehicle details */}
                    {selectedService === "concierge" && conciergeCategory === "roadside-assistance" && (roadsideVehicleMake || roadsideVehicleModel || roadsideVehicleColor || roadsideLicensePlate) && (
                      <div className="pt-0 pb-2.5 !border-t-0 -mt-px">
                        <div>
                          <p className="text-xs font-medium text-foreground mb-0.5">Service Vehicle</p>
                          <p className="text-[11px] text-muted-foreground">
                            {[roadsideVehicleColor, roadsideVehicleMake, roadsideVehicleModel].filter(Boolean).join(" ")}
                            {roadsideLicensePlate ? ` • Plate #${roadsideLicensePlate}` : ""}
                          </p>
                        </div>
                        {roadsideSafeLocation !== null && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Safe Location</p>
                            <p className="text-[11px] text-muted-foreground">{roadsideSafeLocation ? "Yes" : "No"}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Concierge: Stairs & 2 Courials */}
                    {isConciergeStyle && (twoCourials || hasStairs) && (
                      <div className="grid grid-cols-2 gap-4 py-2.5">
                        {twoCourials && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">2 Courials</p>
                            <p className="text-[11px] text-muted-foreground">Yes</p>
                          </div>
                        )}
                        {hasStairs && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Stairs</p>
                            <p className="text-[11px] text-muted-foreground">Yes</p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Notes — BEFORE Expenses */}
                    {notes.trim() && !isConciergeStyle && (
                      <div className="py-2.5">
                        <p className="text-xs font-medium text-foreground mb-0.5">Notes</p>
                        <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{notes}</p>
                      </div>
                    )}
                    {/* Expenses — AFTER Notes */}
                    {deliverHasExpenses && deliverExpenseItems.some(e => e.description.trim()) && (
                      <div className="py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-foreground">Expenses</p>
                          <span className="text-[11px] text-muted-foreground">
                            ${deliverExpenseItems.filter(e => e.description.trim()).reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}{deliverAllowOverage && Number(deliverOverageLimit) > 0 ? ` ($${deliverOverageLimit})` : ""}
                          </span>
                        </div>
                        {deliverExpenseItems.filter(e => e.description.trim()).map((e, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{e.description}</p>
                        ))}
                      </div>
                    )}
                    {conciergeHasExpenses && conciergeExpenseItems.some(e => e.description.trim()) && (
                      <div className="py-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-foreground">Expenses</p>
                          <span className="text-[11px] text-muted-foreground">
                            ${conciergeExpenseItems.filter(e => e.description.trim()).reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}{conciergeAllowOverage && Number(conciergeOverageLimit) > 0 ? ` ($${conciergeOverageLimit})` : ""}
                          </span>
                        </div>
                        {conciergeExpenseItems.filter(e => e.description.trim()).map((e, i) => (
                          <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{e.description}</p>
                        ))}
                      </div>
                    )}
                    {/* Row: Order Value & Protection */}
                    {(deliverOrderValue || conciergeOrderValue) && (
                      <div className="grid grid-cols-3 gap-4 py-2.5">
                        <div>
                          <p className="text-xs font-medium text-foreground mb-0.5">Order Value</p>
                          <p className="text-[11px] text-muted-foreground">${deliverOrderValue || conciergeOrderValue}</p>
                        </div>
                        {(Number(deliverOrderValue) > 100 || Number(conciergeOrderValue) > 100) && (
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Protection</p>
                            <p className="text-[11px] text-muted-foreground">
                              {declineProtection ? "Declined ($0)" : (() => {
                                const val = Number(deliverOrderValue) || Number(conciergeOrderValue);
                                if (val > 200) return "Accepted (Contact Support)";
                                if (val > 100) return `Accepted ($${(val * 0.05).toFixed(0)})`;
                                return "Accepted ($0)";
                              })()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Row: Scheduled */}
                    {selectedDate && (
                      <div className="py-2.5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-foreground mb-0.5">Scheduled</p>
                            <p className="text-[11px] text-muted-foreground">{selectedDate.toLocaleDateString()} at {selectedTime}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Estimated Fare */}
                    {deliveryStep < (isWfhConcierge ? 3 : 5) && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm font-bold text-foreground">Estimated Fare</span>
                        <div className="flex items-center gap-2">
                          <img src={activePayment.icon} alt={activePayment.label} className="w-8 h-auto" />
                          <span className="text-sm font-bold text-foreground">$21.59</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price / Receipt */}
              {deliveryStep >= (isWfhConcierge ? 3 : 5) && (
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
                    {over70lbs && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Add'l Weight / Items</span>
                        <span className="text-foreground">$3.00</span>
                      </div>
                    )}
                    {hasStairs && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stairs fee</span>
                        <span className="text-foreground">$2.00</span>
                      </div>
                    )}
                    {twoCourials && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Add'l Courial</span>
                        <span className="text-foreground">$8.00</span>
                      </div>
                    )}
                    {/* Wait time – only show if non-zero */}
                    {false && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wait time</span>
                        <span className="text-foreground">$2.50</span>
                      </div>
                    )}
                    <div className="border-t border-border pt-1.5 flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">$29.31</span>
                    </div>
                  </div>
                </div>
              )}


              {/* Cancel button */}
              {deliveryStep < (isWfhConcierge ? 3 : 5) && (
                <div className="mb-3">
                  <button
                    onClick={handleCancelBooking}
                    className="w-full py-3 rounded-full text-sm font-semibold text-white bg-destructive hover:bg-destructive/90 transition-colors"
                  >
                    Cancel {selectedService === "concierge" ? "Concierge" : selectedService === "valet" ? "Valet" : "Delivery"}
                  </button>
                </div>
              )}

              {/* Chat is now rendered as overlay on the map column */}

              
            </motion.div>
          </div>
        )}

        {/* Contact Support Dialog */}
        <Dialog open={showContactSupport} onOpenChange={setShowContactSupport}>
          <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
                <DialogTitle className="sr-only">Contact Us</DialogTitle>
                <h1 className="text-2xl font-bold text-center mt-1 mb-2">Contact Us</h1>
                <p className="text-sm text-background/50 text-center mb-6">Tap any option below</p>
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
                        className="group flex flex-col items-center gap-1.5"
                        title={method.title}
                      >
                        <div className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[10px] text-background/50">{method.title}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>

        </div>

        {/* Right Column — Map Placeholder */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
           {(() => {
                const isConcierge = isConciergeStyle;
                // For concierge/valet: map each address directly to its correct marker type
                // Start → green circle (pickup), Stop → blue octagon (stop), Final → red square (dropoff)
                const mapPickup = isConcierge ? conciergeStartCoords : pickupCoords;
                const mapDropoff = isConcierge ? conciergeFinalCoords : dropoffCoords;
                const mapStop = isConcierge ? conciergeStopCoords : null;
                const mapStopAddr = isConcierge ? conciergeStopAddress : "";
                const mapStopName = isConcierge ? conciergeStopPlaceName : null;
                const mapPickupAddr = isConcierge ? conciergeStartAddress : pickup;
                const mapDropoffAddr = isConcierge ? conciergeFinalAddress : dropoff;
                const mapPickupName = isConcierge ? conciergeStartPlaceName : pickupPlaceName;
                const mapDropoffName = isConcierge ? conciergeFinalPlaceName : dropoffPlaceName;
                const mapVehicle = isConcierge ? conciergeVehicle : selectedVehicle;
                const mapExtraStops = !isConcierge ? deliverExtraStops.filter(s => s.coords).map(s => ({ coords: s.coords, address: s.address, placeName: s.placeName })) : [];
                const hasCoords = mapPickup || mapDropoff || mapStop;
               return hasCoords ? (
             <div className="flex-1 relative">
               <BookingMap pickupCoords={mapPickup} dropoffCoords={mapPickup !== mapDropoff ? mapDropoff : null} stopCoords={mapStop} extraStops={mapExtraStops} pickupAddress={mapPickupAddr} dropoffAddress={mapDropoffAddr} stopAddress={mapStopAddr} pickupPlaceName={mapPickupName} dropoffPlaceName={mapDropoffName} stopPlaceName={mapStopName} bookingState={bookingState} vehicleType={mapVehicle} courialCoords={courialCoords} />
              
                {/* Chat — single instance always mounted to preserve messages */}
                {acceptedCourial && deliveryIdRef.current && (
                  <div className={showChat ? "absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-md" : "hidden"}>
                    <div className="w-full max-w-sm mx-4">
                      <div className="rounded-[20px] bg-foreground/75 backdrop-blur-sm shadow-2xl overflow-hidden">
                        <RideChat
                          orderId={deliveryIdRef.current}
                          numericOrderId={orderIdRef.current || undefined}
                          senderId={user?.user_metadata?.courial_id || user?.id || ""}
                          receiverId={acceptedCourial.id}
                          courialName={acceptedCourial.name || "Your Courial"}
                          socketRef={socketRef}
                          visible={true}
                          darkMode
                        />
                      </div>
                    </div>
                  </div>
                )}
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
          {isConciergeStyle ? (
            <>
              <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
                <div className="flex items-center gap-3">
                  <img src={selectedService === "valet" ? valetBox : conciergeIcon} alt={selectedService === "valet" ? "Valet" : "Concierge"} className="w-8 h-8" />
                  <span className="text-[1.65rem] font-bold text-foreground">{selectedService === "valet" ? "Valet" : "Concierge"}</span>
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

      {/* Keep Searching? Dialog for WFH cascading search */}
      <Dialog open={showKeepSearching} onOpenChange={setShowKeepSearching}>
        <DialogContent className="max-w-xs rounded-2xl text-center p-7 bg-foreground/90 backdrop-blur-sm border-none">
          <DialogTitle className="text-lg font-bold text-background">No Concierges found yet</DialogTitle>
          <p className="text-sm text-background/60 leading-relaxed mt-1">
            We've searched your Home, Work, and general area but no one has accepted yet. Would you like us to keep searching?
          </p>
          <div className="flex gap-3 mt-5">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-background/20 text-background hover:bg-background/10"
              onClick={handleKeepSearchingNo}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleKeepSearchingYes}
            >
              Keep Searching
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

      {/* Home Address Gate Dialog */}
      <Dialog open={showHomeAddressGate} onOpenChange={setShowHomeAddressGate}>
        <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-hidden [&>button]:hidden shadow-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
              <DialogTitle className="text-lg font-bold text-background mb-3">Home Address Required</DialogTitle>
              <p className="text-sm text-background/70 mb-6">Please add your home address prior to booking a service.</p>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl border-background/20 text-background hover:bg-background/10"
                  onClick={() => setShowHomeAddressGate(false)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-background text-foreground hover:bg-background/90"
                  onClick={() => { setShowHomeAddressGate(false); setShowSettingsFromGate(true); }}
                >
                  Add
                </Button>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal opened from gate */}
      <SettingsModal open={showSettingsFromGate} onOpenChange={setShowSettingsFromGate} />

      {/* Sign In Required Gate */}
      <Dialog open={showSignInGate} onOpenChange={setShowSignInGate}>
        <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-hidden [&>button]:hidden shadow-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col items-center text-center">
              <DialogTitle className="text-lg font-bold text-background mb-3">Sign In Required</DialogTitle>
              <p className="text-sm text-background/70 mb-6">Please sign in to book a service.</p>
              <Button
                className="rounded-xl bg-black/50 text-white border border-white/40 hover:bg-black/60 px-6"
                onClick={() => { setShowSignInGate(false); navigate("/auth"); }}
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Book;
