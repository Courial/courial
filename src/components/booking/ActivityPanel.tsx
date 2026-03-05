import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, RotateCcw, Calendar, MapPin, ArrowLeft, Zap, Loader2 } from "lucide-react";
import ActivityRideDetail from "./ActivityRideDetail";
import noScheduledIllustration from "@/assets/no-scheduled-illustration.png";
import { useNavigate } from "react-router-dom";
import deliverIcon from "@/assets/service-icons/deliver.png";
import conciergeIcon from "@/assets/service-icons/concierge.png";
import chauffeurIcon from "@/assets/service-icons/chauffeur.png";
import valetIcon from "@/assets/service-icons/valet.png";
import { useActivities, type ActivityItem } from "@/hooks/useActivities";

type Tab = "pending" | "past";

const serviceIconSrc: Record<string, string> = {
  Deliver: deliverIcon,
  deliver: deliverIcon,
  Concierge: conciergeIcon,
  concierge: conciergeIcon,
  Chauffeur: chauffeurIcon,
  chauffeur: chauffeurIcon,
  Valet: valetIcon,
  valet: valetIcon,
  "Scheduled Ride": deliverIcon,
  "scheduled ride": deliverIcon,
};

const statusBadgeBg: Record<string, string> = {
  Completed: "text-green-700",
  completed: "text-green-700",
  Cancelled: "text-red-700",
  cancelled: "text-red-700",
  Pending: "text-yellow-500",
  pending: "text-yellow-500",
  active: "text-blue-600",
  Active: "text-blue-600",
};

function formatActivityDate(iso: string | null | undefined) {
  if (!iso) return "—";
  // If the API already returns a formatted string (e.g. "5 Mar • 07:03 AM"), use it directly
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short" }) +
    " • " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatFee(fee: number | string) {
  const n = typeof fee === "string" ? parseFloat(fee) : fee;
  if (isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export const ActivityPanel = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedRide, setSelectedRide] = useState<ActivityItem | null>(null);
  const navigate = useNavigate();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivities(tab);

  const rides = useMemo(() => data?.pages.flat() ?? [], [data]);

  if (selectedRide) {
    return <ActivityRideDetail ride={selectedRide} onBack={() => setSelectedRide(null)} />;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(["pending", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              tab === t
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground border border-border"
            }`}
          >
            {t === "pending" ? "Pending" : "Past"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </motion.div>
          ) : rides.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <img
                src={noScheduledIllustration}
                alt="No scheduled services"
                className="w-48 h-auto mb-6 opacity-80"
              />
              <h3 className="text-xl font-bold text-foreground mb-2">
                {tab === "pending" ? "No Scheduled Services" : "No Past Activity"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[260px]">
                {tab === "pending"
                  ? "You don't have any upcoming services scheduled."
                  : "You haven't completed any services yet."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {rides.map((ride, idx) => {
                const iconSrc = serviceIconSrc[ride.serviceType] || deliverIcon;
                const destination = ride.deliveryInfo?.placeName || ride.deliveryInfo?.address || ride.pickupInfo?.placeName || ride.serviceType || "—";
                const isScheduled = ride.scheduleType === "later";
                const vehicle = ride.transport_mode || ride.UserVehicle?.make || null;

                return (
                  <div
                    key={`${ride.orderid}-${idx}`}
                    onClick={() => setSelectedRide(ride)}
                    className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-lg bg-muted-foreground/10 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={iconSrc} alt={ride.serviceType} className="w-7 h-7 object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground truncate">{destination}</span>
                          <span className={`text-[11px] font-semibold shrink-0 ${statusBadgeBg[ride.status] || "text-muted-foreground"}`}>
                            {ride.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {isScheduled ? (
                            <Calendar className="w-3 h-3 shrink-0 text-muted-foreground" />
                          ) : (
                            <Zap className="w-3 h-3 shrink-0 text-muted-foreground" />
                          )}
                          <span>{formatActivityDate(ride.orderDateTime)}</span>
                          {vehicle && (
                            <>
                              <span className="text-muted-foreground/40">•</span>
                              <span>{vehicle}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-semibold text-foreground">{formatFee(ride.deliveryFee)}</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-xs font-medium text-muted-foreground capitalize">{ride.serviceType}</span>
                          {ride.status?.toLowerCase() === "cancelled" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); }}
                              className="ml-auto flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full px-3 py-0.5"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Rebook
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load more */}
              {hasNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Load more"
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
