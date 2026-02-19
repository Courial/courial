import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ChatBubble } from "@/components/ChatBubble";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Markets from "./pages/Markets";
import Business from "./pages/Business";
import Partners from "./pages/Partners";
import Users from "./pages/Users";
import Courials from "./pages/Courials";
import Chauffeur from "./pages/Chauffeur";
import Shield from "./pages/Shield";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ICA from "./pages/ICA";
import Help from "./pages/Help";
import Api from "./pages/Api";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Supplies from "./pages/Supplies";
import SuppliesCheckout from "./pages/SuppliesCheckout";
import SuppliesSuccess from "./pages/SuppliesSuccess";
import AdminSupplies from "./pages/AdminSupplies";
import NotFound from "./pages/NotFound";
import { CartProvider } from "./hooks/useCart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/business" element={<Business />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/users" element={<Users />} />
                <Route path="/courials" element={<Courials />} />
                <Route path="/chauffeur" element={<Chauffeur />} />
                <Route path="/shield" element={<Shield />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/ica" element={<ICA />} />
                <Route path="/help" element={<Help />} />
                <Route path="/api" element={<Api />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/shop" element={<AdminSupplies />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/supplies" element={<Supplies />} />
                <Route path="/supplies/checkout" element={<SuppliesCheckout />} />
                <Route path="/supplies/success" element={<SuppliesSuccess />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatBubble />
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
