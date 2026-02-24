import React from "react";

interface LatLng {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickupCoords: LatLng | null;
  dropoffCoords: LatLng | null;
}

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords }) => {
  // Build a static Google Maps image URL with markers and a path
  const buildStaticMapUrl = () => {
    const base = "https://maps.googleapis.com/maps/api/staticmap";
    const params = new URLSearchParams({
      size: "800x600",
      scale: "2",
      maptype: "roadmap",
      style: "feature:poi|visibility:off",
      key: "AIzaSyABwhqI6wMVFEgPjyGTjB8XHUHTsVBiG4o",
    });

    if (pickupCoords) {
      params.append("markers", `color:black|label:P|${pickupCoords.lat},${pickupCoords.lng}`);
    }
    if (dropoffCoords) {
      params.append("markers", `color:gray|label:D|${dropoffCoords.lat},${dropoffCoords.lng}`);
    }
    if (pickupCoords && dropoffCoords) {
      params.append(
        "path",
        `color:0x000000ff|weight:4|${pickupCoords.lat},${pickupCoords.lng}|${dropoffCoords.lat},${dropoffCoords.lng}`
      );
    }

    return `${base}?${params.toString()}`;
  };

  // Use an embedded iframe with OpenStreetMap as fallback (no API key needed)
  const center = pickupCoords || dropoffCoords || { lat: 34.0522, lng: -118.2437 };
  const zoom = pickupCoords && dropoffCoords ? 12 : 13;

  return (
    <div className="w-full h-full relative bg-muted overflow-hidden">
      {/* OSM tile-based map via iframe */}
      <iframe
        title="Booking Map"
        className="w-full h-full border-0"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.08},${center.lat - 0.05},${center.lng + 0.08},${center.lat + 0.05}&layer=mapnik`}
      />

      {/* Overlay with route info */}
      <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg">
        <div className="flex items-center gap-3">
          {pickupCoords && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-[2.5px] border-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {pickupCoords.lat.toFixed(4)}, {pickupCoords.lng.toFixed(4)}
              </span>
            </div>
          )}
          {pickupCoords && dropoffCoords && (
            <div className="flex-1 border-t border-dashed border-muted-foreground/40 mx-1" />
          )}
          {dropoffCoords && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {dropoffCoords.lat.toFixed(4)}, {dropoffCoords.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
        {pickupCoords && dropoffCoords && (
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              ~{(
                Math.sqrt(
                  Math.pow((dropoffCoords.lat - pickupCoords.lat) * 69, 2) +
                  Math.pow((dropoffCoords.lng - pickupCoords.lng) * 54.6, 2)
                )
              ).toFixed(1)} mi estimated
            </span>
            <span className="text-xs text-muted-foreground">Test Mode</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingMap;
