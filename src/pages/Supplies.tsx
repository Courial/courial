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
    <div className="min-h-screen bg-background">
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
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-primary text-sm font-semibold tracking-wider uppercase mb-2">
                Driver Shop
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-3xl md:text-4xl font-bold gradient-text-black-orange">
                Premium Gear
              </motion.h1>
            </div>
            <Button
              variant="outline"
              onClick={() => totalItems > 0 && setIsOpen(true)}
              disabled={totalItems === 0}
              className={`relative transition-colors ${totalItems === 0 ? "opacity-40 cursor-not-allowed text-muted-foreground border-muted-foreground/30" : ""}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
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
              onClick={() => setSelectedCategory(null)}
            >
              <Package className="w-4 h-4 mr-1" /> All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {categoryIcons[cat] || <Package className="w-4 h-4 mr-1" />}
                <span className="ml-1">{cat}</span>
              </Button>
            ))}
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-xl glass-card h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group rounded-xl glass-card overflow-hidden transition-all duration-300 hover:border-primary/50"
                >
                  <div className="aspect-square bg-muted overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    {product.category && (
                      <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.category}</span>
                    )}
                    <h3 className="font-semibold text-sm md:text-base mt-0.5 text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 hidden md:block">{product.description}</p>
                    <div className="flex items-center justify-between mt-2 md:mt-3">
                      <span className="text-base md:text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      <Button
                        size="sm"
                        variant="hero"
                        className="h-7 md:h-8 text-xs px-2 md:px-3"
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })}
                        disabled={product.stock <= 0}
                      >
                        <Plus className="w-3 h-3 mr-0.5" />
                        {product.stock <= 0 ? "Out" : "Add"}
                      </Button>
                    </div>
                    {product.stock > 0 && product.stock <= 10 && (
                      <p className="text-[10px] text-primary mt-1">Only {product.stock} left</p>
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
