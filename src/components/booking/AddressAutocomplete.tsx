/// <reference types="google.maps" />
import React, { useRef, useEffect, useState, useCallback } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyDxJoLqE0Whu0VmkQv4zVpcVim4UZ3e_c4";
const RECENT_KEY = "courial_recent_addresses";
const MAX_RECENT = 5;

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

interface RecentAddress {
  address: string;
  placeName?: string;
  lat: number;
  lng: number;
}

function getRecentAddresses(): RecentAddress[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentAddress(entry: RecentAddress) {
  const recents = getRecentAddresses().filter(
    (r) => r.address !== entry.address
  );
  recents.unshift(entry);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENT)));
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
  const [showRecents, setShowRecents] = useState(false);
  const [recents, setRecents] = useState<RecentAddress[]>([]);
  const [inputText, setInputText] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter recents by current input text
  const filteredRecents = inputText.trim()
    ? recents.filter((r) => {
        const q = inputText.toLowerCase();
        return (
          r.address.toLowerCase().includes(q) ||
          (r.placeName && r.placeName.toLowerCase().includes(q))
        );
      })
    : recents;

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch((err) => console.error("[AddressAutocomplete] Failed to load:", err));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.geometry) {
        const rawAddress = place.formatted_address || place.name || "";
        const address = rawAddress.replace(/,?\s*(USA|US|United States)\s*$/i, '').trim();
        isSelectingRef.current = true;
        onChange(address);
        setInputText(address);
        onPlaceSelect(place);

        // Save to recents
        saveRecentAddress({
          address,
          placeName: place.name && !address.startsWith(place.name) ? place.name : undefined,
          lat: place.geometry.location!.lat(),
          lng: place.geometry.location!.lng(),
        });
        setRecents(getRecentAddresses());

        if (inputRef.current) inputRef.current.value = address;
        setShowRecents(false);
        setTimeout(() => { isSelectingRef.current = false; }, 100);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [ready]);

  // Sync input value when parent value changes
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
    setInputText(value);
  }, [value]);

  // Close recents when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowRecents(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelectingRef.current) {
      const val = e.target.value;
      onChange(val);
      setInputText(val);
      // Show recents when typing and there are matches
      setRecents(getRecentAddresses());
      setShowRecents(true);
    }
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setRecents(getRecentAddresses());
    if (getRecentAddresses().length > 0) {
      setShowRecents(true);
    }
  }, []);

  const handleRecentClick = useCallback((recent: RecentAddress) => {
    const address = recent.address;
    isSelectingRef.current = true;
    onChange(address);
    setInputText(address);
    if (inputRef.current) inputRef.current.value = address;
    setShowRecents(false);

    // Create a mock place object so the parent handler works
    const mockPlace = {
      formatted_address: address,
      name: recent.placeName || address,
      geometry: {
        location: {
          lat: () => recent.lat,
          lng: () => recent.lng,
        },
      },
    };
    onPlaceSelect(mockPlace);

    // Move to top of recents
    saveRecentAddress(recent);
    setTimeout(() => { isSelectingRef.current = false; }, 100);
  }, [onChange, onPlaceSelect]);

  return (
    <div ref={wrapperRef as any} className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        onChange={handleChange}
        onFocus={handleFocus}
        className={className}
        autoComplete="off"
      />
      {showRecents && filteredRecents.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden"
             style={{ zIndex: 10001 }}>
          <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Recent
          </div>
          {filteredRecents.map((r, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-start gap-2"
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                handleRecentClick(r);
              }}
            >
              <svg className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="min-w-0">
                {r.placeName && (
                  <div className="text-sm font-medium text-foreground truncate">{r.placeName}</div>
                )}
                <div className={`text-sm truncate ${r.placeName ? "text-muted-foreground text-xs" : "text-foreground"}`}>
                  {r.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
