import { useEffect, useState, useMemo } from "react";
import { Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string | null;
  active: boolean;
  image_url: string | null;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, price, stock, category, active, image_url")
      .order("created_at", { ascending: false })
      .limit(500);
    setProducts((data as ProductRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} products total</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchProducts} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found</td></tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-muted" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">${(product.price / 100).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={product.stock <= 5 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">{product.category || "—"}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={`text-xs ${product.active ? "bg-green-100 text-green-700 border-green-200" : "bg-muted text-muted-foreground"}`}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
