import { Star, Calendar, Zap, Car } from "lucide-react";
import { format } from "date-fns";
import ActivityDetailMap from "./ActivityDetailMap";
import type { ActivityItem } from "@/hooks/useActivities";
import visaIcon from "@/assets/card-icons/visa.svg";
import mastercardIcon from "@/assets/card-icons/mastercard.svg";
import amexIcon from "@/assets/card-icons/amex.svg";
import discoverIcon from "@/assets/card-icons/discover.svg";

function formatFee(fee: number | string) {
  const n = typeof fee === "string" ? parseFloat(fee) : fee;
  if (isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

/** Derive the primary service type label */
function getServiceTypeLabel(ride: ActivityItem): string {
  const st = (ride.serviceType || "").toLowerCase();
  if (st.includes("valet")) return "Valet";
  if (st.includes("concierge")) return "Concierge";
  if (st.includes("chauffeur")) return "Chauffeur";
  return "Deliver";
}

/** Get category label (e.g. "Drive", "EV Charging") */
function getCategoryLabel(ride: ActivityItem): string {
  return ride.conciergeCategory || ride.subCategory || ride.sub_category || ride.category || "";
}

/** Get the transport mode / vehicle label */
function getTransportLabel(ride: ActivityItem): string {
  if (ride.transport_mode) return ride.transport_mode;
  if (ride.conciergeVehicle || ride.concierge_vehicle) return ride.conciergeVehicle || ride.concierge_vehicle || "";
  return "No Vehicle";
}

/** Get payment display info */
function getPaymentInfo(ride: ActivityItem): { label: string; icon: string | null } {
  const payType = (ride.paymentType || ride.payment_type || "").toLowerCase();
  const cardType = (ride.cardType || ride.card_type || "").toLowerCase();

  if (cardType.includes("visa") || payType.includes("visa")) return { label: "Visa", icon: visaIcon };
  if (cardType.includes("master") || payType.includes("master")) return { label: "Mastercard", icon: mastercardIcon };
  if (cardType.includes("amex") || payType.includes("amex")) return { label: "Amex", icon: amexIcon };
  if (cardType.includes("discover") || payType.includes("discover")) return { label: "Discover", icon: discoverIcon };
  if (payType.includes("card") || cardType) return { label: cardType || "Card", icon: null };
  if (payType.includes("cash") || payType === "") return { label: "Cash", icon: null };
  return { label: payType || "Cash", icon: null };
}

interface Props {
  ride: ActivityItem;
  onBack: () => void;
  onBackToLive?: () => void;
}

const ActivityRideDetail = ({ ride, onBackToLive }: Props) => {
  const origin = ride.pickupInfo?.placeName || ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const originFull = ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const destinationFull = ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";

  const originLat = ride.pickupInfo?.latitude ? parseFloat(ride.pickupInfo.latitude) : undefined;
  const originLng = ride.pickupInfo?.longitude ? parseFloat(ride.pickupInfo.longitude) : undefined;
  const destLat = ride.deliveryInfo?.latitude ? parseFloat(ride.deliveryInfo.latitude) : undefined;
  const destLng = ride.deliveryInfo?.longitude ? parseFloat(ride.deliveryInfo.longitude) : undefined;

  const hasCoords = (originLat != null && originLng != null) || (destLat != null && destLng != null);
  const hasAddress = !!(origin || originFull || destination || destinationFull);

  const isScheduled = ride.scheduleType === "later";
  const isCancelled = ride.status?.toLowerCase() === "cancelled" || ride.status?.toLowerCase() === "canceled";
  const isCompleted = ride.status?.toLowerCase() === "completed";

  const provider = ride.Provider || ride.provider || null;
  const driverName = provider
    ? (provider.firstName || provider.first_name || "").trim()
    : null;
  const driverImage = provider?.image || provider?.profile_image || null;
  const driverRating = provider?.mrating ? parseFloat(String(provider.mrating)) : (provider?.rating ? parseFloat(String(provider.rating)) : null);

  const serviceTypeLabel = getServiceTypeLabel(ride);
  const categoryLabel = getCategoryLabel(ride);
  const transportLabel = getTransportLabel(ride);
  const payment = getPaymentInfo(ride);

  const orderDate = (() => {
    if (!ride.orderDateTime) return null;
    const d = new Date(ride.orderDateTime);
    if (isNaN(d.getTime())) return ride.orderDateTime;
    return d;
  })();

  const handleNeedHelp = () => {
    window.open("/help#contact", "_blank");
  };

  return (
    <div>
      {/* Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Map frame */}
        <div className="mx-4 mt-4 h-44 rounded-xl overflow-hidden bg-muted mb-4">
          {hasCoords && (
            <ActivityDetailMap originLat={originLat} originLng={originLng} destLat={destLat} destLng={destLng} />
          )}
        </div>

        <div className="px-5 pb-5">
          {/* Service type label + rating + Courial profile photo */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground">
                {driverName?.split(" ")[0] || serviceTypeLabel}
              </h3>
              {driverRating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="text-lg font-bold text-foreground">{driverRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {driverImage ? (
              <img src={driverImage} alt={driverName || "Courial"} className="w-12 h-12 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>

          {/* Transport mode line */}
          <p className="text-sm text-muted-foreground mb-1 capitalize">{transportLabel}</p>

          {/* Fee + icon + service/category */}
          <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-0.5">
            <span>{formatFee(ride.deliveryFee)}</span>
            {isScheduled ? <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> : <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="text-muted-foreground font-normal capitalize">
              {serviceTypeLabel}{categoryLabel ? ` • ${categoryLabel}` : ""}
            </span>
          </div>

          {/* Date + Order ID */}
          <p className="text-sm text-muted-foreground mb-2">
            {orderDate instanceof Date
              ? `${format(orderDate, "d MMM")} • ${format(orderDate, "hh:mm a")}`
              : typeof orderDate === "string" ? orderDate : "—"}
            {ride.orderid && ` • Order ID ${ride.orderid}`}
          </p>

          {/* Payment + Status */}
          <div className="flex items-center gap-2">
            {payment.icon ? (
              <img src={payment.icon} alt={payment.label} className="w-6 h-4 object-contain" />
            ) : (
              <span className="text-sm">💵</span>
            )}
            <span className="text-sm text-muted-foreground capitalize">{payment.label}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isCompleted ? "text-green-500 bg-green-500/10" :
              isCancelled ? "text-red-500 bg-red-500/10" :
              "text-yellow-500 bg-yellow-500/10"
            }`}>
              {ride.status}
            </span>
          </div>
        </div>

        {/* Receipt message */}
        {isCompleted && (
          <>
            <div className="mx-5 border-t border-border" />
            <p className="text-sm text-muted-foreground text-center py-4 px-5">
              A detailed receipt has been sent to your email.
            </p>
            <div className="mx-5 border-t border-border" />
          </>
        )}

        {/* Addresses */}
        {hasAddress && (
          <div className="px-5 pt-6 pb-4">
            <div className="relative pl-6">
              {(origin || originFull) && (
                <div className="relative flex items-start gap-3 pb-6">
                  <div className="absolute left-[-18px] top-1 w-3 h-3 rounded-full bg-green-500" />
                  <div>
                    {ride.pickupInfo?.placeName && (
                      <p className="text-sm font-bold text-foreground">{ride.pickupInfo.placeName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{originFull || origin}</p>
                  </div>
                </div>
              )}
              {(destination || destinationFull) && (
                <div className="relative flex items-start gap-3">
                  <div className="absolute left-[-18px] top-1 w-3 h-3 bg-red-500" />
                  <div>
                    {ride.deliveryInfo?.placeName && (
                      <p className="text-sm font-bold text-foreground">{ride.deliveryInfo.placeName}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{destinationFull || destination}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        {onBackToLive && (
          <button
            onClick={onBackToLive}
            className="flex-1 py-3.5 rounded-full border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            Back to Live
          </button>
        )}
        <button
          onClick={handleNeedHelp}
          className={`${onBackToLive ? 'flex-1' : 'w-full'} py-3.5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors`}
        >
          Need help?
        </button>
      </div>
    </div>
  );
};

export default ActivityRideDetail;
