/// <reference types="google.maps" />
import React, { useRef, useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDxJoLqE0Whu0VmkQv4zVpcVim4UZ3e_c4";

// Load Google Maps script once
let googleMapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;
  if ((window as any).google?.maps?.places) {
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

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onPlaceSelect: (place: any) => void;
  onChange: (value: string) => void;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  placeholder,
  value,
  onPlaceSelect,
  onChange,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
        onPlaceSelect(place);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [ready]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
};

export default AddressAutocomplete;
