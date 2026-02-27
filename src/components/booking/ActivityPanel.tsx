import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Package, RotateCcw, Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type Tab = "pending" | "past";

// Mock data for demo — will be replaced with real data
const mockPendingRides: any[] = [];

const mockPastRides = [
  {
    id: "1",
    type: "Deliver",
    destination: "350 Fifth Avenue, New York",
    date: "26 Feb • 02:15 PM",
    price: "$21.59",
    status: "Completed",
    vehicle: "Car",
  },
  {
    id: "2",
    type: "Concierge",
    destination: "SoHo House NYC",
    date: "24 Feb • 10:30 AM",
    price: "$65.00",
    status: "Completed",
    vehicle: null,
  },
  {
    id: "3",
    type: "Deliver",
    destination: "Brooklyn Navy Yard",
    date: "20 Feb • 04:45 PM",
    price: "$18.30",
    status: "Cancelled",
    vehicle: "Van",
  },
  {
    id: "4",
    type: "Valet",
    destination: "The Plaza Hotel",
    date: "18 Feb • 08:00 PM",
    price: "$35.00",
    status: "Completed",
    vehicle: null,
  },
  {
    id: "5",
    type: "Deliver",
    destination: "Hudson Yards",
    date: "15 Feb • 11:20 AM",
    price: "$14.75",
    status: "Cancelled",
    vehicle: "Scooter",
  },
];

const statusColor: Record<string, string> = {
  Completed: "text-green-500",
  Cancelled: "text-red-400",
  Pending: "text-yellow-500",
};

export const ActivityPanel = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<Tab>("pending");
  const navigate = useNavigate();

  const rides = tab === "pending" ? mockPendingRides : mockPastRides;

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Booking
      </button>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(["pending", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              tab === t
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "pending" ? "Pending" : "Past"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {rides.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {tab === "pending" ? "No Scheduled Rides" : "No Past Activity"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                {tab === "pending"
                  ? "You don't have any upcoming scheduled rides."
                  : "You haven't completed any rides yet."}
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
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">{ride.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{ride.date}</span>
                        {ride.vehicle && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span>{ride.vehicle}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-semibold text-foreground">{ride.price}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-xs font-medium text-muted-foreground">{ride.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-xs font-semibold ${statusColor[ride.status] || "text-muted-foreground"}`}>
                        {ride.status}
                      </span>
                      {ride.status === "Cancelled" && (
                        <button className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors border border-border rounded-full px-3 py-1">
                          <RotateCcw className="w-3 h-3" />
                          Rebook
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
