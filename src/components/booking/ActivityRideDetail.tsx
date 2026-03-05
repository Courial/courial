import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Calendar, Zap, ChevronDown, Phone, Mail, RotateCcw, Headset, MessageCircle, Check, X } from "lucide-react";
import { RideChat } from "./RideChat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ActivityDetailMap from "./ActivityDetailMap";
import type { ActivityItem } from "@/hooks/useActivities";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

function formatFee(fee: number | string) {
  const n = typeof fee === "string" ? parseFloat(fee) : fee;
  if (isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

interface Props {
  ride: ActivityItem;
  onBack: () => void;
  hasLiveSession?: boolean;
  onBackToLive?: () => void;
}

const ActivityRideDetail = ({ ride, onBack, hasLiveSession, onBackToLive }: Props) => {
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [showContactSupport, setShowContactSupport] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const socketRef = useRef<any>(null);

  const st = (ride.serviceType || "").toLowerCase();
  const isConciergeStyle = st === "concierge" || st === "valet";

  const origin = ride.pickupInfo?.placeName || ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const originFull = ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const destinationFull = ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const hasAddress = !!(origin || destination);

  const isScheduled = ride.scheduleType === "later";
  const isCancelled = ride.status?.toLowerCase() === "cancelled" || ride.status?.toLowerCase() === "canceled";
  const isCompleted = ride.status?.toLowerCase() === "completed";
  const isLive = !isCancelled && !isCompleted;

  // Stored details from localStorage
  const storedDetails = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("courial_order_details") || "{}");
      return stored[String(ride.orderid)] || null;
    } catch { return null; }
  }, [ride.orderid]);

  // Provider / Driver info
  const apiProvider = ride.Provider || ride.provider || null;
  const storedProvider = storedDetails?.provider || null;
  const provider = apiProvider || storedProvider;
  const driverName = provider
    ? `${provider.first_name || ""} ${provider.last_name || ""}`.trim()
    : null;
  const driverImage = provider?.image || provider?.profile_image || null;
  const driverRating = provider?.rating ? parseFloat(String(provider.rating)) : null;
  const driverVehicle = provider?.UserVehicle || ride.UserVehicle || null;
  const vehicleDesc = driverVehicle
    ? `${driverVehicle.color ? driverVehicle.color + " " : ""}${driverVehicle.year ? driverVehicle.year + " " : ""}${driverVehicle.make || ""} ${driverVehicle.model || ""}`.trim()
    : null;
  const hasProvider = !!(ride.providerId || provider);

  const vehicle = ride.transport_mode || ride.conciergeVehicle || ride.concierge_vehicle || null;

  // Categories
  const storedCategories = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("courial_order_categories") || "{}");
      return stored[String(ride.orderid)] || null;
    } catch { return null; }
  })();

  // Format date
  const orderDate = (() => {
    if (!ride.orderDateTime) return null;
    const d = new Date(ride.orderDateTime);
    if (isNaN(d.getTime())) return ride.orderDateTime;
    return d;
  })();

  const serviceLabel = ride.serviceType === "Scheduled Ride"
    ? "Scheduled Ride"
    : vehicleDesc || vehicle || ride.serviceType || "Delivery";

  return (
    <div className="h-full flex flex-col">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Card container */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Header */}
            <div className="pt-5 pb-3 text-center">
              <h2 className="text-lg font-bold text-foreground">Ride Details</h2>
            </div>

            {/* Map */}
            {hasAddress && (
              <div className="mx-4 h-44 rounded-xl overflow-hidden bg-muted mb-4">
                <ActivityDetailMap origin={origin || originFull} destination={destination || destinationFull} />
              </div>
            )}

            {/* Driver info section */}
            <div className="px-5 pb-5">
              {/* Driver name + rating + photo */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    {driverName?.split(" ")[0] || "Unassigned"}
                  </h3>
                  {driverRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                      <span className="text-lg font-bold text-foreground">
                        {driverRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                {driverImage ? (
                  <img
                    src={driverImage}
                    alt={driverName || "Driver"}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Vehicle type */}
              <p className="text-sm text-muted-foreground mb-1">{serviceLabel}</p>

              {/* Fee + icon + vehicle */}
              <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-0.5">
                <span>{formatFee(ride.deliveryFee)}</span>
                {isScheduled ? (
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="text-muted-foreground font-normal capitalize">
                  {vehicleDesc || vehicle || st || "delivery"}
                </span>
              </div>

              {/* Date + Order ID */}
              <p className="text-sm text-muted-foreground mb-2">
                {orderDate instanceof Date
                  ? `${format(orderDate, "d MMM")} • ${format(orderDate, "hh:mm a")}`
                  : typeof orderDate === "string" ? orderDate : "—"
                }
                {ride.orderid && ` • Order ID ${ride.orderid}`}
              </p>

              {/* Payment + Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm">💵</span>
                <span className="text-sm text-muted-foreground">Cash</span>
                <span className="text-muted-foreground/40">•</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isCompleted
                      ? "text-green-500 bg-green-500/10"
                      : isCancelled
                      ? "text-red-500 bg-red-500/10"
                      : "text-yellow-500 bg-yellow-500/10"
                  }`}
                >
                  {ride.status}
                </span>
              </div>
            </div>

            {/* Receipt message (for completed) */}
            {isCompleted && (
              <>
                <div className="mx-5 border-t border-border" />
                <p className="text-sm text-muted-foreground text-center py-4 px-5 italic">
                  A detailed receipt has been sent to your email.
                </p>
                <div className="mx-5 border-t border-border" />
              </>
            )}

            {/* Addresses */}
            {hasAddress && (
              <div className="px-5 py-4 space-y-4">
                {(origin || originFull) && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 mt-1" />
                    <div>
                      {ride.pickupInfo?.placeName && (
                        <p className="text-sm font-bold text-foreground">
                          {ride.pickupInfo.placeName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {originFull || origin}
                      </p>
                    </div>
                  </div>
                )}
                {(destination || destinationFull) && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-3 h-3 bg-red-500 mt-1" />
                    <div>
                      {ride.deliveryInfo?.placeName && (
                        <p className="text-sm font-bold text-foreground">
                          {ride.deliveryInfo.placeName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {destinationFull || destination}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Need help? button */}
          <button
            onClick={() => setShowContactSupport(true)}
            className="w-full mt-4 py-3.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Need help?
          </button>

          {/* Action buttons for live orders */}
          {isLive && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => setShowChat((prev) => !prev)}
                className="flex-1 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </button>
              {hasLiveSession && onBackToLive && (
                <button
                  onClick={onBackToLive}
                  className="flex-1 py-3 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Back to Live
                </button>
              )}
            </div>
          )}

          {/* Chat */}
          {showChat && (
            <div className="mt-3">
              <RideChat
                orderId={String(ride.orderid || "")}
                numericOrderId={String(ride.orderid || "")}
                senderId={String(ride.userId || "")}
                receiverId={hasProvider ? String(ride.providerId || "") : "support"}
                courialName={hasProvider && driverName ? driverName : "Courial Support"}
                socketRef={socketRef}
                visible={showChat}
              />
            </div>
          )}

          {/* Cancel for live orders */}
          {isLive && (
            <button
              onClick={() => hasLiveSession && toast.info("To cancel, please contact support.")}
              disabled={!hasLiveSession}
              className={cn(
                "w-full mt-3 py-3 rounded-full text-sm font-semibold transition-colors",
                hasLiveSession
                  ? "text-white bg-destructive hover:bg-destructive/90"
                  : "bg-muted text-muted-foreground border border-foreground/10 cursor-not-allowed"
              )}
            >
              Cancel {st === "concierge" ? "Concierge" : st === "valet" ? "Valet" : "Delivery"}
            </button>
          )}

          {/* Rebook for cancelled */}
          {isCancelled && (
            <button className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-background bg-foreground rounded-full py-3 hover:bg-foreground/90 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Rebook
            </button>
          )}

          {/* Service Details accordion */}
          <div className="mt-3 rounded-2xl border border-border bg-card px-4 py-3">
            <button
              onClick={() => setShowServiceDetails((p) => !p)}
              className="flex items-center justify-between w-full"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {ride.orderid} • Service Details
              </p>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform",
                  showServiceDetails && "rotate-180"
                )}
              />
            </button>
            {showServiceDetails && (
              <ServiceDetailsContent ride={ride} storedDetails={storedDetails} provider={provider} isConciergeStyle={isConciergeStyle} st={st} vehicle={vehicle} />
            )}
          </div>
        </div>
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
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`${item.color} w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-background/70 group-hover:text-background">{item.title}</span>
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

/* ─── Service Details Content (extracted for cleanliness) ─── */
function ServiceDetailsContent({
  ride,
  storedDetails,
  provider,
  isConciergeStyle,
  st,
  vehicle,
}: {
  ride: ActivityItem;
  storedDetails: any;
  provider: any;
  isConciergeStyle: boolean;
  st: string;
  vehicle: string | null;
}) {
  return (
    <div className="mt-3 space-y-0 divide-y divide-border text-sm">
      {/* Language + Rate + Mode */}
      {(() => {
        const lang = storedDetails?.language || null;
        const rate = storedDetails?.rate || null;
        const mode = storedDetails?.mode || vehicle || ride.transport_mode || null;
        const isRoadside = storedDetails?.category?.toLowerCase()?.includes("roadside");
        const isValet = st === "valet";
        const providerLang = provider?.language || null;

        if (isValet && (rate || mode || lang)) {
          return (
            <div className="grid grid-cols-3 gap-4 py-2.5">
              {rate && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Rate</p>
                  <p className="text-[11px] text-muted-foreground">
                    {rate === "hourly" ? "$65 per Hour" : rate === "daily" ? "$480 Daily" : rate}
                  </p>
                </div>
              )}
              {mode && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Mode</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{mode === "none" ? "None" : mode}</p>
                </div>
              )}
              {lang && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Language Prefs</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {lang}
                    {providerLang && (
                      providerLang.toLowerCase() === lang.toLowerCase()
                        ? <Check className="w-3.5 h-3.5 text-green-500" />
                        : <X className="w-3.5 h-3.5 text-red-500" />
                    )}
                  </p>
                </div>
              )}
            </div>
          );
        }

        if (lang || (isConciergeStyle && (rate || mode))) {
          return (
            <div className="grid grid-cols-3 gap-4 py-2.5">
              {lang && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Language</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {lang}
                    {providerLang && (
                      providerLang.toLowerCase() === lang.toLowerCase()
                        ? <Check className="w-3.5 h-3.5 text-green-500" />
                        : <X className="w-3.5 h-3.5 text-red-500" />
                    )}
                  </p>
                </div>
              )}
              {isRoadside && rate && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Rate</p>
                  <p className="text-[11px] text-muted-foreground">
                    {rate === "hourly" ? "$65 per Hour" : rate === "daily" ? "$480 Daily" : rate}
                  </p>
                </div>
              )}
              {(isRoadside || !isConciergeStyle) && mode && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-0.5">Mode</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{mode === "none" ? "None" : mode}</p>
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}

      {/* Extras (deliver) */}
      {!isConciergeStyle && (storedDetails?.hasStairs || (storedDetails?.over70lbs && Number(storedDetails?.heavyWeight) >= 70) || storedDetails?.twoCourials) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Extras</p>
          <p className="text-[11px] text-muted-foreground">
            {[
              storedDetails.hasStairs ? "Stairs" : null,
              storedDetails.over70lbs && Number(storedDetails.heavyWeight) >= 70 ? `${storedDetails.heavyWeight} lbs / ${storedDetails.heavyItems} ${parseInt(storedDetails.heavyItems) === 1 ? "item" : "items"}` : null,
              storedDetails.twoCourials ? "2 Courials Required" : null,
            ].filter(Boolean).join(", ")}
          </p>
        </div>
      )}

      {/* Rate & Mode (concierge non-roadside, non-valet) */}
      {isConciergeStyle && st !== "valet" && !storedDetails?.category?.toLowerCase()?.includes("roadside") && (storedDetails?.rate || storedDetails?.mode) && (
        <div className="grid grid-cols-3 gap-4 py-2.5">
          {storedDetails.rate && (
            <div>
              <p className="text-xs font-medium text-foreground mb-0.5">Rate</p>
              <p className="text-[11px] text-muted-foreground">
                {storedDetails.rate === "hourly" ? "$65 per Hour" : storedDetails.rate === "daily" ? "$480 Daily" : storedDetails.rate}
              </p>
            </div>
          )}
          {storedDetails.mode && (
            <div>
              <p className="text-xs font-medium text-foreground mb-0.5">Mode</p>
              <p className="text-[11px] text-muted-foreground capitalize">{storedDetails.mode === "none" ? "None" : storedDetails.mode}</p>
            </div>
          )}
        </div>
      )}

      {/* Service Description */}
      {isConciergeStyle && (storedDetails?.description || ride.description) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Service Description</p>
          <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{storedDetails?.description || ride.description}</p>
        </div>
      )}

      {/* Valet vehicle details */}
      {st === "valet" && storedDetails?.vehicleDetails && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Service Details</p>
          <p className="text-[11px] text-muted-foreground">
            {[storedDetails.vehicleDetails.year, storedDetails.vehicleDetails.color, storedDetails.vehicleDetails.make, storedDetails.vehicleDetails.model].filter(Boolean).join(" ")}
            {storedDetails.vehicleDetails.portType ? ` • ${storedDetails.vehicleDetails.portType} Port Type` : ""}
            {storedDetails.vehicleDetails.licensePlate ? ` • Plate #${storedDetails.vehicleDetails.licensePlate}` : ""}
          </p>
          {(storedDetails.vehicleDetails.currentCharge || storedDetails.vehicleDetails.targetCharge) && (
            <p className="text-[11px] text-muted-foreground">
              {storedDetails.vehicleDetails.currentCharge ? `Current Range of ${storedDetails.vehicleDetails.currentCharge}%` : ""}
              {storedDetails.vehicleDetails.currentCharge && storedDetails.vehicleDetails.targetCharge ? " • " : ""}
              {storedDetails.vehicleDetails.targetCharge ? `Charge to ${storedDetails.vehicleDetails.targetCharge}%` : ""}
            </p>
          )}
        </div>
      )}

      {/* Concierge roadside vehicle */}
      {st === "concierge" && storedDetails?.vehicleDetails && (storedDetails.vehicleDetails.make || storedDetails.vehicleDetails.model) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Service Vehicle</p>
          <p className="text-[11px] text-muted-foreground">
            {[storedDetails.vehicleDetails.color, storedDetails.vehicleDetails.make, storedDetails.vehicleDetails.model].filter(Boolean).join(" ")}
            {storedDetails.vehicleDetails.licensePlate ? ` • Plate #${storedDetails.vehicleDetails.licensePlate}` : ""}
          </p>
        </div>
      )}

      {/* Concierge stairs/2 courials */}
      {isConciergeStyle && (storedDetails?.twoCourials || storedDetails?.hasStairs) && (
        <div className="grid grid-cols-2 gap-4 py-2.5">
          {storedDetails.twoCourials && (
            <div>
              <p className="text-xs font-medium text-foreground mb-0.5">2 Courials</p>
              <p className="text-[11px] text-muted-foreground">Yes</p>
            </div>
          )}
          {storedDetails.hasStairs && (
            <div>
              <p className="text-xs font-medium text-foreground mb-0.5">Stairs</p>
              <p className="text-[11px] text-muted-foreground">Yes</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {!isConciergeStyle && (storedDetails?.notes || ride.notes) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Notes</p>
          <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{storedDetails?.notes || ride.notes}</p>
        </div>
      )}

      {/* Expenses */}
      {storedDetails?.expenses && storedDetails.expenses.items?.length > 0 && (
        <div className="py-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-foreground">Expenses</p>
            <span className="text-[11px] text-muted-foreground">
              ${storedDetails.expenses.items.reduce((sum: number, e: any) => sum + Number(e.amount), 0).toLocaleString()}
              {storedDetails.expenses.allowOverage && Number(storedDetails.expenses.overageLimit) > 0 ? ` ($${storedDetails.expenses.overageLimit})` : ""}
            </span>
          </div>
          {storedDetails.expenses.items.map((e: any, i: number) => (
            <p key={i} className="text-[11px] text-muted-foreground leading-relaxed">{e.description}</p>
          ))}
        </div>
      )}

      {/* Order Value */}
      {storedDetails?.orderValue && (
        <div className="grid grid-cols-3 gap-4 py-2.5">
          <div>
            <p className="text-xs font-medium text-foreground mb-0.5">Order Value</p>
            <p className="text-[11px] text-muted-foreground">${storedDetails.orderValue}</p>
          </div>
          {Number(storedDetails.orderValue) > 100 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-0.5">Protection</p>
              <p className="text-[11px] text-muted-foreground">
                {storedDetails.declineProtection ? "Declined ($0)" : (() => {
                  const val = Number(storedDetails.orderValue);
                  if (val > 200) return "Accepted (Contact Support)";
                  if (val > 100) return `Accepted ($${(val * 0.05).toFixed(0)})`;
                  return "Accepted ($0)";
                })()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fallback vehicle/mode */}
      {!storedDetails && (vehicle || ride.transport_mode) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">{isConciergeStyle ? "Mode" : "Vehicle"}</p>
          <p className="text-[11px] text-muted-foreground capitalize">{vehicle || ride.transport_mode}</p>
        </div>
      )}

      {/* Fallback description */}
      {!storedDetails && (ride.description || ride.notes) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Description</p>
          <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{ride.description || ride.notes}</p>
        </div>
      )}

      {/* Fallback vehicle details */}
      {!storedDetails && ride.UserVehicle && (ride.UserVehicle.make || ride.UserVehicle.model) && (
        <div className="py-2.5">
          <p className="text-xs font-medium text-foreground mb-0.5">Vehicle Details</p>
          <p className="text-[11px] text-muted-foreground">
            {[ride.UserVehicle.year, ride.UserVehicle.color, ride.UserVehicle.make, ride.UserVehicle.model].filter(Boolean).join(" ")}
          </p>
        </div>
      )}

      {/* Estimated Fare */}
      <div className="flex items-center justify-between py-2.5">
        <span className="text-sm font-bold text-foreground">Estimated Fare</span>
        <span className="text-sm font-bold text-foreground">{formatFee(ride.deliveryFee)}</span>
      </div>
    </div>
  );
}

export default ActivityRideDetail;
