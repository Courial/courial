import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { Package, Truck, Loader2, ExternalLink, Edit2, Save, X, ArrowLeft, Plus } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { z } from "zod";

const CATEGORIES = ["Electronics", "Bags", "Safety", "Comfort", "Accessories"];

const newProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(1000).optional(),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  category: z.string().optional(),
  image_url: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional(),
  active: z.boolean(),
});

type NewProductForm = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image_url: string;
  active: boolean;
};

const defaultNewForm: NewProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  category: "",
  image_url: "",
  active: true,
};

export default function AdminSupplies() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] = useState(false);
  const [newForm, setNewForm] = useState<NewProductForm>(defaultNewForm);
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});

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
    onSuccess: () => {
      toast({ title: "Sent to fulfillment", description: "Order sent to ShipStation." });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err: any) => {
      toast({ title: "Fulfillment error", description: err.message, variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: { id: string; name: string; price: number; stock: number; active: boolean; image_url: string }) => {
      const { error } = await supabase.from("products").update({ name: product.name, price: product.price, stock: product.stock, active: product.active, image_url: product.image_url }).eq("id", product.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Product updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (payload: {
      name: string; description: string; price: number; stock: number;
      category: string; image_url: string; active: boolean;
    }) => {
      const { error } = await supabase.from("products").insert({
        name: payload.name,
        description: payload.description || null,
        price: payload.price,
        stock: payload.stock,
        category: payload.category || null,
        image_url: payload.image_url || null,
        active: payload.active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Product added", description: "The new product is now live in the shop." });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setAddOpen(false);
      setNewForm(defaultNewForm);
      setNewErrors({});
    },
    onError: (err: any) => {
      toast({ title: "Failed to add product", description: err.message, variant: "destructive" });
    },
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: 0, stock: 0, active: true, image_url: "" });

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleAddSubmit = () => {
    const errors: Record<string, string> = {};
    if (!newForm.name.trim()) errors.name = "Name is required";
    const priceVal = parseFloat(newForm.price);
    if (isNaN(priceVal) || priceVal <= 0) errors.price = "Enter a valid price greater than 0";
    const stockVal = parseInt(newForm.stock, 10);
    if (isNaN(stockVal) || stockVal < 0) errors.stock = "Stock cannot be negative";
    if (newForm.image_url && !/^https?:\/\/.+/.test(newForm.image_url.trim())) {
      errors.image_url = "Must be a valid URL starting with http(s)://";
    }
    if (Object.keys(errors).length > 0) {
      setNewErrors(errors);
      return;
    }
    setNewErrors({});
    addProductMutation.mutate({
      name: newForm.name.trim(),
      description: newForm.description.trim(),
      price: Math.round(priceVal * 100),
      stock: stockVal,
      category: newForm.category,
      image_url: newForm.image_url.trim(),
      active: newForm.active,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/supplies" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Shop Admin | Courial</title></Helmet>
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-10">
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-1">Commerce</p>
            <h1 className="text-3xl font-bold tracking-tight">Shop Admin</h1>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="orders">
                  <Truck className="w-4 h-4 mr-1.5" /> Orders
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  <Package className="w-4 h-4 mr-1.5" /> Inventory
                </TabsTrigger>
              </TabsList>
              <a href="/supplies" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> View Shop
                </Button>
              </a>
              <div className="ml-auto">
                <Button size="sm" onClick={() => { setAddOpen(true); setNewForm(defaultNewForm); setNewErrors({}); }}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Product
                </Button>
              </div>
            </div>

            {/* Orders tab */}
            <TabsContent value="orders" className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 border border-border rounded-2xl">
                  <p className="text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                orders.map((order: any) => (
                  <div key={order.id} className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-semibold">{order.full_name}</p>
                        <p className="text-sm text-muted-foreground">{order.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.address_line1}, {order.city}, {order.state} {order.zip}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.fulfillment_status === "fulfilled"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.fulfillment_status}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-4 pt-3 border-t border-border">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm text-muted-foreground">
                          <span>{item.product_name} × {item.quantity}</span>
                          <span>{formatPrice(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {order.fulfillment_status === "pending" && (
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => fulfillMutation.mutate(order.id)}
                        disabled={fulfillMutation.isPending}
                      >
                        {fulfillMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Truck className="w-4 h-4 mr-1.5" />}
                        Send to Fulfillment
                      </Button>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Inventory tab */}
            <TabsContent value="inventory">

              {productsLoading ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : (
                <div className="border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Product</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Price</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Stock</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {products.map((product: any) => (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                          {editingId === product.id ? (
                            <>
                              <td className="px-4 py-3 space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-lg border border-border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                                    {editForm.image_url ? (
                                      <img src={editForm.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">No img</span>
                                    )}
                                  </div>
                                  <Input
                                    value={editForm.image_url}
                                    onChange={(e) => setEditForm((p) => ({ ...p, image_url: e.target.value }))}
                                    className="h-8 text-xs"
                                    placeholder="Image URL"
                                  />
                                </div>
                                <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="h-8 text-sm" placeholder="Product name" />
                              </td>
                              <td className="px-4 py-3">
                                <Input type="number" value={editForm.price / 100} onChange={(e) => setEditForm((p) => ({ ...p, price: Math.round(Number(e.target.value) * 100) }))} className="h-8 w-24 text-sm" />
                              </td>
                              <td className="px-4 py-3">
                                <Input type="number" value={editForm.stock} onChange={(e) => setEditForm((p) => ({ ...p, stock: Number(e.target.value) }))} className="h-8 w-20 text-sm" />
                              </td>
                              <td className="px-4 py-3">
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditForm((p) => ({ ...p, active: !p.active }))}>
                                  {editForm.active ? "Active" : "Inactive"}
                                </Button>
                              </td>
                              <td className="px-4 py-3 text-right space-x-2">
                                <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => { updateProductMutation.mutate({ ...editForm, id: product.id }); setEditingId(null); }}>
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-7" onClick={() => setEditingId(null)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg border border-border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                                    {product.image_url ? (
                                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">No img</span>
                                    )}
                                  </div>
                                  <span className="font-medium">{product.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground">{formatPrice(product.price)}</td>
                              <td className="px-4 py-3 text-muted-foreground">{product.stock}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  product.active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {product.active ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button size="sm" variant="outline" className="h-7"
                                  onClick={() => { setEditingId(product.id); setEditForm({ name: product.name, price: product.price, stock: product.stock, active: product.active, image_url: product.image_url ?? "" }); }}>
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

      <Footer />

      {/* Add Product Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Add New Product</SheetTitle>
            <SheetDescription>Fill in the details below. Price is in USD.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* Image preview */}
            {newForm.image_url && /^https?:\/\/.+/.test(newForm.image_url) && (
              <div className="w-full aspect-video rounded-xl border border-border overflow-hidden bg-muted">
                <img src={newForm.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="new-image">Image URL</Label>
              <Input
                id="new-image"
                value={newForm.image_url}
                onChange={(e) => { setNewForm((p) => ({ ...p, image_url: e.target.value })); setNewErrors((p) => ({ ...p, image_url: "" })); }}
                placeholder="https://example.com/image.jpg"
              />
              {newErrors.image_url && <p className="text-xs text-destructive">{newErrors.image_url}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-name">Product Name <span className="text-destructive">*</span></Label>
              <Input
                id="new-name"
                value={newForm.name}
                onChange={(e) => { setNewForm((p) => ({ ...p, name: e.target.value })); setNewErrors((p) => ({ ...p, name: "" })); }}
                placeholder="e.g. Wireless Phone Mount"
                maxLength={200}
              />
              {newErrors.name && <p className="text-xs text-destructive">{newErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newForm.description}
                onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional product description"
                className="resize-none"
                rows={3}
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-price">Price (USD) <span className="text-destructive">*</span></Label>
                <Input
                  id="new-price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newForm.price}
                  onChange={(e) => { setNewForm((p) => ({ ...p, price: e.target.value })); setNewErrors((p) => ({ ...p, price: "" })); }}
                  placeholder="0.00"
                />
                {newErrors.price && <p className="text-xs text-destructive">{newErrors.price}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-stock">Stock</Label>
                <Input
                  id="new-stock"
                  type="number"
                  min="0"
                  step="1"
                  value={newForm.stock}
                  onChange={(e) => { setNewForm((p) => ({ ...p, stock: e.target.value })); setNewErrors((p) => ({ ...p, stock: "" })); }}
                />
                {newErrors.stock && <p className="text-xs text-destructive">{newErrors.stock}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={newForm.category} onValueChange={(v) => setNewForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={newForm.active ? "default" : "outline"}
                  onClick={() => setNewForm((p) => ({ ...p, active: true }))}
                  className="flex-1"
                >
                  Active
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={!newForm.active ? "default" : "outline"}
                  onClick={() => setNewForm((p) => ({ ...p, active: false }))}
                  className="flex-1"
                >
                  Inactive
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                onClick={handleAddSubmit}
                disabled={addProductMutation.isPending}
              >
                {addProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                Add Product
              </Button>
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addProductMutation.isPending}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
