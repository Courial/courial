import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Package, RotateCcw, Calendar, MapPin, ArrowLeft, Box, ConciergeBell, CarFront, ParkingCircle, Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tab = "pending" | "past";

// Mock data for demo — will be replaced with real data
const mockPendingRides: any[] = [];

const mockPastRides = [
  {
    id: "1",
    type: "Deliver",
    destination: "350 Fifth Avenue, New York",
    origin: "200 Park Avenue, New York",
    date: "26 Feb • 02:15 PM",
    price: "$21.59",
    status: "Completed",
    vehicle: "Car",
    scheduled: false,
  },
  {
    id: "2",
    type: "Concierge",
    destination: "SoHo House NYC",
    origin: "Central Park West, New York",
    date: "24 Feb • 10:30 AM",
    price: "$65.00",
    status: "Completed",
    vehicle: null,
    scheduled: true,
  },
  {
    id: "3",
    type: "Deliver",
    destination: "Brooklyn Navy Yard",
    origin: "Wall Street, New York",
    date: "20 Feb • 04:45 PM",
    price: "$18.30",
    status: "Cancelled",
    vehicle: "Van",
    scheduled: false,
  },
  {
    id: "4",
    type: "Valet",
    destination: "The Plaza Hotel",
    origin: "Times Square, New York",
    date: "18 Feb • 08:00 PM",
    price: "$35.00",
    status: "Completed",
    vehicle: null,
    scheduled: true,
  },
  {
    id: "5",
    type: "Deliver",
    destination: "Hudson Yards",
    origin: "Chelsea Market, New York",
    date: "15 Feb • 11:20 AM",
    price: "$14.75",
    status: "Cancelled",
    vehicle: "Scooter",
    scheduled: false,
  },
];

const serviceIcon: Record<string, typeof Box> = {
  Deliver: Box,
  Concierge: ConciergeBell,
  Chauffeur: CarFront,
  Valet: ParkingCircle,
};

const statusColor: Record<string, string> = {
  Completed: "text-primary",
  Cancelled: "text-red-400",
  Pending: "text-yellow-500",
};

const statusBadgeBg: Record<string, string> = {
  Completed: "text-green-700",
  Cancelled: "text-red-700",
  Pending: "text-yellow-500",
};

export const ActivityPanel = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<Tab>("pending");
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const navigate = useNavigate();

  const rides = tab === "pending" ? mockPendingRides : mockPastRides;

  if (selectedRide) {
    return <RideDetail ride={selectedRide} onBack={() => setSelectedRide(null)} />;
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <h2 className="text-lg font-bold text-primary mb-6">ACTIVITY</h2>

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
              {rides.map((ride) => {
                const Icon = serviceIcon[ride.type] || Box;
                return (
                  <div
                    key={ride.id}
                    onClick={() => setSelectedRide(ride)}
                    className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {/* Service icon box */}
                      <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground truncate">{ride.destination}</span>
                          <span className={`text-[11px] font-semibold shrink-0 ${statusBadgeBg[ride.status] || "text-muted-foreground"}`}>
                            {ride.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {ride.scheduled ? (
                            <Calendar className="w-3 h-3 shrink-0 text-muted-foreground" />
                          ) : (
                            <Zap className="w-3 h-3 shrink-0 text-muted-foreground" />
                          )}
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
                          {ride.status === "Cancelled" && (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Detail View ── */
const RideDetail = ({ ride, onBack }: { ride: any; onBack: () => void }) => {
  const Icon = serviceIcon[ride.type] || Box;

  return (
    <div className="h-full flex flex-col">
      {/* Map placeholder */}
      <div className="relative w-full h-52 bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-foreground/5 flex items-center justify-center">
          <MapPin className="w-10 h-10 text-muted-foreground/30" />
        </div>
        {/* Back button overlay */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background transition-colors z-10"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Details */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground">{ride.type}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {ride.scheduled ? "Scheduled Ride" : "On-Demand"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
        </div>

        {/* Price & vehicle */}
        <div className="flex items-center gap-3 text-sm text-foreground">
          <span className="font-bold">{ride.price}</span>
          {ride.scheduled ? (
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          {ride.vehicle && <span className="text-muted-foreground">{ride.vehicle}</span>}
        </div>

        {/* Date */}
        <p className="text-sm text-muted-foreground">{ride.date}</p>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${statusBadgeBg[ride.status] || "text-muted-foreground"}`}>
            {ride.status}
          </span>
        </div>

        {/* Addresses */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Pickup</p>
              <p className="text-sm font-medium text-foreground">{ride.origin || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Drop-off</p>
              <p className="text-sm font-medium text-foreground">{ride.destination}</p>
            </div>
          </div>
        </div>

        {/* Rebook if cancelled */}
        {ride.status === "Cancelled" && (
          <button className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-background bg-foreground rounded-lg h-10 hover:bg-foreground/90 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Rebook
          </button>
        )}
      </div>
    </div>
  );
};
