import React, { useMemo } from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickupCoords: LatLng | null;
  dropoffCoords: LatLng | null;
}

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords }) => {
  const { center, zoom } = useMemo(() => {
    if (pickupCoords && dropoffCoords) {
      return {
        center: {
          lat: (pickupCoords.lat + dropoffCoords.lat) / 2,
          lng: (pickupCoords.lng + dropoffCoords.lng) / 2,
        },
        zoom: 12,
      };
    }
    return {
      center: pickupCoords || dropoffCoords || { lat: 34.0522, lng: -118.2437 },
      zoom: 14,
    };
  }, [pickupCoords, dropoffCoords]);

  // Calculate bounding box for the embed
  const bbox = useMemo(() => {
    const spread = zoom === 12 ? 0.06 : 0.03;
    return {
      minLng: center.lng - spread * 1.4,
      minLat: center.lat - spread,
      maxLng: center.lng + spread * 1.4,
      maxLat: center.lat + spread,
    };
  }, [center, zoom]);

  // Build marker layer string for pickup & dropoff
  const markerLayer = useMemo(() => {
    const markers: string[] = [];
    if (pickupCoords) {
      markers.push(`${pickupCoords.lat},${pickupCoords.lng}`);
    }
    if (dropoffCoords) {
      markers.push(`${dropoffCoords.lat},${dropoffCoords.lng}`);
    }
    return markers.join("|");
  }, [pickupCoords, dropoffCoords]);

  return (
    <div className="w-full h-full relative bg-[#e8e4df]">
      {/* Full-bleed OSM map */}
      <iframe
        title="Booking Map"
        className="absolute inset-0 w-full h-full border-0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik&marker=${center.lat},${center.lng}`}
        loading="lazy"
      />

      {/* Pickup marker overlay */}
      {pickupCoords && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ top: "40%", left: pickupCoords && dropoffCoords ? "35%" : "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-foreground border-[3px] border-background shadow-lg" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/20 rounded-full blur-[2px]" />
          </div>
        </div>
      )}

      {/* Dropoff marker overlay */}
      {dropoffCoords && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ top: "40%", left: pickupCoords && dropoffCoords ? "65%" : "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            <div className="w-5 h-5 bg-foreground rounded-sm shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-background rounded-[1px]" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground/20 rounded-full blur-[2px]" />
          </div>
        </div>
      )}

      {/* Polyline overlay between markers */}
      {pickupCoords && dropoffCoords && (
        <svg
          className="absolute inset-0 w-full h-full z-[5] pointer-events-none"
          preserveAspectRatio="none"
        >
          <line
            x1="35%"
            y1="40%"
            x2="65%"
            y2="40%"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
            strokeDasharray="8 4"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      )}

      {/* Zoom controls (bottom-right, matching reference) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-0.5">
        <button className="w-10 h-10 bg-background border border-border rounded-t-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">
          +
        </button>
        <button className="w-10 h-10 bg-background border border-border rounded-b-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">
          −
        </button>
      </div>

      {/* Test mode badge */}
      <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground px-2 py-1 rounded-md border border-border">
        Test Mode
      </div>
    </div>
  );
};

export default BookingMap;
