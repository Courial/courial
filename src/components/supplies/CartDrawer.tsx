import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Minus, Plus, Trash2, ShoppingBag, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems, totalWeight, shippingCost } = useCart();
  const navigate = useNavigate();

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const WEIGHT_LIMIT_OZ = 80;
  const SHIPPING_THRESHOLD_CENTS = 5000;

  const isFreeShipping = shippingCost === 0 && items.length > 0;
  const needsMoreForFree = totalPrice < SHIPPING_THRESHOLD_CENTS
    ? SHIPPING_THRESHOLD_CENTS - totalPrice
    : 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="bg-background text-foreground border-l border-border w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 rounded-2xl glass-card">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-md object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground">{item.name}</p>
                    <p className="text-primary text-sm font-semibold">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              {/* Shipping nudge / status */}
              {needsMoreForFree > 0 && totalWeight <= WEIGHT_LIMIT_OZ ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span>Add <span className="font-semibold text-foreground">{formatPrice(needsMoreForFree)}</span> more for free shipping</span>
                </div>
              ) : isFreeShipping ? (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">Free shipping applied!</span>
                </div>
              ) : null}

              {/* Subtotal + shipping */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice + shippingCost)}</span>
              </div>

              <Button
                className="w-full h-12 text-base"
                variant="hero-orange"
                onClick={() => { setIsOpen(false); navigate("/supplies/checkout"); }}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
