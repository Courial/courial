/// <reference types="google.maps" />
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Clock, Heart, MapPin } from "lucide-react";
import { getSavedAddresses, type SavedAddress } from "@/components/SavedAddressModal";

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

type DropdownTab = "recent" | "favorites";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<DropdownTab>("recent");
  const [recents, setRecents] = useState<RecentAddress[]>([]);
  const [favorites, setFavorites] = useState<SavedAddress[]>([]);
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

  const filteredFavorites = inputText.trim()
    ? favorites.filter((f) => {
        const q = inputText.toLowerCase();
        return (
          f.address.toLowerCase().includes(q) ||
          f.name.toLowerCase().includes(q)
        );
      })
    : favorites;

  const activeList = activeTab === "recent" ? filteredRecents : filteredFavorites;
  const hasAnyData = recents.length > 0 || favorites.length > 0;

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch((err) => console.error("[AddressAutocomplete] Failed to load:", err));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: ["us", "th"] },
      fields: ["formatted_address", "geometry", "name"],
    });

    // Bias results toward the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const circle = new google.maps.Circle({
            center: { lat: position.coords.latitude, lng: position.coords.longitude },
            radius: position.coords.accuracy || 50000,
          });
          autocomplete.setBounds(circle.getBounds()!);
        },
        () => { /* silently ignore denial */ }
      );
    }

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.geometry) {
        const rawAddress = place.formatted_address || place.name || "";
        const address = rawAddress.replace(/,?\s*(USA|US|United States|Thailand|ประเทศไทย)\s*$/i, '').trim();
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
        setShowDropdown(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshData = useCallback(() => {
    setRecents(getRecentAddresses());
    setFavorites(getSavedAddresses());
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSelectingRef.current) {
      const val = e.target.value;
      onChange(val);
      setInputText(val);
      refreshData();
      setShowDropdown(true);
    }
  }, [onChange, refreshData]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    refreshData();
    if (getRecentAddresses().length > 0 || getSavedAddresses().length > 0) {
      setShowDropdown(true);
    }
  }, [refreshData]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleItemClick = useCallback((address: string, name: string | undefined, lat: number, lng: number) => {
    isSelectingRef.current = true;
    onChange(address);
    setInputText(address);
    if (inputRef.current) inputRef.current.value = address;
    setShowDropdown(false);

    const mockPlace = {
      formatted_address: address,
      name: name || address,
      geometry: {
        location: {
          lat: () => lat,
          lng: () => lng,
        },
      },
    };
    onPlaceSelect(mockPlace);

    // Save to recents
    saveRecentAddress({ address, placeName: name, lat, lng });
    setTimeout(() => { isSelectingRef.current = false; }, 100);
  }, [onChange, onPlaceSelect]);

  const showOverlay = !isFocused && !!value && value.length > 0;

  return (
    <div ref={wrapperRef as any} className="relative">
      {showOverlay ? (
        <>
          {/* Wrapping text display — replaces the input visually */}
          <div
            className={`${className} break-words whitespace-normal cursor-text`}
            onClick={() => { inputRef.current?.focus(); }}
          >
            {value}
          </div>
          {/* Keep the input in DOM but hidden so Google autocomplete stays bound */}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            defaultValue={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={className}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, overflow: 'hidden' }}
            autoComplete="off"
          />
        </>
      ) : (
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          defaultValue={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={className}
          autoComplete="off"
        />
      )}
      {showDropdown && hasAnyData && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden"
          style={{ zIndex: 10001 }}
        >
          {/* Tab buttons */}
          <div className="flex items-center gap-1 px-3 pt-2.5 pb-1.5">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setActiveTab("recent"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTab === "recent"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Recent Places
            </button>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setActiveTab("favorites"); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeTab === "favorites"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorite Places
            </button>
          </div>

          <div className="border-t border-border">
            {activeList.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                {activeTab === "recent" ? "No recent places" : "No saved places"}
              </div>
            ) : (
              activeList.map((item, i) => {
                const isRecent = activeTab === "recent";
                const r = item as any;
                const addr = isRecent ? r.address : r.address;
                const name = isRecent ? r.placeName : r.name;
                const lat = r.lat;
                const lng = r.lng;

                return (
                  <button
                    key={i}
                    type="button"
                    className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors flex items-start gap-2.5 border-b border-border last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleItemClick(addr, name, lat, lng);
                    }}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      {name && (
                        <div className="text-[13px] font-semibold text-foreground leading-snug break-words whitespace-normal">{name}</div>
                      )}
                      <div className={`leading-snug break-words whitespace-normal ${name ? "text-xs text-muted-foreground" : "text-[13px] font-medium text-foreground"}`}>
                        {addr}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;