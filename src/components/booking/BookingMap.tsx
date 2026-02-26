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
  stopCoords?: LatLng | null;
  pickupAddress?: string;
  dropoffAddress?: string;
  stopAddress?: string;
  pickupPlaceName?: string | null;
  dropoffPlaceName?: string | null;
  stopPlaceName?: string | null;
  bookingState?: "input" | "loading" | "active";
  vehicleType?: string | null;
}

function buildInfoContent(address: string, placeName?: string | null): string {
  const style = "font-family:'Avenir','Avenir Next','Nunito Sans',system-ui,sans-serif;font-size:12.5px;font-weight:400;color:rgba(0,0,0,0.75);padding:6px 10px 6px 4px;line-height:1.4;";
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
  van: "/map-icons/van-top.png",
  truck: "/map-icons/truck-top.png",
};

function getVehicleIconUrl(vehicleType?: string | null): string {
  return VEHICLE_ICON_MAP[vehicleType || "car"] || VEHICLE_ICON_MAP.car;
}

// Target max dimension for vehicle icons on map
function getVehicleIconMaxDim(vehicleType?: string | null): number {
  switch (vehicleType) {
    case "walker": return 36;
    case "scooter": return 40;
    case "truck": return 44;
    default: return 40; // car, van
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

function createRotatedIcon(url: string, angleDeg: number, maxDim: number): Promise<string> {
  const roundedAngle = Math.round(angleDeg / 5) * 5;
  const cacheKey = `${url}_${roundedAngle}_${maxDim}`;
  if (rotatedIconCache.has(cacheKey)) return Promise.resolve(rotatedIconCache.get(cacheKey)!);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Scale preserving aspect ratio so largest side = maxDim
      const scale = maxDim / Math.max(img.naturalWidth, img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvasSize = Math.ceil(Math.sqrt(w * w + h * h));
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvasSize / 2, canvasSize / 2);
      ctx.rotate((roundedAngle * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      const dataUrl = canvas.toDataURL("image/png");
      rotatedIconCache.set(cacheKey, dataUrl);
      resolve(dataUrl);
    };
    img.onerror = () => resolve(url);
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

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords, stopCoords, pickupAddress, dropoffAddress, stopAddress, pickupPlaceName, dropoffPlaceName, stopPlaceName, bookingState = "input", vehicleType }) => {
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

    // Add stop marker (blue octagon) if stopCoords provided
    if (stopCoords) {
      // Octagon path for stop sign shape
      const octPath = "M -4 -10 L 4 -10 L 10 -4 L 10 4 L 4 10 L -4 10 L -10 4 L -10 -4 Z";
      const stopMarker = new google.maps.Marker({
        position: stopCoords,
        map,
        icon: {
          path: octPath,
          scale: 0.85,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1,
        },
        title: stopAddress || "Stop",
      });
      markersRef.current.push(stopMarker);
      bounds.extend(stopCoords);

      if (stopAddress) {
        const infoWindow = new google.maps.InfoWindow({
          content: buildInfoContent(stopAddress, stopPlaceName),
        });
        infoWindow.open(map, stopMarker);
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

      const waypoints = stopCoords ? [{ location: stopCoords, stopover: true }] : [];

      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          waypoints,
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
  }, [pickupCoords, dropoffCoords, stopCoords, pickupAddress, dropoffAddress, stopAddress, pickupPlaceName, dropoffPlaceName, stopPlaceName]);

  // --- Loading phase: multiple cars converge toward pickup along real roads ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickupCoords) return;

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

    // Create several car markers scattered in a ~30 mile (48 km) radius, moving toward pickup along roads
    const startPositions = generateRandomPositions(pickupCoords, 7, 48);
    const iconUrl = getVehicleIconUrl(vehicleType);
    const iconMaxDim = getVehicleIconMaxDim(vehicleType);
    const canvasSize = Math.ceil(Math.sqrt(iconMaxDim * iconMaxDim * 2));

    // Assign each car a random speed factor (staggered pacing)
    const speedFactors = startPositions.map(() => 0.5 + Math.random() * 0.7); // 0.5x to 1.2x

    // Create markers immediately so they appear instantly
    const cars = startPositions.map((pos) => {
      const marker = new google.maps.Marker({
        position: pos,
        map,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(canvasSize, canvasSize),
          anchor: new google.maps.Point(canvasSize / 2, canvasSize / 2),
        },
        zIndex: 5,
      });
      return marker;
    });
    carMarkersRef.current = cars;

    // Start animation immediately with straight-line fallback, swap to road routes when ready
    const straightLinePaths = startPositions.map((pos) => [
      new google.maps.LatLng(pos.lat, pos.lng),
      new google.maps.LatLng(pickupCoords.lat, pickupCoords.lng),
    ]);
    const resolvedRoutes: google.maps.LatLng[][] = [...straightLinePaths];

    // Fetch real road routes in background
    const directionsService = new google.maps.DirectionsService();
    startPositions.forEach((pos, i) => {
      directionsService.route(
        {
          origin: pos,
          destination: pickupCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            resolvedRoutes[i] = result.routes[0].overview_path;
          }
        }
      );
    });

    // Animate cars along their routes — 30s duration, staggered speeds
    const duration = 30000;
    const startTime = performance.now();
    const lastBearings = new Array(cars.length).fill(-999);

    const animate = (now: number) => {
      const elapsed = now - startTime;

      cars.forEach((car, i) => {
        const path = resolvedRoutes[i];
        const rawProgress = (elapsed / duration) * speedFactors[i];
        const progress = Math.min(rawProgress, 1);
        const eased = 1 - Math.pow(1 - progress, 2);

        const totalPoints = path.length;
        const exactIndex = eased * (totalPoints - 1);
        const idx = Math.floor(exactIndex);
        const frac = exactIndex - idx;

        const from = path[Math.min(idx, totalPoints - 1)];
        const to = path[Math.min(idx + 1, totalPoints - 1)];

        const lat = from.lat() + (to.lat() - from.lat()) * frac;
        const lng = from.lng() + (to.lng() - from.lng()) * frac;

        car.setPosition({ lat, lng });

        // Rotate icon to match road bearing
        const bearing = getBearing(
          { lat: from.lat(), lng: from.lng() },
          { lat: to.lat(), lng: to.lng() }
        );
        const roundedBearing = Math.round(bearing / 5) * 5;
        if (roundedBearing !== lastBearings[i]) {
          lastBearings[i] = roundedBearing;
          createRotatedIcon(iconUrl, bearing, iconMaxDim).then((rotatedUrl) => {
            car.setIcon({
              url: rotatedUrl,
              scaledSize: new google.maps.Size(canvasSize, canvasSize),
              anchor: new google.maps.Point(canvasSize / 2, canvasSize / 2),
            });
          });
        }
      });

      if (elapsed < duration) {
        carAnimationRef.current = requestAnimationFrame(animate);
      }
    };

    carAnimationRef.current = requestAnimationFrame(animate);

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
        const iconMaxDim = getVehicleIconMaxDim(vehicleType);
        const canvasSize = Math.ceil(Math.sqrt(iconMaxDim * iconMaxDim * 2));

        const carMarker = new google.maps.Marker({
          position: pickupCoords,
          map,
          icon: {
            url: iconUrl,
            scaledSize: new google.maps.Size(canvasSize, canvasSize),
            anchor: new google.maps.Point(canvasSize / 2, canvasSize / 2),
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
            createRotatedIcon(iconUrl, bearing, iconMaxDim).then((rotatedUrl) => {
              carMarker.setIcon({
                url: rotatedUrl,
                scaledSize: new google.maps.Size(canvasSize, canvasSize),
                anchor: new google.maps.Point(canvasSize / 2, canvasSize / 2),
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
        .gm-style-iw { background: white !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important; border: none !important; border-radius: 8px !important; font-family: 'Avenir', 'Avenir Next', 'Nunito Sans', system-ui, sans-serif !important; }
        .gm-style-iw-d { overflow: hidden !important; }
        button.gm-ui-hover-effect { display: none !important; }
        .gm-style-iw-chr { display: none !important; }
        .gm-style-iw-tc { display: none !important; }
        .pac-container { font-family: 'Avenir', 'Avenir Next', 'Nunito Sans', system-ui, sans-serif !important; border-radius: 8px !important; border: none !important; box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important; margin-top: 4px !important; overflow: hidden !important; }
        .pac-item { font-family: 'Avenir', 'Avenir Next', 'Nunito Sans', system-ui, sans-serif !important; font-size: 13px !important; padding: 8px 12px !important; border-top: 1px solid rgba(0,0,0,0.06) !important; color: rgba(0,0,0,0.7) !important; cursor: pointer !important; }
        .pac-item:first-child { border-top: none !important; }
        .pac-item:hover { background: rgba(0,0,0,0.04) !important; }
        .pac-item-query { font-family: 'Avenir', 'Avenir Next', 'Nunito Sans', system-ui, sans-serif !important; font-size: 13px !important; font-weight: 500 !important; color: rgba(0,0,0,0.85) !important; }
        .pac-matched { font-weight: 600 !important; }
        .pac-icon { display: none !important; }
        .pac-logo::after { display: none !important; }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
};

export default BookingMap;
