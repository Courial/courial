import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Calendar, Zap, ChevronDown, Headset, MessageCircle, RotateCcw, Phone, Mail, ChevronLeft } from "lucide-react";
import { RideChat } from "./RideChat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ActivityDetailMap from "./ActivityDetailMap";
import type { ActivityItem } from "@/hooks/useActivities";
import deliverIcon from "@/assets/service-icons/deliver.png";
import conciergeIcon from "@/assets/service-icons/concierge.png";
import chauffeurIcon from "@/assets/service-icons/chauffeur.png";
import valetIcon from "@/assets/service-icons/valet.png";
import noVehicleIcon from "@/assets/no-vehicle-icon.png";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Socket } from "socket.io-client";

const serviceIconSrc: Record<string, string> = {
  Deliver: deliverIcon, deliver: deliverIcon,
  Concierge: conciergeIcon, concierge: conciergeIcon,
  Chauffeur: chauffeurIcon, chauffeur: chauffeurIcon,
  Valet: valetIcon, valet: valetIcon,
  "Scheduled Ride": deliverIcon, "scheduled ride": deliverIcon,
};

function formatFee(fee: number | string) {
  const n = typeof fee === "string" ? parseFloat(fee) : fee;
  if (isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function getStepsForService(serviceType: string): { label: string; desc: string }[] {
  const st = serviceType.toLowerCase();
  if (st === "concierge") {
    return [
      { label: "Service Accepted", desc: "Your service is confirmed" },
      { label: "Courial Arrived", desc: "Courial has arrived" },
      { label: "Service In Progress", desc: "Your task is being handled" },
      { label: "Service Completed", desc: "Task complete" },
      { label: "Service Complete", desc: "" },
    ];
  }
  if (st === "valet") {
    return [
      { label: "Service Accepted", desc: "Your valet service is confirmed" },
      { label: "Valet Arrived", desc: "Valet has arrived" },
      { label: "Service In Progress", desc: "Your vehicle is being serviced" },
      { label: "Service Completed", desc: "Service complete" },
      { label: "Service Complete", desc: "" },
    ];
  }
  return [
    { label: "Courial Accepted", desc: "Your delivery is confirmed" },
    { label: "Courial Arrived", desc: "Courial has arrived at pickup" },
    { label: "Courial Picked Up", desc: "Package picked up" },
    { label: "Courial Dropped Off", desc: "Package delivered" },
    { label: "Delivery Complete", desc: "" },
  ];
}

function getDeliveryStep(status: string): number {
  const s = status.toLowerCase();
  if (s === "completed" || s === "complete") return 99; // will clamp to maxStep
  if (s === "cancelled" || s === "canceled") return -1;
  if (s === "pending" || s === "waiting") return 0;
  if (s === "accepted" || s === "active") return 0;
  if (s === "arrived") return 1;
  if (s === "picked_up" || s === "pickedup" || s === "picked up") return 2;
  if (s === "in_progress" || s === "inprogress" || s === "in progress") return 2;
  if (s === "dropped_off" || s === "droppedoff") return 3;
  return 0;
}

interface Props {
  ride: ActivityItem;
  onBack: () => void;
  hasLiveSession?: boolean;
  onBackToLive?: () => void;
}

const ActivityRideDetail = ({ ride, onBack, hasLiveSession, onBackToLive }: Props) => {
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const socketRef = useRef<any>(null);

  

  const st = ride.serviceType?.toLowerCase() || "deliver";
  const isConciergeStyle = st === "concierge" || st === "valet";
  const iconSrc = serviceIconSrc[ride.serviceType] || deliverIcon;

  const origin = ride.pickupInfo?.placeName || ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const originFull = ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const destinationFull = ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const hasAddress = !!(origin || destination);

  const isScheduled = ride.scheduleType === "later";
  const steps = getStepsForService(ride.serviceType);
  const maxStep = steps.length - 1;
  const rawStep = getDeliveryStep(ride.status);
  const deliveryStep = rawStep === -1 ? -1 : Math.min(rawStep, maxStep);
  const isCancelled = ride.status?.toLowerCase() === "cancelled" || ride.status?.toLowerCase() === "canceled";
  const isComplete = deliveryStep >= maxStep;

  // Provider / Driver info
  const provider = ride.Provider || ride.provider || null;
  const driverName = provider
    ? `${provider.first_name || ""} ${provider.last_name || ""}`.trim()
    : null;
  const driverImage = provider?.image || provider?.profile_image || null;
  const driverRating = provider?.rating ? parseFloat(String(provider.rating)) : null;
  const driverSince = provider?.since_year || provider?.sinceYear || null;
  const driverVehicle = provider?.UserVehicle || ride.UserVehicle || null;
  const vehicleDesc = driverVehicle
    ? `${driverVehicle.color ? driverVehicle.color + " " : ""}${driverVehicle.year ? driverVehicle.year + " " : ""}${driverVehicle.make || ""} ${driverVehicle.model || ""}`.trim()
    : null;
  const licensePlate = driverVehicle?.license_plate || driverVehicle?.licensePlate || null;

  const vehicle = ride.transport_mode || ride.conciergeVehicle || ride.concierge_vehicle || null;

  const isLive = !isCancelled && !isComplete;
  const hasProvider = !!(ride.providerId || provider);

  // Category info
  const categoryName = ride.category || null;
  const subCategoryName = ride.subCategory || ride.sub_category || null;
  const categoryDisplay = [categoryName, subCategoryName].filter(Boolean).join(" • ") || null;

  // Format date
  const orderDate = (() => {
    if (!ride.orderDateTime) return null;
    const d = new Date(ride.orderDateTime);
    if (isNaN(d.getTime())) return ride.orderDateTime;
    return d;
  })();

  return (
    <div className="h-full flex flex-col">
      {/* Map */}
      {hasAddress && (
        <div className="relative mx-6 mt-6 h-48 rounded-2xl overflow-hidden bg-muted border border-border shadow-sm">
          <ActivityDetailMap origin={origin || originFull} destination={destination || destinationFull} />
          <button
            onClick={onBack}
            className="absolute top-3 left-3 w-7 h-7 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background/70 transition-colors z-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {/* If no map, show back button */}
        {!hasAddress && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors mb-2 font-semibold text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Pending
          </button>
        )}

        {/* Header — matches live tracking */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-foreground capitalize">
            {st === "concierge" ? "Concierge Service" : st === "valet" ? "Valet Service" : "Delivery"}
          </h2>
          {categoryDisplay && (
            <p className="text-sm font-medium text-muted-foreground mt-0.5">
              {categoryDisplay}
            </p>
          )}
          {isScheduled ? (
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-foreground text-[11px] font-normal">Scheduled</span>
              {orderDate instanceof Date && (
                <span className="text-sm text-foreground font-semibold">
                  {format(orderDate, "d MMMM")} • {format(orderDate, "h:mm a")}
                </span>
              )}
            </div>
          ) : (
            !isCancelled && !isComplete && (
              <p className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center justify-center gap-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Live
              </p>
            )
          )}
        </div>

        {/* Driver Card */}
        {(driverName || ride.providerId) && (
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-4">
              {driverImage ? (
                <img src={driverImage} alt={driverName || "Courial"} className="w-[60px] h-[60px] rounded-full object-cover border border-border" />
              ) : (
                <div className="rounded-full bg-muted flex items-center justify-center text-xl font-bold text-foreground" style={{ width: 60, height: 60 }}>
                  {(driverName || "C").charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{driverName?.split(" ")[0] || "Courial"}</h3>
                  {driverRating && (
                    <>
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-sm text-muted-foreground">{driverRating.toFixed(2)}</span>
                    </>
                  )}
                </div>
                {driverSince && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Courial Since {driverSince}
                  </div>
                )}
                {vehicleDesc && (
                  <div className="text-xs text-muted-foreground mt-0.5">{vehicleDesc}</div>
                )}
                {licensePlate && (
                  <div className="text-xs text-foreground mt-0.5">
                    <span className="font-normal text-muted-foreground">Plate No.</span>{" "}
                    <span className="font-bold">{licensePlate}</span>
                  </div>
                )}
              </div>
              {isConciergeStyle && (!vehicle || vehicle === "none") ? (
                <img src={noVehicleIcon} alt="No vehicle needed" className="h-[60px] w-[60px] shrink-0 object-contain" />
              ) : (
                <img src={iconSrc} alt={ride.serviceType} className="w-10 h-10 object-contain" />
              )}
            </div>
          </div>
        )}

        {/* Status & Progress Stepper */}
        {!isCancelled && (
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="space-y-0 relative">
              {steps.map((step, i) => {
                const isCompleted = deliveryStep > i;
                const isCurrent = deliveryStep === i;
                const isFuture = i > deliveryStep;
                return (
                  <div key={step.label} className="flex gap-3">
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
                      {i < steps.length - 1 && (
                        <div
                          className={cn(
                            "w-0.5 flex-1 min-h-[24px] transition-colors duration-300",
                            isCompleted ? "bg-primary" : "bg-border"
                          )}
                        />
                      )}
                    </div>
                    <div className={cn("pb-3", i === steps.length - 1 && "pb-0")}>
                      <p
                        className={cn(
                          "text-sm font-semibold leading-tight transition-colors",
                          isCurrent ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                        )}
                      >
                        {step.label === steps[steps.length - 1].label && isComplete
                          ? `Service ${ride.orderid} Complete`
                          : step.label}
                        {isCompleted && <span className="ml-1.5 text-primary">✓</span>}
                      </p>
                      {isCurrent && step.desc && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-0.5"
                        >
                          <p className="text-xs text-muted-foreground">{step.desc}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Addresses */}
            <div className="space-y-3 pt-3 mt-3 border-t border-border">
              {(origin || originFull) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-green-500 mt-[5px]" />
                  <p className="text-xs text-muted-foreground">
                    {ride.pickupInfo?.placeName
                      ? `${ride.pickupInfo.placeName}, ${originFull}`
                      : originFull || origin}
                  </p>
                </div>
              )}
              {(destination || destinationFull) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 mt-[5px]" />
                  <p className="text-xs text-muted-foreground">
                    {ride.deliveryInfo?.placeName
                      ? `${ride.deliveryInfo.placeName}, ${destinationFull}`
                      : destinationFull || destination}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancelled status */}
        {isCancelled && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <p className="text-sm font-semibold text-destructive">Order Cancelled</p>
            {orderDate instanceof Date && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(orderDate, "d MMMM yyyy")} at {format(orderDate, "h:mm a")}
              </p>
            )}
          </div>
        )}

        {/* Action buttons row — always visible */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setShowContactSupport(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
            aria-label="Contact Support"
          >
            <Headset className="w-4.5 h-4.5 text-white" />
          </button>
          <button
            onClick={() => {
              if (hasLiveSession && onBackToLive) {
                onBackToLive();
              }
            }}
            disabled={!hasLiveSession}
            className={cn(
              "h-10 px-5 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors",
              hasLiveSession
                ? "bg-foreground text-background hover:bg-foreground/80"
                : "bg-muted text-muted-foreground border border-foreground/10 cursor-not-allowed"
            )}
          >
            Back to Live
          </button>
          <button
            onClick={() => setShowChat(prev => !prev)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-foreground hover:bg-foreground/80 transition-colors"
            aria-label="Message"
          >
            <MessageCircle className="w-4.5 h-4.5 text-background" />
          </button>
        </div>

        {/* Chat */}
        {showChat && (
          <RideChat
            orderId={String(ride.orderid || "")}
            numericOrderId={String(ride.orderid || "")}
            senderId={String(ride.userId || "")}
            receiverId={hasProvider ? String(ride.providerId || "") : "support"}
            courialName={hasProvider && driverName ? driverName : "Courial Support"}
            socketRef={socketRef}
            visible={showChat}
          />
        )}

        {/* Service Details accordion */}
        <div className="rounded-xl border border-border bg-background px-4 py-2.5">
          <button
            onClick={() => setShowOrderDetails(p => !p)}
            className="flex items-center justify-between w-full"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Service Details</p>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", showOrderDetails && "rotate-180")} />
          </button>
          {showOrderDetails && (
            <div className="mt-3 space-y-0 divide-y divide-border text-sm">
              {/* Service Type */}
              <div className="py-2.5">
                <p className="text-xs font-medium text-foreground mb-0.5">Service</p>
                <p className="text-[11px] text-muted-foreground capitalize">{ride.serviceType}</p>
              </div>
              {/* Vehicle / Mode */}
              {(vehicle || ride.transport_mode) && (
                <div className="py-2.5">
                  <p className="text-xs font-medium text-foreground mb-0.5">{isConciergeStyle ? "Mode" : "Vehicle"}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{vehicle || ride.transport_mode}</p>
                </div>
              )}
              {/* Vehicle details (valet) */}
              {ride.UserVehicle && (ride.UserVehicle.make || ride.UserVehicle.model) && (
                <div className="py-2.5">
                  <p className="text-xs font-medium text-foreground mb-0.5">Vehicle Details</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[ride.UserVehicle.year, ride.UserVehicle.color, ride.UserVehicle.make, ride.UserVehicle.model].filter(Boolean).join(" ")}
                  </p>
                </div>
              )}
              {/* Description */}
              {(ride.description || ride.notes) && (
                <div className="py-2.5">
                  <p className="text-xs font-medium text-foreground mb-0.5">Description</p>
                  <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{ride.description || ride.notes}</p>
                </div>
              )}
              {/* Date */}
              {orderDate instanceof Date && (
                <div className="py-2.5">
                  <p className="text-xs font-medium text-foreground mb-0.5">Date</p>
                  <p className="text-[11px] text-muted-foreground">
                    {format(orderDate, "d MMMM yyyy")} at {format(orderDate, "h:mm a")}
                  </p>
                </div>
              )}
              {/* Fee */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm font-bold text-foreground">Estimated Fare</span>
                <span className="text-sm font-bold text-foreground">{formatFee(ride.deliveryFee)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rebook for cancelled */}
        {isCancelled && (
          <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-background bg-foreground rounded-lg h-10 hover:bg-foreground/90 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Rebook
          </button>
        )}

        {/* Cancel button */}
        {!isCancelled && !isComplete && (
          <button
            onClick={() => hasLiveSession && toast.info("To cancel, please contact support.")}
            disabled={!hasLiveSession}
            className={cn(
              "w-full py-3 rounded-full text-sm font-semibold transition-colors",
              hasLiveSession
                ? "text-white bg-destructive hover:bg-destructive/90"
                : "bg-muted text-muted-foreground border border-foreground/10 cursor-not-allowed"
            )}
          >
            Cancel {st === "concierge" ? "Concierge" : st === "valet" ? "Valet" : "Delivery"}
          </button>
        )}
      </div>

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
                ].map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityRideDetail;
