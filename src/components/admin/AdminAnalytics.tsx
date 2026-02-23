import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, Users, Clock, Globe, RefreshCw } from "lucide-react";

type Visit = {
  id: string;
  session_id: string;
  page_path: string;
  country: string | null;
  city: string | null;
  duration_seconds: number | null;
  entered_at: string;
  user_agent: string | null;
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent-foreground))", "#f97316", "#6366f1", "#14b8a6"];

export const AdminAnalytics = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVisits = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("site_visits")
      .select("*")
      .order("entered_at", { ascending: false })
      .limit(1000);
    setVisits(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchVisits(); }, []);

  const totalPageviews = visits.length;
  const uniqueSessions = new Set(visits.map((v) => v.session_id)).size;
  const avgDuration = visits.filter((v) => v.duration_seconds).reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / (visits.filter((v) => v.duration_seconds).length || 1);

  // Top pages
  const pageCounts: Record<string, number> = {};
  visits.forEach((v) => { pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1; });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  // Country breakdown
  const countryCounts: Record<string, number> = {};
  visits.forEach((v) => { const c = v.country || "Unknown"; countryCounts[c] = (countryCounts[c] || 0) + 1; });
  const countryData = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Daily visits (last 14 days)
  const dailyCounts: Record<string, number> = {};
  visits.forEach((v) => {
    const day = v.entered_at.slice(0, 10);
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([date, views]) => ({ date: date.slice(5), views }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Site Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Organic visitor tracking</p>
        </div>
        <button onClick={fetchVisits} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-border hover:bg-muted transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Pageviews", value: totalPageviews, icon: Eye },
          { label: "Unique Sessions", value: uniqueSessions, icon: Users },
          { label: "Avg Duration", value: `${Math.round(avgDuration)}s`, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily pageviews */}
        <div className="rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Daily Pageviews</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
          )}
        </div>

        {/* Country breakdown */}
        <div className="rounded-2xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Visitors by Country</h3>
          {countryData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={countryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={2} stroke="hsl(var(--card))">
                    {countryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {countryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="font-medium ml-auto">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
          )}
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Top Pages</h3>
        {topPages.length > 0 ? (
          <div className="space-y-2">
            {topPages.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                <span className="font-mono text-xs">{p.path}</span>
                <span className="font-medium">{p.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
        )}
      </div>

      {/* Recent visits */}
      <div className="rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Visits</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left py-2 font-medium">Page</th>
                <th className="text-left py-2 font-medium">Country</th>
                <th className="text-left py-2 font-medium">Duration</th>
                <th className="text-left py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {visits.slice(0, 15).map((v) => (
                <tr key={v.id} className="border-b border-border last:border-0">
                  <td className="py-2 font-mono text-xs">{v.page_path}</td>
                  <td className="py-2 text-muted-foreground">{v.country || "—"}</td>
                  <td className="py-2 text-muted-foreground">{v.duration_seconds ? `${v.duration_seconds}s` : "—"}</td>
                  <td className="py-2 text-muted-foreground text-xs">{new Date(v.entered_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
