import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Circle, X } from "lucide-react";
import profileIcon from "@/assets/profile-icon.png";

interface FavoritePartnersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PartnerType = "courials" | "chauffeurs";

interface Partner {
  id: string;
  firstName: string;
  avatarUrl?: string;
  rating: number;
  sinceYear: string;
  lastMet: string;
  online: boolean;
  vehicle: string;
}

const MOCK_COURIALS: Partner[] = [
  { id: "1", firstName: "Marcus", rating: 4.9, sinceYear: "22", lastMet: "Feb 12, 2026", online: true, vehicle: "White 2023 Honda Civic" },
  { id: "2", firstName: "Aisha", rating: 4.8, sinceYear: "23", lastMet: "Jan 28, 2026", online: false, vehicle: "Black 2024 Toyota Camry" },
  { id: "3", firstName: "Diego", rating: 5.0, sinceYear: "21", lastMet: "Feb 20, 2026", online: true, vehicle: "Silver 2022 Hyundai Elantra" },
];

const MOCK_CHAUFFEURS: Partner[] = [
  { id: "4", firstName: "James", rating: 4.9, sinceYear: "20", lastMet: "Feb 25, 2026", online: true, vehicle: "Black 2025 Mercedes S-Class" },
  { id: "5", firstName: "Sophia", rating: 5.0, sinceYear: "24", lastMet: "Feb 10, 2026", online: false, vehicle: "Black 2024 BMW 7 Series" },
];

export const FavoritePartnersModal = ({ open, onOpenChange }: FavoritePartnersModalProps) => {
  const [tab, setTab] = useState<PartnerType>("courials");
  const [courials, setCourials] = useState(MOCK_COURIALS);
  const [chauffeurs, setChauffeurs] = useState(MOCK_CHAUFFEURS);

  const partners = tab === "courials" ? courials : chauffeurs;

  const removePartner = (id: string) => {
    if (tab === "courials") {
      setCourials((prev) => prev.filter((p) => p.id !== id));
    } else {
      setChauffeurs((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[19.2rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
            <DialogTitle className="sr-only">Favorite Partners</DialogTitle>

            {/* Header */}
            <h1 className="text-xl font-bold text-background text-center mb-5">
              Favorites
            </h1>

            {/* Toggle */}
            <div className="flex rounded-full border border-background/20 p-0.5 mb-5 w-fit mx-auto">
              <button
                onClick={() => setTab("courials")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  tab === "courials"
                    ? "bg-background text-foreground"
                    : "text-background"
                }`}
              >
                Courials
              </button>
              <button
                onClick={() => setTab("chauffeurs")}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  tab === "chauffeurs"
                    ? "bg-background text-foreground"
                    : "text-background"
                }`}
              >
                Chauffeurs
              </button>
            </div>

            {/* List */}
            <div className="space-y-0">
              <AnimatePresence mode="popLayout">
                {partners.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-background/40 text-xs py-8"
                  >
                    No favorite {tab} yet
                  </motion.p>
                )}
                {partners.map((partner) => (
                  <motion.div
                    key={partner.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-3 py-3 border-b border-background/10"
                  >
                    {/* Avatar + online dot */}
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-background/20">
                        <AvatarImage src={partner.avatarUrl} alt={partner.firstName} />
                        <AvatarFallback className="bg-background/20 p-0 flex items-center justify-center">
                          <img src={profileIcon} alt="" className="h-3/4 w-3/4 object-contain invert" />
                        </AvatarFallback>
                      </Avatar>
                      <Circle
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${
                          partner.online
                            ? "text-green-400 fill-green-400"
                            : "text-background/30 fill-background/30"
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-background">{partner.firstName}</p>
                        <Star className="h-3 w-3 text-primary fill-primary" />
                        <span className="text-[10px] text-background/70">{partner.rating}</span>
                      </div>
                      <p className="text-[10px] text-background/40">
                        Since '{partner.sinceYear} · Last met {partner.lastMet}
                      </p>
                      <p className="text-[10px] text-background/40">
                        {partner.vehicle}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removePartner(partner.id)}
                      className="hover:opacity-75 transition-opacity p-1"
                    >
                      <X className="h-3.5 w-3.5 text-background/40" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Close */}
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-lg h-10 text-sm font-semibold mt-5 bg-transparent border border-background/30 text-background hover:bg-background/10"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
