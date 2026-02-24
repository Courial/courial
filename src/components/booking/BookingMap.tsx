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
  const center = useMemo(() => {
    if (pickupCoords && dropoffCoords) {
      return { lat: (pickupCoords.lat + dropoffCoords.lat) / 2, lng: (pickupCoords.lng + dropoffCoords.lng) / 2 };
    }
    return pickupCoords || dropoffCoords || { lat: 34.0522, lng: -118.2437 };
  }, [pickupCoords, dropoffCoords]);

  const spread = pickupCoords && dropoffCoords ? 0.08 : 0.04;
  const bbox = `${center.lng - spread * 1.5},${center.lat - spread},${center.lng + spread * 1.5},${center.lat + spread}`;

  const estimate = useMemo(() => {
    if (!pickupCoords || !dropoffCoords) return null;
    const miles = Math.sqrt(
      Math.pow((dropoffCoords.lat - pickupCoords.lat) * 69, 2) +
      Math.pow((dropoffCoords.lng - pickupCoords.lng) * 54.6, 2)
    );
    return { miles: miles.toFixed(1), mins: Math.max(1, Math.round(miles * 2.5)) };
  }, [pickupCoords, dropoffCoords]);

  const truncate = (s: string, max = 26) => (s.length > max ? s.slice(0, max) + "…" : s);

  const hasBoth = !!pickupCoords && !!dropoffCoords;
  const hasOne = !!pickupCoords || !!dropoffCoords;

  return (
    <div className="w-full h-full relative bg-[#e8e4df] overflow-hidden">
      {/* Full-bleed OSM map */}
      <iframe
        title="Booking Map"
        className="absolute inset-0 w-full h-full border-0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
        loading="lazy"
      />

      {/* Route overlay layer — uses fixed visual positions for test mode */}
      {hasBoth && (
        <>
          {/* Polyline */}
          <svg className="absolute inset-0 w-full h-full z-[6] pointer-events-none">
            <path
              d="M 25% 58% C 30% 35%, 60% 35%, 72% 52%"
              fill="none"
              stroke="black"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Pickup marker + bubble */}
          <div className="absolute z-10 pointer-events-none" style={{ left: "25%", top: "58%", transform: "translate(-50%, -50%)" }}>
            <div className="w-[18px] h-[18px] rounded-full bg-foreground border-[3.5px] border-background shadow-xl" />
            {pickupAddress && (
              <div className="absolute bottom-full left-0 mb-3 whitespace-nowrap">
                <div className="bg-background shadow-xl rounded-lg px-3.5 py-2.5 flex items-center gap-2 border border-border/50">
                  <span className="text-[13px] font-semibold text-foreground leading-tight">
                    From {truncate(pickupAddress)}
                  </span>
                  <span className="text-muted-foreground/60 text-sm">›</span>
                </div>
                <div className="absolute top-full left-4 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-background drop-shadow-sm" />
              </div>
            )}
          </div>

          {/* Time badge */}
          {estimate && (
            <div className="absolute z-10 pointer-events-none" style={{ left: "48%", top: "38%", transform: "translate(-50%, -50%)" }}>
              <div className="bg-foreground text-background px-3 py-2 rounded-lg shadow-xl">
                <span className="text-base font-bold">{estimate.mins}</span>
                <span className="text-xs font-semibold ml-1">min</span>
              </div>
            </div>
          )}

          {/* Dropoff marker + bubble */}
          <div className="absolute z-10 pointer-events-none" style={{ left: "72%", top: "52%", transform: "translate(-50%, -50%)" }}>
            <div className="w-[16px] h-[16px] bg-foreground shadow-xl" />
            {dropoffAddress && (
              <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap">
                <div className="bg-background shadow-xl rounded-lg px-3.5 py-2.5 flex items-center gap-2 border border-border/50">
                  <span className="text-[13px] font-semibold text-foreground leading-tight">
                    To {truncate(dropoffAddress)}
                  </span>
                  <span className="text-muted-foreground/60 text-sm">›</span>
                </div>
                <div className="absolute top-full right-4 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-background drop-shadow-sm" />
              </div>
            )}
          </div>
        </>
      )}

      {/* Single marker (only one address entered) */}
      {!hasBoth && hasOne && (
        <div className="absolute z-10 pointer-events-none" style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
          <div className="w-[18px] h-[18px] rounded-full bg-foreground border-[3.5px] border-background shadow-xl" />
          {(pickupAddress || dropoffAddress) && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 whitespace-nowrap">
              <div className="bg-background shadow-xl rounded-lg px-3.5 py-2.5 flex items-center gap-2 border border-border/50">
                <span className="text-[13px] font-semibold text-foreground leading-tight">
                  {pickupAddress ? `From ${truncate(pickupAddress)}` : `To ${truncate(dropoffAddress!)}`}
                </span>
                <span className="text-muted-foreground/60 text-sm">›</span>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-l-transparent border-r-transparent border-t-background drop-shadow-sm" />
            </div>
          )}
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-0.5">
        <button className="w-10 h-10 bg-background border border-border rounded-t-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">+</button>
        <button className="w-10 h-10 bg-background border border-border rounded-b-lg shadow-md flex items-center justify-center text-foreground hover:bg-muted transition-colors text-lg font-light">−</button>
      </div>

      <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm text-[10px] text-muted-foreground px-2 py-1 rounded-md border border-border">
        Test Mode
      </div>
    </div>
  );
};

export default BookingMap;
