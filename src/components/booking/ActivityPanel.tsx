import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Zap, RotateCcw, Star, Loader2 } from "lucide-react";
import ActivityRideDetail from "./ActivityRideDetail";
import noScheduledIllustration from "@/assets/no-scheduled-illustration.png";
import deliverIcon from "@/assets/service-icons/deliver.png";
import conciergeIcon from "@/assets/service-icons/concierge.png";
import chauffeurIcon from "@/assets/service-icons/chauffeur.png";
import valetIcon from "@/assets/service-icons/valet.png";
import { useActivities, type ActivityItem } from "@/hooks/useActivities";
import ActivityDetailMap from "./ActivityDetailMap";

type Tab = "pending" | "past";

const serviceIconSrc: Record<string, string> = {
  Deliver: deliverIcon, deliver: deliverIcon,
  Concierge: conciergeIcon, concierge: conciergeIcon,
  Chauffeur: chauffeurIcon, chauffeur: chauffeurIcon,
  Valet: valetIcon, valet: valetIcon,
  "Scheduled Ride": deliverIcon, "scheduled ride": deliverIcon,
};

function formatActivityDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" }) +
    " • " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatFee(fee: number | string) {
  const n = typeof fee === "string" ? parseFloat(fee) : fee;
  if (isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

const statusColors: Record<string, string> = {
  completed: "text-green-500", Completed: "text-green-500",
  cancelled: "text-red-500", Cancelled: "text-red-500", canceled: "text-red-500",
  pending: "text-yellow-500", Pending: "text-yellow-500",
  active: "text-blue-500", Active: "text-blue-500",
};

/* ─── Featured card (first item) ─── */
function FeaturedCard({ ride, onClick }: { ride: ActivityItem; onClick: () => void }) {
  const origin = ride.pickupInfo?.placeName || ride.pickupInfo?.fullAddress || ride.pickupInfo?.address || "";
  const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.fullAddress || ride.deliveryInfo?.address || "";
  const originLat = ride.pickupInfo?.latitude ? parseFloat(ride.pickupInfo.latitude) : undefined;
  const originLng = ride.pickupInfo?.longitude ? parseFloat(ride.pickupInfo.longitude) : undefined;
  const destLat = ride.deliveryInfo?.latitude ? parseFloat(ride.deliveryInfo.latitude) : undefined;
  const destLng = ride.deliveryInfo?.longitude ? parseFloat(ride.deliveryInfo.longitude) : undefined;
  const hasCoords = (originLat != null && originLng != null) || (destLat != null && destLng != null);
  const isScheduled = ride.scheduleType === "later";
  const isCancelled = ride.status?.toLowerCase() === "cancelled" || ride.status?.toLowerCase() === "canceled";
  const isCompleted = ride.status?.toLowerCase() === "completed";

  const provider = ride.Provider || ride.provider || null;
  const driverName = provider
    ? (provider.firstName || provider.first_name || "").trim()
    : null;
  const driverImage = provider?.image || provider?.profile_image || null;
  const transportMode = ride.transport_mode || ride.conciergeVehicle || ride.concierge_vehicle || null;
  const serviceType = ride.serviceType || "Delivery";
  const category = ride.conciergeCategory || ride.category || "";
  const payment = getPaymentInfo(ride);

  return (
    <div onClick={onClick} className="rounded-2xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors">
      {hasCoords && (
        <div className="h-40 rounded-xl overflow-hidden mb-4 bg-muted">
          <ActivityDetailMap originLat={originLat} originLng={originLng} destLat={destLat} destLng={destLng} />
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{driverName || "Unassigned"}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {transportMode || serviceType}
          </p>
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

      <div className="flex items-center gap-2 text-sm font-bold text-foreground mb-1">
        <span>{formatFee(ride.deliveryFee)}</span>
        {isScheduled ? <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> : <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
        <span className="text-muted-foreground font-normal capitalize">
          {serviceType}{category ? ` • ${category}` : ""}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-2">{formatActivityDate(ride.orderDateTime)}</p>

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
  );
}

/* ─── Compact list item ─── */
function CompactCard({ ride, onClick }: { ride: ActivityItem; onClick: () => void }) {
  const iconSrc = serviceIconSrc[ride.serviceType] || deliverIcon;
  const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.address || ride.pickupInfo?.placeName || ride.serviceType || "Unknown location";
  const isScheduled = ride.scheduleType === "later";
  const isCancelled = ride.status?.toLowerCase() === "cancelled" || ride.status?.toLowerCase() === "canceled";
  const isCompleted = ride.status?.toLowerCase() === "completed";

  return (
    <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors">
      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
        <img src={iconSrc} alt={ride.serviceType} className="w-9 h-9 object-contain" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{destination}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatActivityDate(ride.orderDateTime)}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isScheduled ? <Calendar className="w-3 h-3 text-muted-foreground" /> : <Zap className="w-3 h-3 text-muted-foreground" />}
          <span className="text-xs font-semibold text-foreground">{formatFee(ride.deliveryFee)}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`text-xs font-semibold ${statusColors[ride.status] || "text-muted-foreground"}`}>
          {ride.status}
        </span>
        {isCancelled && (
          <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-2.5 py-0.5 transition-colors">
            <RotateCcw className="w-3 h-3" />
            Rebook
          </button>
        )}
        {isCompleted && (
          <button onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] font-medium text-primary border border-primary/30 rounded-full px-2.5 py-0.5 transition-colors">
            <Star className="w-3 h-3" />
            Rate
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Panel ─── */
export const ActivityPanel = ({ onBack, onBackToLive }: { onBack: () => void; hasLiveSession?: boolean; onBackToLive?: () => void }) => {
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedRide, setSelectedRide] = useState<ActivityItem | null>(null);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivities(tab);
  const rides = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Tabs — always visible */}
      <div className="flex gap-2 mb-6">
        {(["pending", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedRide(null); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              tab === t
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground border border-border"
            }`}
          >
            {t === "pending" ? "Pending" : "Past"}
          </button>
        ))}
      </div>

      {/* Content — either detail or list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedRide ? (
            <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ActivityRideDetail ride={selectedRide} onBack={() => setSelectedRide(null)} onBackToLive={onBackToLive} />
            </motion.div>
          ) : isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </motion.div>
          ) : rides.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center justify-center py-16 text-center">
              <img src={noScheduledIllustration} alt="No services" className="w-48 h-auto mb-6 opacity-80" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {tab === "pending" ? "No Scheduled Services" : "No Past Activity"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                {tab === "pending" ? "You don't have any upcoming services scheduled." : "You haven't completed any services yet."}
              </p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <FeaturedCard ride={rides[0]} onClick={() => setSelectedRide(rides[0])} />
              {rides.slice(1).map((ride, idx) => (
                <CompactCard key={`${ride.orderid}-${idx}`} ride={ride} onClick={() => setSelectedRide(ride)} />
              ))}
              {hasNextPage && (
                <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="w-full py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Load more"}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
