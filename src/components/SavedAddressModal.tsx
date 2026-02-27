import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import AddressAutocomplete from "@/components/booking/AddressAutocomplete";

const SAVED_ADDRESSES_KEY = "courial_saved_addresses";

export interface SavedAddress {
  type: string; // "home" | "work" | custom
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export function getSavedAddresses(): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESSES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveSavedAddress(entry: SavedAddress) {
  const existing = getSavedAddresses().filter((a) => a.type !== entry.type);
  existing.push(entry);
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(existing));
}

interface SavedAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressType: string; // "home" | "work"
  onSave?: (address: SavedAddress) => void;
}

export const SavedAddressModal = ({
  open,
  onOpenChange,
  addressType,
  onSave,
}: SavedAddressModalProps) => {
  const existing = getSavedAddresses().find((a) => a.type === addressType);
  const [name, setName] = useState(existing?.name || "");
  const [address, setAddress] = useState(existing?.address || "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    existing ? { lat: existing.lat, lng: existing.lng } : null
  );

  useEffect(() => {
    if (open) {
      const ex = getSavedAddresses().find((a) => a.type === addressType);
      setName(ex?.name || "");
      setAddress(ex?.address || "");
      setCoords(ex ? { lat: ex.lat, lng: ex.lng } : null);
    }
  }, [open, addressType]);

  const handlePlaceSelect = (place: any) => {
    const rawAddress = place.formatted_address || place.name || "";
    const cleaned = rawAddress
      .replace(/,?\s*(USA|US|United States|Thailand|ประเทศไทย)\s*$/i, "")
      .trim();
    setAddress(cleaned);
    if (place.geometry?.location) {
      setCoords({
        lat: typeof place.geometry.location.lat === "function" ? place.geometry.location.lat() : place.geometry.location.lat,
        lng: typeof place.geometry.location.lng === "function" ? place.geometry.location.lng() : place.geometry.location.lng,
      });
    }
    // Auto-fill name from place name if empty
    if (!name && place.name && place.name !== cleaned) {
      setName(place.name);
    }
  };

  const canSave = address.trim() && coords;

  const handleSave = () => {
    if (!canSave) return;
    const entry: SavedAddress = {
      type: addressType,
      name: name.trim() || (addressType === "home" ? "Home" : addressType === "work" ? "Work" : addressType),
      address: address.trim(),
      lat: coords!.lat,
      lng: coords!.lng,
    };
    saveSavedAddress(entry);
    onSave?.(entry);
    onOpenChange(false);
  };

  const label = addressType.charAt(0).toUpperCase() + addressType.slice(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
            <DialogTitle className="sr-only">Save {label} Address</DialogTitle>

            <h1 className="text-2xl font-bold text-center mb-5">Save {label}</h1>

            {/* Address field */}
            <div className="mb-3">
              <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">
                Address
              </label>
              <AddressAutocomplete
                placeholder={`Enter your ${addressType} address`}
                value={address}
                onChange={setAddress}
                onPlaceSelect={handlePlaceSelect}
                className="w-full h-9 text-sm rounded-md border border-background/30 bg-transparent text-background placeholder:text-background/30 px-3 py-2 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Name field */}
            <div className="mb-4">
              <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">
                Label
              </label>
              <Input
                placeholder={`e.g. ${label}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-background/30 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary h-9 text-sm"
              />
            </div>

            {/* Selected address preview */}
            {address && coords && (
              <div className="flex items-start gap-2 mb-4 bg-background/10 rounded-xl px-3 py-2.5">
                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-background/70 leading-snug">{address}</p>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10 disabled:opacity-40"
            >
              Save
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
