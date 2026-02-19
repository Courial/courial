import { Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { Loader2, BookOpen, ShoppingBag, ArrowRight } from "lucide-react";

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  const sections = [
    {
      title: "Blog",
      description: "Create, edit, and publish blog posts. Generate AI content and manage post images.",
      href: "/admin/blog",
      icon: BookOpen,
      badge: "Content",
    },
    {
      title: "Shop",
      description: "Manage products, inventory levels, and fulfill orders via ShipStation.",
      href: "/admin/shop",
      icon: ShoppingBag,
      badge: "Commerce",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Admin — Courial</title></Helmet>
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Dashboard</p>
            <h1 className="text-4xl font-bold tracking-tight">Admin</h1>
            <p className="text-muted-foreground mt-2">{user?.email}</p>
          </div>

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {sections.map((s) => (
              <Link key={s.href} to={s.href} className="group block">
                <div className="relative h-full rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">{s.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <s.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-5 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    Open <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Back link */}
          <div className="mt-10">
            <Link to="/">
              <Button variant="ghost" size="sm" className="border border-foreground/25">
                ← Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
