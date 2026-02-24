import React, { useRef, useEffect, useState } from "react";

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
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

  useEffect(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    if (autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      fields: ["formatted_address", "geometry", "name", "place_id"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
        onPlaceSelect(place);
      }
    });

    autocompleteRef.current = autocomplete;
  }, [onPlaceSelect, onChange]);

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
