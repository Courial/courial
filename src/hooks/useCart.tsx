import { createContext, useContext, useState, useCallback } from "react";
import React from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number; // cents
  quantity: number;
  weight_oz: number; // weight per unit in ounces
  image_url?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalWeight: number; // total weight in ounces
  shippingCost: number; // cents
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Shipping rules:
// Free if subtotal >= $50 AND total weight <= 80oz (5 lbs)
// Otherwise $7.99 flat
const SHIPPING_THRESHOLD_CENTS = 5000;  // $50.00
const WEIGHT_LIMIT_OZ = 80;            // 5 lbs
const FLAT_SHIPPING_CENTS = 799;       // $7.99

export function calcShipping(subtotalCents: number, totalWeightOz: number): number {
  if (subtotalCents >= SHIPPING_THRESHOLD_CENTS && totalWeightOz <= WEIGHT_LIMIT_OZ) {
    return 0;
  }
  return FLAT_SHIPPING_CENTS;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalWeight = items.reduce((sum, i) => sum + i.weight_oz * i.quantity, 0);
  const shippingCost = calcShipping(totalPrice, totalWeight);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, totalWeight, shippingCost, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
