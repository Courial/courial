import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Trash2, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";
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
      <DialogContent className="sm:max-w-md bg-background border-border !rounded-[25px] p-0 overflow-y-auto max-h-[90vh] [&>button]:hidden">
        <AnimatePresence mode="wait">
          {!showAddCard ? (
            <motion.div key="methods" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-7 h-7 text-foreground" />
                  <span className="text-[1.65rem] font-bold text-foreground">Payment</span>
                </div>
              </div>

              <div className="px-7 pb-2">
                <DialogTitle className="text-2xl font-bold text-foreground mb-4">Your Methods</DialogTitle>

                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => handleSelect(method.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                        selected === method.id
                          ? "border-foreground bg-muted/60"
                          : "border-border hover:bg-muted/40"
                      )}
                    >
                      <img src={method.icon} alt={method.label} className="w-10 h-auto rounded" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{method.label}</p>
                        <p className="text-xs text-muted-foreground">•••• {method.last4}</p>
                      </div>
                      {selected === method.id && (
                        <div className="w-2 h-2 rounded-full bg-foreground" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddCard(true)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border border-dashed border-border hover:bg-muted/40 transition-colors mb-6"
                >
                  <div className="w-10 h-7 rounded bg-muted flex items-center justify-center">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Add credit or debit card</span>
                </button>

                <div className="mb-6">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Other methods</p>
                  <div className="space-y-3">
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                      <div className="w-10 h-7 rounded bg-[#003087] flex items-center justify-center">
                        <span className="text-[0.5rem] font-bold italic text-white">Pay<span className="text-[#009cde]">Pal</span></span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">PayPal</span>
                    </button>
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                      <div className="w-10 h-7 rounded bg-foreground flex items-center justify-center">
                        <span className="text-[0.5rem] font-bold text-background tracking-tight"> Pay</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">Apple Pay</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-7 pb-7">
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-auto mx-auto rounded-xl h-9 px-8 text-sm font-semibold"
                  variant="hero"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="add-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
              <div className="bg-muted/80 rounded-t-[25px] px-7 pt-7 pb-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowAddCard(false)} className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <CreditCard className="w-7 h-7 text-foreground" />
                  <span className="text-[1.65rem] font-bold text-foreground">Payment</span>
                </div>
              </div>

              <div className="px-7 pb-2">
                <DialogTitle className="text-2xl font-bold text-foreground mb-4">Add Card</DialogTitle>

                <div className="mb-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Card number</label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={newCard.number}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                      setNewCard(prev => ({ ...prev, number: formatted }));
                    }}
                    inputMode="numeric"
                    className="placeholder:text-foreground/30 hover:border-primary/40 transition-colors font-mono tracking-wider"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Expiry date</label>
                    <Input
                      placeholder="MM / YY"
                      value={newCard.expiry}
                      onChange={(e) => {
                        let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (raw.length >= 3) raw = raw.slice(0, 2) + " / " + raw.slice(2);
                        setNewCard(prev => ({ ...prev, expiry: raw }));
                      }}
                      inputMode="numeric"
                      className="placeholder:text-foreground/30 hover:border-primary/40 transition-colors font-mono tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">CVV</label>
                    <div className="relative">
                      <Input
                        type={showCvv ? "text" : "password"}
                        placeholder="•••"
                        value={newCard.cvv}
                        onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        inputMode="numeric"
                        className="placeholder:text-foreground/30 hover:border-primary/40 transition-colors font-mono tracking-wider pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 mb-4">
                  <span className="text-sm font-medium text-foreground">Set as default method</span>
                  <button
                    onClick={() => setNewCard(prev => ({ ...prev, isDefault: !prev.isDefault }))}
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors",
                      newCard.isDefault ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-transform",
                      newCard.isDefault ? "translate-x-[22px]" : "translate-x-0.5"
                    )} />
                  </button>
                </div>

                <div className="flex items-start gap-2 mb-6">
                  <Shield className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Your card details will be saved securely and encrypted end-to-end.</p>
                </div>

                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  Your card may be charged to verify it's valid. That amount will be automatically refunded. By adding a card, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">terms and conditions</Link>.
                </p>
              </div>

              <div className="px-7 pb-7">
                <Button
                  onClick={() => {
                    setNewCard({ number: "", expiry: "", cvv: "", isDefault: false });
                    setShowCvv(false);
                    setShowAddCard(false);
                  }}
                  disabled={newCard.number.replace(/\s/g, "").length < 15 || newCard.expiry.length < 7 || newCard.cvv.length < 3}
                  className="w-full rounded-xl h-9 px-8 text-sm font-semibold"
                  variant="hero"
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
