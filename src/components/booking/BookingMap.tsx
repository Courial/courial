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
}

// Reuse the same loader from AddressAutocomplete
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

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords, pickupAddress, dropoffAddress }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
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
          scale: 8,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: pickupAddress || "Pickup",
      });
      markersRef.current.push(marker);
      bounds.extend(pickupCoords);
    }

    if (dropoffCoords) {
      const marker = new google.maps.Marker({
        position: dropoffCoords,
        map,
        icon: {
          path: "M -6 -6 L 6 -6 L 6 6 L -6 6 Z",
          scale: 1,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
        title: dropoffAddress || "Dropoff",
      });
      markersRef.current.push(marker);
      bounds.extend(dropoffCoords);
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
          strokeWeight: 4,
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
  }, [pickupCoords, dropoffCoords, pickupAddress, dropoffAddress]);

  if (!ready) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
};

export default BookingMap;
