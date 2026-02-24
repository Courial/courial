import React, { useCallback, useEffect, useRef, useState } from "react";
import { GoogleMap } from "@react-google-maps/api";

interface LatLng {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickupCoords: LatLng | null;
  dropoffCoords: LatLng | null;
}

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter: LatLng = { lat: 40.7128, lng: -74.006 };

const BookingMap: React.FC<BookingMapProps> = ({ pickupCoords, dropoffCoords }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Update markers and route when coords change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (pickupCoords) {
      const marker = new google.maps.Marker({
        position: pickupCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#000000",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Pickup",
      });
      markersRef.current.push(marker);
    }

    if (dropoffCoords) {
      const marker = new google.maps.Marker({
        position: dropoffCoords,
        map,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#000000",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: "Dropoff",
      });
      markersRef.current.push(marker);
    }

    // Fit bounds
    if (pickupCoords && dropoffCoords) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupCoords);
      bounds.extend(dropoffCoords);
      map.fitBounds(bounds, 80);

      // Draw route
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#000000",
            strokeWeight: 4,
            strokeOpacity: 0.8,
          },
        });
      }
      directionsRendererRef.current.setMap(map);

      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            directionsRendererRef.current?.setDirections(result);
          }
        }
      );
    } else {
      // Clear route
      directionsRendererRef.current?.setMap(null);
      directionsRendererRef.current = null;

      if (pickupCoords) {
        map.panTo(pickupCoords);
        map.setZoom(14);
      } else if (dropoffCoords) {
        map.panTo(dropoffCoords);
        map.setZoom(14);
      }
    }
  }, [pickupCoords, dropoffCoords]);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={12}
      onLoad={onLoad}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition?.RIGHT_BOTTOM,
        },
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      }}
    />
  );
};

export default BookingMap;
