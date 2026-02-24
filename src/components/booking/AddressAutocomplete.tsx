import React, { useRef, useState } from "react";

// Mock LA addresses for test mode
const MOCK_ADDRESSES = [
  { address: "1111 S Figueroa St, Los Angeles, CA 90015", lat: 34.0430, lng: -118.2673 },
  { address: "6801 Hollywood Blvd, Los Angeles, CA 90028", lat: 34.1017, lng: -118.3385 },
  { address: "200 Santa Monica Pier, Santa Monica, CA 90401", lat: 34.0094, lng: -118.4973 },
  { address: "5905 Wilshire Blvd, Los Angeles, CA 90036", lat: 34.0639, lng: -118.3592 },
  { address: "111 S Grand Ave, Los Angeles, CA 90012", lat: 34.0553, lng: -118.2498 },
  { address: "700 W 5th St, Los Angeles, CA 90071", lat: 34.0488, lng: -118.2568 },
  { address: "3400 Riverside Dr, Los Angeles, CA 90027", lat: 34.1185, lng: -118.2637 },
  { address: "10250 Santa Monica Blvd, Los Angeles, CA 90067", lat: 34.0584, lng: -118.4172 },
];

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState(MOCK_ADDRESSES);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleChange = (val: string) => {
    onChange(val);
    const q = val.toLowerCase();
    setFilteredAddresses(
      q.length > 0
        ? MOCK_ADDRESSES.filter((a) => a.address.toLowerCase().includes(q))
        : MOCK_ADDRESSES
    );
    setShowSuggestions(true);
  };

  const handleSelect = (item: typeof MOCK_ADDRESSES[0]) => {
    onChange(item.address);
    setShowSuggestions(false);
    onPlaceSelect({
      formatted_address: item.address,
      geometry: {
        location: {
          lat: () => item.lat,
          lng: () => item.lng,
        },
      },
    });
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        className={className}
      />
      {showSuggestions && filteredAddresses.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filteredAddresses.map((item, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {item.address}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
