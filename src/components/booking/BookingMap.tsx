import React, { useMemo } from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickupCoords: LatLng | null;
  dropoffCoords: LatLng | null;
  pickupAddress?: string;
  dropoffAddress?: string;
}

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords, pickupAddress, dropoffAddress }) => {
  const { center, bbox } = useMemo(() => {
    const c = pickupCoords && dropoffCoords
      ? { lat: (pickupCoords.lat + dropoffCoords.lat) / 2, lng: (pickupCoords.lng + dropoffCoords.lng) / 2 }
      : pickupCoords || dropoffCoords || { lat: 34.0522, lng: -118.2437 };
    const spread = pickupCoords && dropoffCoords ? 0.07 : 0.035;
    return {
      center: c,
      bbox: { minLng: c.lng - spread * 1.5, minLat: c.lat - spread, maxLng: c.lng + spread * 1.5, maxLat: c.lat + spread },
    };
  }, [pickupCoords, dropoffCoords]);

  // Estimate drive time (~2 min per mile in city)
  const estimate = useMemo(() => {
    if (!pickupCoords || !dropoffCoords) return null;
    const miles = Math.sqrt(
      Math.pow((dropoffCoords.lat - pickupCoords.lat) * 69, 2) +
      Math.pow((dropoffCoords.lng - pickupCoords.lng) * 54.6, 2)
    );
    const mins = Math.max(1, Math.round(miles * 2.5));
    return { miles: miles.toFixed(1), mins };
  }, [pickupCoords, dropoffCoords]);

  // Marker positions as percentages on the map
  const markerPositions = useMemo(() => {
    if (!pickupCoords && !dropoffCoords) return { pickup: null, dropoff: null };
    const toPercent = (coord: LatLng) => ({
      x: ((coord.lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * 100,
      y: ((bbox.maxLat - coord.lat) / (bbox.maxLat - bbox.minLat)) * 100,
    });
    return {
      pickup: pickupCoords ? toPercent(pickupCoords) : null,
      dropoff: dropoffCoords ? toPercent(dropoffCoords) : null,
    };
  }, [pickupCoords, dropoffCoords, bbox]);

  const truncate = (s: string, max = 28) => s.length > max ? s.slice(0, max) + "…" : s;

  return (
    <div className="w-full h-full relative bg-[#e8e4df] overflow-hidden">
      {/* Full-bleed OSM map */}
      <iframe
        title="Booking Map"
        className="absolute inset-0 w-full h-full border-0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}&layer=mapnik`}
        loading="lazy"
      />

      {/* SVG polyline between pickup and dropoff */}
      {markerPositions.pickup && markerPositions.dropoff && (
        <svg className="absolute inset-0 w-full h-full z-[5] pointer-events-none">
          {/* Route polyline - thick black like reference */}
          <path
            d={`M ${markerPositions.pickup.x}% ${markerPositions.pickup.y}% 
                C ${markerPositions.pickup.x + 5}% ${markerPositions.pickup.y - 15}%, 
                  ${markerPositions.dropoff.x - 5}% ${markerPositions.dropoff.y + 15}%, 
                  ${markerPositions.dropoff.x}% ${markerPositions.dropoff.y}%`}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Pickup marker + address bubble */}
      {markerPositions.pickup && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ left: `${markerPositions.pickup.x}%`, top: `${markerPositions.pickup.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {/* Marker circle */}
          <div className="w-4 h-4 rounded-full bg-foreground border-[3px] border-background shadow-lg" />
          {/* Address bubble */}
          {pickupAddress && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
              <div className="bg-background border border-border shadow-lg rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground leading-tight max-w-[200px] truncate">
                  From {truncate(pickupAddress)}
                </span>
                <span className="text-muted-foreground text-xs">›</span>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-background" />
            </div>
          )}
        </div>
      )}

      {/* Dropoff marker + address bubble */}
      {markerPositions.dropoff && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{ left: `${markerPositions.dropoff.x}%`, top: `${markerPositions.dropoff.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {/* Marker square */}
          <div className="w-4 h-4 bg-foreground shadow-lg" />
          {/* Address bubble */}
          {dropoffAddress && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">
              <div className="bg-background border border-border shadow-lg rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground leading-tight max-w-[200px] truncate">
                  To {truncate(dropoffAddress)}
                </span>
                <span className="text-muted-foreground text-xs">›</span>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-background" />
            </div>
          )}
        </div>
      )}

      {/* Time estimate badge (centered between markers) */}
      {estimate && markerPositions.pickup && markerPositions.dropoff && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            left: `${(markerPositions.pickup.x + markerPositions.dropoff.x) / 2}%`,
            top: `${(markerPositions.pickup.y + markerPositions.dropoff.y) / 2}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="bg-foreground text-background px-3 py-1.5 rounded-md shadow-lg">
            <span className="text-sm font-bold">{estimate.mins}</span>
            <span className="text-xs font-medium ml-0.5">min</span>
          </div>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-0.5">
        <button className="w-10 h-10 bg-background border border-border rounded-t-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">+</button>
        <button className="w-10 h-10 bg-background border border-border rounded-b-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">−</button>
      </div>

      {/* Test mode badge */}
      <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground px-2 py-1 rounded-md border border-border">
        Test Mode
      </div>
    </div>
  );
};

export default BookingMap;
