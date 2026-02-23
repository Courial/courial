import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell,
} from "recharts";

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

interface DailyPoint { date: string; orders: number }
interface FulfillmentPoint { status: string; count: number }

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(45, 90%, 55%)",
  shipped: "hsl(200, 80%, 55%)",
  delivered: "hsl(140, 60%, 45%)",
  cancelled: "hsl(0, 70%, 55%)",
};

function bucketByDay(rows: { created_at: string }[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const d = r.created_at.slice(0, 10);
    map[d] = (map[d] || 0) + 1;
  }
  return map;
}

export const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<DailyPoint[]>([]);
  const [fulfillmentData, setFulfillmentData] = useState<FulfillmentPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      const [ordersCount, productsCount, ordersData, fulfillmentRaw] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("created_at, total").order("created_at").limit(1000),
        supabase.from("orders").select("fulfillment_status"),
      ]);

      const revenue = (ordersData.data || []).reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalOrders: ordersCount.count ?? 0,
        totalProducts: productsCount.count ?? 0,
        totalRevenue: revenue,
      });

      // Timeline
      const buckets = bucketByDay((ordersData.data as any) || []);
      const sorted = Object.keys(buckets).sort();
      setTimeline(sorted.map(date => ({ date, orders: buckets[date] })));

      // Fulfillment status breakdown
      const statusCounts: Record<string, number> = {};
      for (const o of (fulfillmentRaw.data || []) as any[]) {
        const s = o.fulfillment_status || "unknown";
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }
      setFulfillmentData(Object.entries(statusCounts).map(([status, count]) => ({ status, count })));

      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart },
    { label: "Total Products", value: stats.totalProducts, icon: Package },
    { label: "Total Revenue", value: `$${(stats.totalRevenue / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign },
  ];

  const chartCard = "rounded-2xl bg-card border border-border p-6";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform overview at a glance</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => window.open("/", "_blank")}
        >
          <ExternalLink className="w-4 h-4" />
          Live Site
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-card border border-border p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted">
              <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-bold mt-1">
                {loading ? "—" : typeof value === "number" ? value.toLocaleString() : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Daily orders line chart */}
      <div className={chartCard}>
        <h2 className="text-lg font-semibold mb-4">Daily Orders</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
        ) : timeline.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(0 0% 90%)", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="orders" stroke="hsl(24, 100%, 50%)" strokeWidth={2} dot={false} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Fulfillment status bar chart */}
      <div className={chartCard}>
        <h2 className="text-lg font-semibold mb-4">Orders by Fulfillment Status</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
        ) : fulfillmentData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fulfillmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: "hsl(0 0% 45%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 45%)" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 100%)", border: "1px solid hsl(0 0% 90%)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Orders">
                {fulfillmentData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || "hsl(0 0% 70%)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
