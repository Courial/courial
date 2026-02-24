/// <reference types="google.maps" />
import React, { useRef, useEffect, useState, useMemo } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDxJoLqE0Whu0VmkQv4zVpcVim4UZ3e_c4";

interface LatLng {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickupCoords: LatLng | null;
  dropoffCoords: LatLng | null;
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupPlaceName?: string | null;
  dropoffPlaceName?: string | null;
  bookingState?: "input" | "loading" | "active";
  vehicleType?: string | null;
}

function buildInfoContent(address: string, placeName?: string | null): string {
  const style = 'font-size:12.5px;font-weight:400;color:rgba(0,0,0,0.75);padding:6px 4px;line-height:1.4;';
  if (placeName) {
    // Remove country from address for second line
    let clean = address.replace(/,?\s*(USA|US|United States)\s*$/i, '').trim();
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    // Show place name on line 1, city/state on line 2
    const line2 = parts.length > 1 ? parts.slice(1).join(', ') : '';
    return line2
      ? `<div style="${style}"><strong>${placeName}</strong><br/>${line2}</div>`
      : `<div style="${style}"><strong>${placeName}</strong></div>`;
  }
  // Remove country
  let clean = address.replace(/,?\s*(USA|US|United States)\s*$/i, '').trim();
  const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
  let line1 = parts[0] || '';
  let line2 = parts.slice(1).join(', ');
  return line2
    ? `<div style="${style}">${line1}<br/>${line2}</div>`
    : `<div style="${style}">${line1}</div>`;
}

// Vehicle top-down icon URLs mapped by type
const VEHICLE_ICON_MAP: Record<string, string> = {
  walker: "/map-icons/walker-top.png",
  scooter: "/map-icons/bike-top.png",
  car: "/map-icons/car-top.png",
  van: "/map-icons/car-top.png",
  truck: "/map-icons/truck-top.png",
};

function getVehicleIconUrl(vehicleType?: string | null): string {
  return VEHICLE_ICON_MAP[vehicleType || "car"] || VEHICLE_ICON_MAP.car;
}

function getVehicleIconSize(vehicleType?: string | null): { w: number; h: number } {
  switch (vehicleType) {
    case "walker": return { w: 32, h: 28 };
    case "scooter": return { w: 24, h: 40 };
    case "truck": return { w: 28, h: 44 };
    default: return { w: 28, h: 40 };
  }
}
// Calculate bearing (degrees) between two lat/lng points
function getBearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(toLat);
  const x = Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Pre-load an image and create rotated versions via canvas
const rotatedIconCache = new Map<string, string>();

function createRotatedIcon(url: string, angleDeg: number, w: number, h: number): Promise<string> {
  // Round angle to nearest 5 degrees for caching
  const roundedAngle = Math.round(angleDeg / 5) * 5;
  const cacheKey = `${url}_${roundedAngle}_${w}_${h}`;
  if (rotatedIconCache.has(cacheKey)) return Promise.resolve(rotatedIconCache.get(cacheKey)!);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxDim = Math.ceil(Math.sqrt(w * w + h * h));
      const canvas = document.createElement("canvas");
      canvas.width = maxDim;
      canvas.height = maxDim;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(maxDim / 2, maxDim / 2);
      ctx.rotate((roundedAngle * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      const dataUrl = canvas.toDataURL("image/png");
      rotatedIconCache.set(cacheKey, dataUrl);
      resolve(dataUrl);
    };
    img.onerror = () => resolve(url); // fallback to unrotated
    img.src = url;
  });
}

let googleMapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;
  if ((window as any).google?.maps) {
    googleMapsPromise = Promise.resolve();
    return googleMapsPromise;
  }
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

// Generate random offset positions around a center point
function generateRandomPositions(center: LatLng, count: number, radiusKm: number): LatLng[] {
  const positions: LatLng[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
    const dist = radiusKm * (0.6 + Math.random() * 0.4);
    const latOffset = (dist / 111) * Math.cos(angle);
    const lngOffset = (dist / (111 * Math.cos((center.lat * Math.PI) / 180))) * Math.sin(angle);
    positions.push({ lat: center.lat + latOffset, lng: center.lng + lngOffset });
  }
  return positions;
}

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords, pickupAddress, dropoffAddress, pickupPlaceName, dropoffPlaceName, bookingState = "input", vehicleType }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const carMarkersRef = useRef<google.maps.Marker[]>([]);
  const carAnimationRef = useRef<number | null>(null);
  const trackingMarkerRef = useRef<google.maps.Marker | null>(null);
  const trackingAnimationRef = useRef<number | null>(null);
  
  const [ready, setReady] = useState(false);

  const defaultCenter = useMemo(() => ({ lat: 34.0522, lng: -118.2437 }), []);

  // Load Google Maps
  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true)).catch(console.error);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!ready || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });
  }, [ready, defaultCenter]);

  // Update markers and route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear existing info windows
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current = [];

    // Clear existing directions
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }

    const bounds = new google.maps.LatLngBounds();

    if (pickupCoords) {
      const marker = new google.maps.Marker({
        position: pickupCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        },
        title: pickupAddress || "Pickup",
      });
      markersRef.current.push(marker);
      bounds.extend(pickupCoords);

      if (pickupAddress) {
        const infoWindow = new google.maps.InfoWindow({
          content: buildInfoContent(pickupAddress, pickupPlaceName),
        });
        infoWindow.open(map, marker);
        infoWindowsRef.current.push(infoWindow);
      }
    }

    if (dropoffCoords) {
      const marker = new google.maps.Marker({
        position: dropoffCoords,
        map,
        icon: {
          path: "M -6 -6 L 6 -6 L 6 6 L -6 6 Z",
          scale: 1.24,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        },
        title: dropoffAddress || "Dropoff",
      });
      markersRef.current.push(marker);
      bounds.extend(dropoffCoords);

      if (dropoffAddress) {
        const infoWindow = new google.maps.InfoWindow({
          content: buildInfoContent(dropoffAddress, dropoffPlaceName),
        });
        infoWindow.open(map, marker);
        infoWindowsRef.current.push(infoWindow);
      }
    }

    // Fit bounds
    if (pickupCoords && dropoffCoords) {
      map.fitBounds(bounds, { top: 80, bottom: 40, left: 40, right: 40 });

      // Draw route using Directions API
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#000000",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      directionsRendererRef.current = directionsRenderer;

      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    } else if (pickupCoords || dropoffCoords) {
      const coords = pickupCoords || dropoffCoords!;
      map.setCenter(coords);
      map.setZoom(14);
    }
  }, [pickupCoords, dropoffCoords, pickupAddress, dropoffAddress, pickupPlaceName, dropoffPlaceName]);

  // --- Loading phase: multiple cars converge toward pickup ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickupCoords) return;

    // Cleanup function
    const cleanup = () => {
      if (carAnimationRef.current) {
        cancelAnimationFrame(carAnimationRef.current);
        carAnimationRef.current = null;
      }
      carMarkersRef.current.forEach((m) => m.setMap(null));
      carMarkersRef.current = [];
    };

    if (bookingState !== "loading") {
      cleanup();
      return;
    }

    // Create 4 car markers at random positions around pickup, rotated toward pickup
    const startPositions = generateRandomPositions(pickupCoords, 4, 3);
    const iconUrl = getVehicleIconUrl(vehicleType);
    const iconSize = getVehicleIconSize(vehicleType);

    // Pre-create rotated icons for each car pointing toward pickup
    const rotatedIconPromises = startPositions.map((pos) => {
      const bearing = getBearing(pos, pickupCoords);
      return createRotatedIcon(iconUrl, bearing, iconSize.w, iconSize.h);
    });

    Promise.all(rotatedIconPromises).then((rotatedUrls) => {
      const maxDim = Math.ceil(Math.sqrt(iconSize.w * iconSize.w + iconSize.h * iconSize.h));
      const cars = startPositions.map((pos, i) => {
        const marker = new google.maps.Marker({
          position: pos,
          map,
          icon: {
            url: rotatedUrls[i],
            scaledSize: new google.maps.Size(maxDim, maxDim),
            anchor: new google.maps.Point(maxDim / 2, maxDim / 2),
          },
          zIndex: 5,
        });
        return marker;
      });
      carMarkersRef.current = cars;

      // Animate cars moving toward pickup
      const startTime = performance.now();
      const duration = 3000;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        cars.forEach((car, i) => {
          const start = startPositions[i];
          const lat = start.lat + (pickupCoords.lat - start.lat) * eased;
          const lng = start.lng + (pickupCoords.lng - start.lng) * eased;
          car.setPosition({ lat, lng });
        });

        if (progress < 1) {
          carAnimationRef.current = requestAnimationFrame(animate);
        }
      };

      carAnimationRef.current = requestAnimationFrame(animate);
    });

    return cleanup;
  }, [bookingState, pickupCoords]);

  // --- Active phase: single car moves along route toward dropoff + pulsing dot ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickupCoords || !dropoffCoords) return;

    const cleanup = () => {
      if (trackingAnimationRef.current) {
        cancelAnimationFrame(trackingAnimationRef.current);
        trackingAnimationRef.current = null;
      }
      if (trackingMarkerRef.current) {
        trackingMarkerRef.current.setMap(null);
        trackingMarkerRef.current = null;
      }
    };

    if (bookingState !== "active") {
      cleanup();
      return;
    }

    // Get route path via Directions API
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: pickupCoords,
        destination: dropoffCoords,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== "OK" || !result) return;

        const path = result.routes[0].overview_path;


        // Create tracking car marker (will be updated with rotated icon)
        const iconUrl = getVehicleIconUrl(vehicleType);
        const iconSize = getVehicleIconSize(vehicleType);
        const maxDim = Math.ceil(Math.sqrt(iconSize.w * iconSize.w + iconSize.h * iconSize.h));

        const carMarker = new google.maps.Marker({
          position: pickupCoords,
          map,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(maxDim, maxDim),
            anchor: new google.maps.Point(maxDim / 2, maxDim / 2),
          },
          zIndex: 10,
        });
        trackingMarkerRef.current = carMarker;

        // Animate along route path — slow loop
        const totalDuration = 20000;
        const startTime = performance.now();
        let lastBearing = -999;

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = (elapsed % totalDuration) / totalDuration;
          
          const totalPoints = path.length;
          const exactIndex = progress * (totalPoints - 1);
          const idx = Math.floor(exactIndex);
          const frac = exactIndex - idx;
          
          const from = path[Math.min(idx, totalPoints - 1)];
          const to = path[Math.min(idx + 1, totalPoints - 1)];
          
          const lat = from.lat() + (to.lat() - from.lat()) * frac;
          const lng = from.lng() + (to.lng() - from.lng()) * frac;
          
          const pos = { lat, lng };
          carMarker.setPosition(pos);

          // Rotate icon to match bearing along path
          const bearing = getBearing(
            { lat: from.lat(), lng: from.lng() },
            { lat: to.lat(), lng: to.lng() }
          );
          const roundedBearing = Math.round(bearing / 5) * 5;
          if (roundedBearing !== lastBearing) {
            lastBearing = roundedBearing;
            createRotatedIcon(iconUrl, bearing, iconSize.w, iconSize.h).then((rotatedUrl) => {
              carMarker.setIcon({
                url: rotatedUrl,
                scaledSize: new google.maps.Size(maxDim, maxDim),
                anchor: new google.maps.Point(maxDim / 2, maxDim / 2),
              });
            });
          }


          trackingAnimationRef.current = requestAnimationFrame(animate);
        };

        trackingAnimationRef.current = requestAnimationFrame(animate);
      }
    );

    return cleanup;
  }, [bookingState, pickupCoords, dropoffCoords]);

  if (!ready) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .gm-style-iw { background: white !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; border: none !important; border-radius: 8px !important; }
        .gm-style-iw-d { overflow: hidden !important; }
        button.gm-ui-hover-effect { display: none !important; }
        .gm-style-iw-chr { display: none !important; }
        .gm-style-iw-tc { display: none !important; }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
};

export default BookingMap;
