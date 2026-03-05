import { ArrowLeft, Star, Calendar, Zap } from "lucide-react";
import { format } from "date-fns";
import ActivityDetailMap from "./ActivityDetailMap";
import type { ActivityItem } from "@/hooks/useActivities";

function formatFee(fee: number | string) {
  const n = typeof fee === "string" ? parseFloat(fee) : fee;
  if (isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

interface Props {
  ride: ActivityItem;
  onBack: () => void;
}

const ActivityRideDetail = ({ ride, onBack }: Props) => {
  const origin = ride.pickupInfo?.placeName || ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const originFull = ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const destinationFull = ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const hasAddress = !!(origin || destination);

  const isScheduled = ride.scheduleType === "later";
  const isCancelled = ride.status?.toLowerCase() === "cancelled" || ride.status?.toLowerCase() === "canceled";
  const isCompleted = ride.status?.toLowerCase() === "completed";

  const provider = ride.Provider || ride.provider || null;
  const driverName = provider
    ? `${provider.first_name || ""} ${provider.last_name || ""}`.trim()
    : null;
  const driverImage = provider?.image || provider?.profile_image || null;
  const driverRating = provider?.rating ? parseFloat(String(provider.rating)) : null;
  const driverVehicle = provider?.UserVehicle || ride.UserVehicle || null;
  const vehicleDesc = driverVehicle
    ? `${driverVehicle.color ? driverVehicle.color + " " : ""}${driverVehicle.year ? driverVehicle.year + " " : ""}${driverVehicle.make || ""} ${driverVehicle.model || ""}`.trim()
    : null;

  const vehicle = ride.transport_mode || ride.conciergeVehicle || ride.concierge_vehicle || null;
  const st = (ride.serviceType || "").toLowerCase();

  const serviceLabel = vehicleDesc || (ride.serviceType === "Scheduled Ride" ? "Scheduled Ride" : vehicle || ride.serviceType || "Delivery");

  const orderDate = (() => {
    if (!ride.orderDateTime) return null;
    const d = new Date(ride.orderDateTime);
    if (isNaN(d.getTime())) return ride.orderDateTime;
    return d;
  })();

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Card */}
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
                  <span className="text-lg font-bold text-foreground">{driverRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            {driverImage ? (
              <img src={driverImage} alt={driverName || "Driver"} className="w-12 h-12 rounded-full object-cover border border-border" />
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
          <p className="text-sm text-muted-foreground mb-1 capitalize">{serviceLabel}</p>

          {/* Fee + icon + vehicle */}
          <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-0.5">
            <span>{formatFee(ride.deliveryFee)}</span>
            {isScheduled ? <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> : <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="text-muted-foreground font-normal capitalize">{vehicleDesc || vehicle || st || "delivery"}</span>
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
            <span className="text-sm">💵</span>
            <span className="text-sm text-muted-foreground">Cash</span>
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
          <div className="px-5 py-4 space-y-4">
            {(origin || originFull) && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 mt-1" />
                <div>
                  {ride.pickupInfo?.placeName && (
                    <p className="text-sm font-bold text-foreground">{ride.pickupInfo.placeName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{originFull || origin}</p>
                </div>
              </div>
            )}
            {(destination || destinationFull) && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-3 h-3 bg-red-500 mt-1" />
                <div>
                  {ride.deliveryInfo?.placeName && (
                    <p className="text-sm font-bold text-foreground">{ride.deliveryInfo.placeName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{destinationFull || destination}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Need help? */}
      <button className="w-full mt-4 py-3.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
        Need help?
      </button>
    </div>
  );
};

export default ActivityRideDetail;
