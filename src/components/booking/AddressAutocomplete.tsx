/// <reference types="google.maps" />
import React, { useRef, useEffect, useState, useCallback } from "react";

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
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
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
  const isSelectingRef = useRef(false);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        console.log("[AddressAutocomplete] Google Maps loaded");
        setReady(true);
      })
      .catch((err) => console.error("[AddressAutocomplete] Failed to load:", err));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    console.log("[AddressAutocomplete] Initializing autocomplete");
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      console.log("[AddressAutocomplete] Place selected:", place);
      if (place?.geometry) {
        const address = place.formatted_address || place.name || "";
        isSelectingRef.current = true;
        onChange(address);
        onPlaceSelect(place);
        // Sync input value
        if (inputRef.current) {
          inputRef.current.value = address;
        }
        setTimeout(() => { isSelectingRef.current = false; }, 100);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [ready]);

  // Sync the input value when the parent value changes (e.g. reset)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelectingRef.current) {
      onChange(e.target.value);
    }
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      onChange={handleChange}
      className={className}
      autoComplete="off"
    />
  );
};

export default AddressAutocomplete;
