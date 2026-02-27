/// <reference types="google.maps" />
import React, { useRef, useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDxJoLqE0Whu0VmkQv4zVpcVim4UZ3e_c4";

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

interface ActivityDetailMapProps {
  origin: string;
  destination: string;
}

const ActivityDetailMap: React.FC<ActivityDetailMapProps> = ({ origin, destination }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
      keyboardShortcuts: false,
    });
    mapInstanceRef.current = map;

    const geocoder = new google.maps.Geocoder();
    const bounds = new google.maps.LatLngBounds();
    let pickupPos: google.maps.LatLng | null = null;
    let dropoffPos: google.maps.LatLng | null = null;

    const tryDrawRoute = () => {
      if (!pickupPos || !dropoffPos) return;
      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#000000",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      new google.maps.DirectionsService().route(
        {
          origin: pickupPos,
          destination: dropoffPos,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) renderer.setDirections(result);
        }
      );
    };

    // Geocode origin
    if (origin) {
      geocoder.geocode({ address: origin }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          pickupPos = results[0].geometry.location;
          new google.maps.Marker({
            position: pickupPos,
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#22c55e",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1,
            },
          });
          bounds.extend(pickupPos);
          if (dropoffPos) {
            map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
          } else {
            map.setCenter(pickupPos);
            map.setZoom(14);
          }
          tryDrawRoute();
        }
      });
    }

    // Geocode destination
    if (destination) {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          dropoffPos = results[0].geometry.location;
          new google.maps.Marker({
            position: dropoffPos,
            map,
            icon: {
              path: "M -6 -6 L 6 -6 L 6 6 L -6 6 Z",
              scale: 1.24,
              fillColor: "#ef4444",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 1,
            },
          });
          bounds.extend(dropoffPos);
          if (pickupPos) {
            map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
          } else {
            map.setCenter(dropoffPos);
            map.setZoom(14);
          }
          tryDrawRoute();
        }
      });
    }
  }, [ready, origin, destination]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default ActivityDetailMap;
