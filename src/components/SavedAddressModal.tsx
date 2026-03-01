import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { MapPin, Minus, RefreshCw } from "lucide-react";
import AddressAutocomplete from "@/components/booking/AddressAutocomplete";
import { supabase } from "@/integrations/supabase/client";

const SAVED_ADDRESSES_KEY = "courial_saved_addresses";

export interface SavedAddress {
  id?: string;
  type: string; // "home" | "work" | "favorite"
  name: string;
  address: string;
  lat: number;
  lng: number;
}

/* ── Local cache helpers (instant reads) ── */
function getLocalAddresses(): SavedAddress[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ADDRESSES_KEY) || "[]");
  } catch {
    return [];
  }
}

function setLocalAddresses(addresses: SavedAddress[]) {
  localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
}

/* ── Public API: DB-first with localStorage cache ── */

export function getSavedAddresses(): SavedAddress[] {
  return getLocalAddresses();
}

export async function loadSavedAddressesFromDB(): Promise<SavedAddress[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return getLocalAddresses();

  const { data, error } = await supabase
    .from("saved_addresses")
    .select("id, type, name, address, lat, lng")
    .eq("user_id", user.id);

  if (error || !data) return getLocalAddresses();

  const addresses: SavedAddress[] = data.map((r: any) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
  }));
  setLocalAddresses(addresses);
  return addresses;
}

export async function saveSavedAddress(entry: SavedAddress) {
  const { data: { user } } = await supabase.auth.getUser();

  // Update local cache
  const all = getLocalAddresses();
  if (entry.type === "home" || entry.type === "work") {
    const filtered = all.filter((a) => a.type !== entry.type);
    const newEntry = { ...entry, id: entry.type };
    filtered.push(newEntry);
    setLocalAddresses(filtered);
  } else {
    const id = entry.id || `fav_${Date.now()}`;
    all.push({ ...entry, id });
    setLocalAddresses(all);
  }

  // Persist to DB if authenticated
  if (user) {
    if (entry.type === "home" || entry.type === "work") {
      // Delete existing, then insert
      await supabase.from("saved_addresses").delete().eq("user_id", user.id).eq("type", entry.type);
    }
    await supabase.from("saved_addresses").insert({
      user_id: user.id,
      type: entry.type,
      name: entry.name || entry.type,
      address: entry.address,
      lat: entry.lat,
      lng: entry.lng,
    });
  }
}

export async function removeSavedAddress(id: string) {
  const all = getLocalAddresses().filter((a) => (a.id || a.type) !== id);
  setLocalAddresses(all);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Try by id first, then by type (for home/work)
    const { error } = await supabase.from("saved_addresses").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      await supabase.from("saved_addresses").delete().eq("type", id).eq("user_id", user.id);
    }
  }
}

interface SavedAddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressType: string;
  onSave?: (address?: SavedAddress) => void;
}

export const SavedAddressModal = ({
  open,
  onOpenChange,
  addressType,
  onSave,
}: SavedAddressModalProps) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const isFavorite = addressType === "favorite";
  const isHomeWork = addressType === "home" || addressType === "work";

  useEffect(() => {
    if (open) {
      loadSavedAddressesFromDB().then((loaded) => {
        setAddresses(loaded);
        if (isHomeWork) {
          const ex = loaded.find((a) => a.type === addressType);
          setName(ex?.name || "");
          setAddress(ex?.address || "");
          setCoords(ex ? { lat: ex.lat, lng: ex.lng } : null);
        } else {
          resetForm();
        }
      });
      setReplacingId(null);
      setConfirmRemoveId(null);
    }
  }, [open, addressType]);

  const refreshAddresses = async () => {
    const loaded = await loadSavedAddressesFromDB();
    setAddresses(loaded);
  };
  const resetForm = () => { setName(""); setAddress(""); setCoords(null); };

  const handlePlaceSelect = (place: any) => {
    const rawAddress = place.formatted_address || place.name || "";
    const cleaned = rawAddress.replace(/,?\s*(USA|US|United States|Thailand|ประเทศไทย)\s*$/i, "").trim();
    setAddress(cleaned);
    if (place.geometry?.location) {
      setCoords({
        lat: typeof place.geometry.location.lat === "function" ? place.geometry.location.lat() : place.geometry.location.lat,
        lng: typeof place.geometry.location.lng === "function" ? place.geometry.location.lng() : place.geometry.location.lng,
      });
    }
    if (!name && place.name && place.name !== cleaned) setName(place.name);
  };

  const canSave = address.trim() && coords;

  const handleSave = async () => {
    if (!canSave) return;
    const entry: SavedAddress = {
      type: addressType,
      name: name.trim() || (isHomeWork ? addressType.charAt(0).toUpperCase() + addressType.slice(1) : "Favorite"),
      address: address.trim(),
      lat: coords!.lat,
      lng: coords!.lng,
    };

    if (replacingId && isHomeWork) {
      await removeSavedAddress(replacingId);
    }

    await saveSavedAddress(entry);
    onSave?.();
    await refreshAddresses();
    if (isHomeWork) {
      onOpenChange(false);
    } else {
      resetForm();
    }
    setReplacingId(null);
  };

  const handleRemove = async (id: string) => {
    await removeSavedAddress(id);
    await refreshAddresses();
    onSave?.();
    setConfirmRemoveId(null);
    if (isHomeWork) onOpenChange(false);
  };

  const handleReplace = () => {
    setReplacingId(addressType);
    setName("");
    setAddress("");
    setCoords(null);
  };

  const label = addressType.charAt(0).toUpperCase() + addressType.slice(1);
  const existingHomeWork = isHomeWork ? addresses.find((a) => a.type === addressType) : null;
  const favoriteAddresses = addresses.filter((a) => a.type === "favorite");

  const dialogPreventClose = (e: any) => {
    const target = e.target as HTMLElement;
    if (target.closest('.pac-container') || target.classList.contains('pac-item') || target.closest('.pac-item')) {
      e.preventDefault();
    }
  };

  const AddressForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <>
      <div className="mb-3">
        <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">Address</label>
        <AddressAutocomplete
          placeholder={`Enter address`}
          value={address}
          onChange={setAddress}
          onPlaceSelect={handlePlaceSelect}
          className="w-full h-9 text-sm rounded-md border border-background/30 bg-transparent text-background placeholder:text-background/30 px-3 py-2 focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="mb-4">
        <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">Label</label>
        <Input
          placeholder={`e.g. Gym, Mom's house`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent border-background/30 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary h-9 text-sm"
        />
      </div>
      {address && coords && (
        <div className="flex items-start gap-2 mb-4 bg-background/10 rounded-xl px-3 py-2.5">
          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-background/70 leading-snug">{address}</p>
        </div>
      )}
      <Button
        onClick={onSubmit}
        disabled={!canSave}
        className="w-full rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10 disabled:opacity-40"
      >
        {submitLabel}
      </Button>
    </>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none"
          onPointerDownOutside={dialogPreventClose}
          onInteractOutside={dialogPreventClose}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
              <DialogTitle className="sr-only">Save {label} Address</DialogTitle>
              <h1 className="text-2xl font-bold text-center mb-5">
                {isFavorite ? "Favorite Places" : `Save ${label}`}
              </h1>

              {/* HOME / WORK view */}
              {isHomeWork && (
                <>
                  {existingHomeWork && !replacingId ? (
                    <>
                      {/* Show existing address */}
                      <div className="flex items-start gap-2 mb-4 bg-background/10 rounded-xl px-3 py-2.5">
                        <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-background">{existingHomeWork.name}</p>
                          <p className="text-[10px] text-background/50 leading-snug">{existingHomeWork.address}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleReplace}
                          className="flex-1 rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Replace
                        </Button>
                        <Button
                          onClick={() => setConfirmRemoveId(existingHomeWork.id || existingHomeWork.type)}
                          className="flex-1 rounded-lg h-10 text-sm font-semibold bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Minus className="w-3.5 h-3.5 mr-1.5" />
                          Remove
                        </Button>
                      </div>

                      {/* Confirm remove */}
                      {confirmRemoveId && (
                        <div className="mt-3 flex items-center justify-center gap-2 bg-background/10 rounded-xl px-3 py-2.5">
                          <span className="text-xs text-background/70">Remove?</span>
                          <button
                            onClick={() => handleRemove(confirmRemoveId)}
                            className="text-xs font-semibold text-red-400 bg-red-500/10 rounded-full px-3 py-1 hover:bg-red-500/20 transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs font-semibold text-background/70 bg-background/10 rounded-full px-3 py-1 hover:bg-background/20 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <AddressForm onSubmit={handleSave} submitLabel={replacingId ? "Replace" : "Save"} />
                  )}
                </>
              )}

              {/* FAVORITE view */}
              {isFavorite && (
                <>
                  {/* Existing favorites list */}
                  {favoriteAddresses.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {favoriteAddresses.map((fav) => (
                        <div key={fav.id || fav.address} className="relative flex items-start gap-2 bg-background/10 rounded-xl px-3 py-2.5">
                          <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-background">{fav.name}</p>
                            <p className="text-[10px] text-background/50 leading-snug break-words">{fav.address}</p>
                          </div>
                          {confirmRemoveId === (fav.id || fav.address) ? (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleRemove(fav.id || fav.address)}
                                className="text-[10px] font-semibold text-red-400 bg-red-500/10 rounded-full px-2.5 py-0.5 hover:bg-red-500/20 transition-colors"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setConfirmRemoveId(null)}
                                className="text-[10px] font-semibold text-background/70 bg-background/10 rounded-full px-2.5 py-0.5 hover:bg-background/20 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmRemoveId(fav.id || fav.address)}
                              className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 mt-0.5"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {favoriteAddresses.length === 0 && (
                    <p className="text-xs text-background/40 text-center mb-4">No favorite places saved yet</p>
                  )}

                  {/* Add + Back buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onOpenChange(false)}
                      className="flex-1 rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => setAddModalOpen(true)}
                      className="flex-1 rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10"
                    >
                      Add
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Add Favorite Sub-Modal */}
      <AddFavoriteModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={() => {
          refreshAddresses();
          onSave?.();
        }}
      />
    </>
  );
};

/* ── Sub-modal for adding a new favorite ── */
const AddFavoriteModal = ({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (open) { setName(""); setAddress(""); setCoords(null); }
  }, [open]);

  const handlePlaceSelect = (place: any) => {
    const rawAddress = place.formatted_address || place.name || "";
    const cleaned = rawAddress.replace(/,?\s*(USA|US|United States|Thailand|ประเทศไทย)\s*$/i, "").trim();
    setAddress(cleaned);
    if (place.geometry?.location) {
      setCoords({
        lat: typeof place.geometry.location.lat === "function" ? place.geometry.location.lat() : place.geometry.location.lat,
        lng: typeof place.geometry.location.lng === "function" ? place.geometry.location.lng() : place.geometry.location.lng,
      });
    }
    if (!name && place.name && place.name !== cleaned) setName(place.name);
  };

  const canSave = address.trim() && coords;

  const handleAdd = () => {
    if (!canSave) return;
    saveSavedAddress({
      type: "favorite",
      name: name.trim() || "Favorite",
      address: address.trim(),
      lat: coords!.lat,
      lng: coords!.lng,
    });
    onAdded();
    onOpenChange(false);
  };

  const dialogPreventClose = (e: any) => {
    const target = e.target as HTMLElement;
    if (target.closest('.pac-container') || target.classList.contains('pac-item') || target.closest('.pac-item')) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none"
        onPointerDownOutside={dialogPreventClose}
        onInteractOutside={dialogPreventClose}
      >
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
            <DialogTitle className="sr-only">Add Favorite Place</DialogTitle>
            <h1 className="text-2xl font-bold text-center mb-5">Add Favorite</h1>

            <div className="mb-3">
              <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">Address</label>
              <AddressAutocomplete
                placeholder="Enter address"
                value={address}
                onChange={setAddress}
                onPlaceSelect={handlePlaceSelect}
                className="w-full h-9 text-sm rounded-md border border-background/30 bg-transparent text-background placeholder:text-background/30 px-3 py-2 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">Label</label>
              <Input
                placeholder="e.g. Gym, Mom's house"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-background/30 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary h-9 text-sm"
              />
            </div>
            {address && coords && (
              <div className="flex items-start gap-2 mb-4 bg-background/10 rounded-xl px-3 py-2.5">
                <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-xs text-background/70 leading-snug">{address}</p>
              </div>
            )}
            <Button
              onClick={handleAdd}
              disabled={!canSave}
              className="w-full rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10 disabled:opacity-40"
            >
              Add
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
