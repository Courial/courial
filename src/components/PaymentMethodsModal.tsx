import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Trash2, ArrowLeft, Shield, Eye, EyeOff, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import visaIcon from "@/assets/card-icons/visa.svg";
import mastercardIcon from "@/assets/card-icons/mastercard.svg";

const paymentMethods = [
  { id: "visa-4242", type: "visa", label: "Visa", last4: "4242", icon: visaIcon },
  { id: "mc-8831", type: "mastercard", label: "Mastercard", last4: "8831", icon: mastercardIcon },
];

interface PaymentMethodsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPaymentMethod?: string;
  onSelectPaymentMethod?: (id: string) => void;
}

export const PaymentMethodsModal = ({
  open,
  onOpenChange,
  selectedPaymentMethod = "visa-4242",
  onSelectPaymentMethod,
}: PaymentMethodsModalProps) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", isDefault: false });
  const [showCvv, setShowCvv] = useState(false);
  const [selected, setSelected] = useState(selectedPaymentMethod);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelectPaymentMethod?.(id);
    onOpenChange(false);
  };

  const handleClose = (o: boolean) => {
    onOpenChange(o);
    if (!o) setShowAddCard(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[22rem] bg-transparent border-none !rounded-[20px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden shadow-none">
        <AnimatePresence mode="wait">
          {!showAddCard ? (
            <motion.div key="methods" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
                <DialogTitle className="sr-only">Payment Methods</DialogTitle>

                <h1 className="text-2xl font-bold text-center mt-1 mb-5">Payment</h1>

                <div className="space-y-2 mb-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handleSelect(method.id)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all",
                        selected === method.id
                          ? "border-background/50 bg-background/10"
                          : "border-background/20 hover:bg-background/10"
                      )}
                    >
                      <img src={method.icon} alt={method.label} className="w-9 h-auto rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-background">{method.label}</p>
                        <p className="text-xs text-background/50">•••• {method.last4}</p>
                      </div>
                      {selected === method.id && (
                        <div className="w-2 h-2 rounded-full bg-background" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-background/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-dashed border-background/30 hover:bg-background/10 transition-colors mb-4"
                >
                  <div className="w-9 h-6 rounded bg-background/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-background/60" />
                  </div>
                  <span className="text-sm font-semibold text-background">Add card</span>
                </button>

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-2">Other methods</p>
                  <div className="space-y-2">
                    <button className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-background/20 hover:bg-background/10 transition-colors">
                      <div className="w-9 h-6 rounded bg-[#003087] flex items-center justify-center">
                        <span className="text-[0.45rem] font-bold italic text-white">Pay<span className="text-[#009cde]">Pal</span></span>
                      </div>
                      <span className="text-sm font-semibold text-background">PayPal</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-background/20 hover:bg-background/10 transition-colors">
                      <div className="w-9 h-6 rounded bg-background flex items-center justify-center">
                        <span className="text-[0.45rem] font-bold text-foreground tracking-tight"> Pay</span>
                      </div>
                      <span className="text-sm font-semibold text-background">Apple Pay</span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="add-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="rounded-[20px] bg-foreground/75 text-background px-6 py-6 shadow-2xl backdrop-blur-sm flex flex-col">
                <DialogTitle className="sr-only">Add Card</DialogTitle>

                <div className="flex items-center gap-2 mb-5">
                  <button onClick={() => setShowAddCard(false)} className="p-1 -ml-1 rounded-lg hover:bg-background/10 transition-colors">
                    <ArrowLeft className="w-4 h-4 text-background/70" />
                  </button>
                  <h1 className="text-2xl font-bold">Add Card</h1>
                </div>

                <div className="mb-3">
                  <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">Card number</label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={newCard.number}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                      setNewCard(prev => ({ ...prev, number: formatted }));
                    }}
                    inputMode="numeric"
                    className="bg-transparent border-background/30 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary font-mono tracking-wider h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">Expiry</label>
                    <Input
                      placeholder="MM / YY"
                      value={newCard.expiry}
                      onChange={(e) => {
                        let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (raw.length >= 3) raw = raw.slice(0, 2) + " / " + raw.slice(2);
                        setNewCard(prev => ({ ...prev, expiry: raw }));
                      }}
                      inputMode="numeric"
                      className="bg-transparent border-background/30 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary font-mono tracking-wider h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-background/50 uppercase tracking-wider mb-1.5 block">CVV</label>
                    <div className="relative">
                      <Input
                        type={showCvv ? "text" : "password"}
                        placeholder="•••"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        inputMode="numeric"
                        className="bg-transparent border-background/30 text-background placeholder:text-background/30 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary font-mono tracking-wider pr-8 h-9 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-background/50 hover:text-background transition-colors"
                      >
                        {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2.5 mb-3">
                  <span className="text-sm font-medium text-background">Set as default</span>
                  <button
                    onClick={() => setNewCard(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                    className={cn(
                      "relative w-10 h-5 rounded-full transition-colors",
                      newCard.isDefault ? "bg-primary" : "bg-background/30"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform",
                      newCard.isDefault ? "translate-x-[22px]" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                <div className="flex items-start gap-2 mb-3">
                  <Shield className="w-3.5 h-3.5 text-background/50 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-background/50 leading-snug">Your card details will be saved securely and encrypted end-to-end.</p>
                </div>

                <p className="text-[10px] text-background/50 mb-4 leading-relaxed">
                  Your card may be charged to verify it's valid. That amount will be automatically refunded. By adding a card, you agree to our{" "}
                  <Link to="/terms" className="text-background hover:text-background/50 transition-colors">terms</Link>.
                </p>

                <Button
                  onClick={() => {
                    setNewCard({ number: "", expiry: "", cvv: "", isDefault: false });
                    setShowCvv(false);
                    setShowAddCard(false);
                  }}
                  disabled={newCard.number.replace(/\s/g, "").length < 15 || newCard.expiry.length < 7 || newCard.cvv.length < 3}
                  className="w-full rounded-lg h-10 text-sm font-semibold bg-transparent border border-background/30 text-background hover:bg-background/10 disabled:opacity-40"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
