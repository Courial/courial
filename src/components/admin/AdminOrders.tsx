import { useEffect, useState, useMemo } from "react";
import { Search, RefreshCw, ShoppingBag, Car, Truck, ConciergeBell, ParkingCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface OrderRow {
  id: string;
  full_name: string;
  email: string;
  total: number;
  status: string;
  fulfillment_status: string;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const FULFILLMENT_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
};

type OrderCategory = "shop" | "rides" | "delivery" | "valet" | "concierge";

const ORDER_CATEGORIES: { id: OrderCategory; label: string; icon: React.ElementType }[] = [
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "rides", label: "Rides", icon: Car },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "valet", label: "Valet", icon: ParkingCircle },
  { id: "concierge", label: "Concierge", icon: ConciergeBell },
];

export const AdminOrders = () => {
  const [activeCategory, setActiveCategory] = useState<OrderCategory>("shop");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, full_name, email, total, status, fulfillment_status, tracking_number, carrier, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setOrders((data as OrderRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      o => o.full_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
  }, [orders, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{orders.length} orders total</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {ORDER_CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeCategory !== "shop" ? (
        <div className="rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-muted mb-4">
            {(() => {
              const Cat = ORDER_CATEGORIES.find(c => c.id === activeCategory)!;
              return <Cat.icon className="w-8 h-8 text-muted-foreground" />;
            })()}
          </div>
          <h3 className="text-lg font-semibold mb-1 capitalize">{activeCategory} Orders</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} order management is coming soon. This section will display orders from the {activeCategory} service.
          </p>
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
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
                    <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Fulfillment</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Tracking</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />Loading…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No orders found</td></tr>
                  ) : (
                    filtered.map(order => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">{order.full_name}</td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">{order.email}</td>
                        <td className="p-4 font-medium">${(order.total / 100).toFixed(2)}</td>
                        <td className="p-4">
                          <Badge variant="outline" className={`text-xs ${STATUS_BADGE[order.status] || "bg-muted text-muted-foreground"}`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <Badge variant="outline" className={`text-xs ${FULFILLMENT_BADGE[order.fulfillment_status] || "bg-muted text-muted-foreground"}`}>
                            {order.fulfillment_status}
                          </Badge>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-xs text-muted-foreground">
                          {order.tracking_number ? `${order.carrier || ""} ${order.tracking_number}` : "—"}
                        </td>
                        <td className="p-4 hidden sm:table-cell text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
