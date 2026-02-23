import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      <Helmet><title>Mission Control — Courial</title></Helmet>
      <AdminLayout />
    </>
  );
}
