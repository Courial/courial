import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, BookOpen, ShoppingBag,
  ChevronLeft, ChevronRight, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminOverview } from "./AdminOverview";
import { AdminOrders } from "./AdminOrders";
import { AdminProducts } from "./AdminProducts";

type Tab = "overview" | "orders" | "products";

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "products", label: "Products", icon: Package },
];

const EXTERNAL_LINKS = [
  { label: "Blog", href: "/admin/blog", icon: BookOpen },
  { label: "Shop", href: "/admin/shop", icon: ShoppingBag },
];

export const AdminLayout = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
          <div className="p-2 rounded-xl bg-primary/10 shrink-0">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight whitespace-nowrap">
              Mission Control
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                activeTab === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}

          <div className="pt-3 mt-3 border-t border-border space-y-1">
            {EXTERNAL_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 flex items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {activeTab === "overview" && <AdminOverview />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "products" && <AdminProducts />}
        </div>
      </main>
    </div>
  );
};
