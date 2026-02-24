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
}

function buildInfoContent(address: string, placeName?: string | null): string {
  if (placeName) {
    return `<div style="font-size:10px;font-weight:400;color:rgba(0,0,0,0.75);padding:1px 3px;line-height:1.3;">${placeName}</div>`;
  }
  // Remove country (USA, US, United States) from end
  let clean = address.replace(/,?\s*(USA|US|United States)\s*$/i, '').trim();
  // Split into street line and city/state/zip line
  const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
  let line1 = parts[0] || '';
  let line2 = parts.slice(1).join(', ');
  const html = line2
    ? `<div style="font-size:10px;font-weight:400;color:rgba(0,0,0,0.75);padding:1px 3px;line-height:1.3;">${line1}<br/>${line2}</div>`
    : `<div style="font-size:10px;font-weight:400;color:rgba(0,0,0,0.75);padding:1px 3px;line-height:1.3;">${line1}</div>`;
  return html;
}

// Car SVG icon as data URL for markers
const CAR_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="#111" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`)}`;

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

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords, pickupAddress, dropoffAddress, pickupPlaceName, dropoffPlaceName, bookingState = "input" }) => {
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
  const pulsingDotRef = useRef<google.maps.Marker | null>(null);
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

    // Create 4 car markers at random positions around pickup
    const startPositions = generateRandomPositions(pickupCoords, 4, 3);
    const cars = startPositions.map((pos) => {
      const marker = new google.maps.Marker({
        position: pos,
        map,
        icon: {
          url: CAR_SVG,
          scaledSize: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 14),
        },
        zIndex: 5,
      });
      return marker;
    });
    carMarkersRef.current = cars;

    // Animate cars moving toward pickup
    const startTime = performance.now();
    const duration = 3000; // 3 seconds to match loading time

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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
      if (pulsingDotRef.current) {
        pulsingDotRef.current.setMap(null);
        pulsingDotRef.current = null;
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

        // Create pulsing blue dot at current car position
        const pulseDot = new google.maps.Marker({
          position: pickupCoords,
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 18,
            fillColor: "#276EF1",
            fillOpacity: 0.2,
            strokeColor: "#276EF1",
            strokeWeight: 1,
            strokeOpacity: 0.4,
          },
          zIndex: 3,
        });
        pulsingDotRef.current = pulseDot;

        // Create tracking car marker
        const carMarker = new google.maps.Marker({
          position: pickupCoords,
          map,
          icon: {
            url: CAR_SVG,
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16),
          },
          zIndex: 10,
        });
        trackingMarkerRef.current = carMarker;

        // Animate along route path — slow loop
        const totalDuration = 20000; // 20s to traverse the whole route
        const startTime = performance.now();

        // Pulse animation for the blue dot
        let pulseScale = 18;
        let pulseGrowing = true;

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = (elapsed % totalDuration) / totalDuration; // loops
          
          // Find position along path
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
          pulseDot.setPosition(pos);

          // Animate pulse
          if (pulseGrowing) {
            pulseScale += 0.3;
            if (pulseScale >= 24) pulseGrowing = false;
          } else {
            pulseScale -= 0.3;
            if (pulseScale <= 14) pulseGrowing = true;
          }
          pulseDot.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: pulseScale,
            fillColor: "#276EF1",
            fillOpacity: 0.15,
            strokeColor: "#276EF1",
            strokeWeight: 1.5,
            strokeOpacity: 0.5,
          });

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
