import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Package, Truck, Plus, Loader2, ExternalLink, Edit2, Save, X } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function AdminSupplies() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const fulfillMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase.functions.invoke("shipstation-sync", { body: { order_id: orderId } });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, orderId) => {
      toast({ title: "Sent to fulfillment", description: `Order sent to ShipStation.` });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: any) => {
      toast({ title: "Fulfillment error", description: err.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: { id: string; name: string; price: number; stock: number; active: boolean }) => {
      const { error } = await supabase.from("products").update({ name: product.name, price: product.price, stock: product.stock, active: product.active }).eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Product updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0, stock: 0, active: true });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (authLoading) return <div className="dark min-h-screen bg-[hsl(0,0%,7%)]"><Navbar /><div className="pt-32 text-center text-[hsl(0,0%,50%)]">Loading...</div></div>;
  if (!isAdmin) return <Navigate to="/supplies" replace />;

  return (
    <div className="dark min-h-screen bg-[hsl(0,0%,7%)] text-[hsl(0,0%,98%)]">
      <Helmet><title>Admin Supplies | Courial</title></Helmet>
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Supplies Admin</h1>
            <a href="/supplies" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-[hsl(0,0%,20%)] bg-transparent text-[hsl(0,0%,98%)]">
                <ExternalLink className="w-4 h-4 mr-1" /> View Shop
              </Button>
            </a>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,20%)]">
              <TabsTrigger value="orders" className="data-[state=active]:bg-[hsl(0,0%,20%)] data-[state=active]:text-[hsl(0,0%,98%)]">
                <Truck className="w-4 h-4 mr-1" /> Orders
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-[hsl(0,0%,20%)] data-[state=active]:text-[hsl(0,0%,98%)]">
                <Package className="w-4 h-4 mr-1" /> Inventory
              </TabsTrigger>
            </TabsList>

            {/* Orders tab */}
            <TabsContent value="orders" className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-12 text-[hsl(0,0%,50%)]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
              ) : orders.length === 0 ? (
                <p className="text-center py-12 text-[hsl(0,0%,50%)]">No orders yet</p>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="rounded-xl bg-[hsl(0,0%,10%)] border border-[hsl(0,0%,15%)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold">{order.full_name}</p>
                        <p className="text-sm text-[hsl(0,0%,50%)]">{order.email}</p>
                        <p className="text-xs text-[hsl(0,0%,40%)] mt-1">
                          {order.address_line1}, {order.city}, {order.state} {order.zip}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[hsl(24,100%,50%)]">{formatPrice(order.total)}</p>
                        <p className="text-xs text-[hsl(0,0%,40%)]">{new Date(order.created_at).toLocaleDateString()}</p>
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.fulfillment_status === 'fulfilled' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'
                        }`}>
                          {order.fulfillment_status}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-4">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm text-[hsl(0,0%,60%)]">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>{formatPrice(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {order.fulfillment_status === 'pending' && (
                      <Button
                        size="sm"
                        className="bg-[hsl(24,100%,50%)] hover:bg-[hsl(24,100%,45%)] text-white"
                        onClick={() => fulfillMutation.mutate(order.id)}
                        disabled={fulfillMutation.isPending}
                      >
                        {fulfillMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Truck className="w-4 h-4 mr-1" />}
                        Send to Fulfillment
                      </Button>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Inventory tab */}
            <TabsContent value="inventory" className="space-y-4">
              {productsLoading ? (
                <div className="text-center py-12 text-[hsl(0,0%,50%)]"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[hsl(0,0%,50%)] border-b border-[hsl(0,0%,20%)]">
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Stock</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product: any) => (
                        <tr key={product.id} className="border-b border-[hsl(0,0%,15%)]">
                          {editingId === product.id ? (
                            <>
                              <td className="py-3"><Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,25%)] text-[hsl(0,0%,98%)] h-8 text-sm" /></td>
                              <td className="py-3"><Input type="number" value={editForm.price / 100} onChange={(e) => setEditForm((p) => ({ ...p, price: Math.round(Number(e.target.value) * 100) }))} className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,25%)] text-[hsl(0,0%,98%)] h-8 w-24 text-sm" /></td>
                              <td className="py-3"><Input type="number" value={editForm.stock} onChange={(e) => setEditForm((p) => ({ ...p, stock: Number(e.target.value) }))} className="bg-[hsl(0,0%,12%)] border-[hsl(0,0%,25%)] text-[hsl(0,0%,98%)] h-8 w-20 text-sm" /></td>
                              <td className="py-3">
                                <Button size="sm" variant="outline" className="h-7 text-xs border-[hsl(0,0%,25%)] bg-transparent" onClick={() => setEditForm((p) => ({ ...p, active: !p.active }))}>
                                  {editForm.active ? "Active" : "Inactive"}
                                </Button>
                              </td>
                              <td className="py-3 text-right space-x-2">
                                <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white" onClick={() => { updateProductMutation.mutate(editForm as any & { id: string }); setEditingId(null); }}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 border-[hsl(0,0%,25%)] bg-transparent text-[hsl(0,0%,60%)]" onClick={() => setEditingId(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 font-medium">{product.name}</td>
                              <td className="py-3">{formatPrice(product.price)}</td>
                              <td className="py-3">{product.stock}</td>
                              <td className="py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${product.active ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                                  {product.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <Button size="sm" variant="outline" className="h-7 border-[hsl(0,0%,25%)] bg-transparent text-[hsl(0,0%,60%)]" onClick={() => { setEditingId(product.id); setEditForm({ name: product.name, price: product.price, stock: product.stock, active: product.active }); }}>
                                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
