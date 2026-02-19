import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "@/components/supplies/CartDrawer";
import { ShoppingCart, Plus, Package, Zap, Shield, Briefcase } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const categoryIcons: Record<string, React.ReactNode> = {
  Electronics: <Zap className="w-4 h-4" />,
  Bags: <Briefcase className="w-4 h-4" />,
  Safety: <Shield className="w-4 h-4" />,
};

export default function Supplies() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addItem, totalItems, setIsOpen } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
  const filtered = selectedCategory ? products.filter((p) => p.category === selectedCategory) : products;

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="dark min-h-screen bg-[hsl(0,0%,7%)] text-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Driver Supplies | Courial</title>
        <meta name="description" content="Premium courier gear and supplies for Courial drivers." />
      </Helmet>
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[hsl(24,100%,50%)] text-sm font-semibold tracking-wider uppercase mb-2">
                Driver Shop
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-3xl md:text-4xl font-bold">
                Premium Gear
              </motion.h1>
            </div>
            <Button
              variant="outline"
              className="relative border-[hsl(0,0%,20%)] bg-transparent text-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,15%)]"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[hsl(24,100%,50%)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              className={selectedCategory === null ? "bg-[hsl(0,0%,98%)] text-[hsl(0,0%,7%)]" : "border-[hsl(0,0%,20%)] bg-transparent text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,15%)]"}
              onClick={() => setSelectedCategory(null)}
            >
              <Package className="w-4 h-4 mr-1" /> All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className={selectedCategory === cat ? "bg-[hsl(0,0%,98%)] text-[hsl(0,0%,7%)]" : "border-[hsl(0,0%,20%)] bg-transparent text-[hsl(0,0%,60%)] hover:text-[hsl(0,0%,98%)] hover:bg-[hsl(0,0%,15%)]"}
                onClick={() => setSelectedCategory(cat)}
              >
                {categoryIcons[cat] || <Package className="w-4 h-4 mr-1" />}
                <span className="ml-1">{cat}</span>
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl bg-[hsl(0,0%,10%)] h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-xl bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,15%)] overflow-hidden hover:border-[hsl(0,0%,25%)] transition-all"
                >
                  <div className="aspect-square bg-[hsl(0,0%,12%)] overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[hsl(0,0%,30%)]">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {product.category && (
                      <span className="text-xs font-medium text-[hsl(0,0%,50%)] uppercase tracking-wider">{product.category}</span>
                    )}
                    <h3 className="font-semibold text-lg mt-1">{product.name}</h3>
                    <p className="text-sm text-[hsl(0,0%,50%)] mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-[hsl(24,100%,50%)]">{formatPrice(product.price)}</span>
                      <Button
                        size="sm"
                        className="bg-[hsl(0,0%,98%)] text-[hsl(0,0%,7%)] hover:bg-[hsl(0,0%,85%)] font-semibold"
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })}
                        disabled={product.stock <= 0}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {product.stock <= 0 ? "Sold Out" : "Add"}
                      </Button>
                    </div>
                    {product.stock > 0 && product.stock <= 10 && (
                      <p className="text-xs text-[hsl(24,100%,50%)] mt-2">Only {product.stock} left</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
