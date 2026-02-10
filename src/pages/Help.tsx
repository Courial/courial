import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HelpCircle, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle,
  X,
  Package,
  Car,
  CreditCard,
  User,
  Shield,
  Clock,
  Code
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { ApiDocsDialog } from "@/components/ApiDocsDialog";

// Line icon component
const LineIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqCategories = [
  { id: "delivery", label: "Delivery", icon: Package },
  { id: "chauffeur", label: "Chauffeur", icon: Car },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "account", label: "Account", icon: User },
  { id: "safety", label: "Safety", icon: Shield },
  { id: "general", label: "General", icon: HelpCircle },
];

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    href: "tel:+14152754707",
    color: "bg-emerald-500",
  },
  {
    icon: Mail,
    title: "Email Us",
    href: "mailto:support@courial.com",
    color: "bg-blue-500",
  },
  {
    icon: WhatsAppIcon,
    title: "WhatsApp",
    href: "https://api.whatsapp.com/message/PHOLSBHGQKTEO1",
    color: "bg-green-500",
  },
  {
    icon: LineIcon,
    title: "Line",
    href: "https://lin.ee/DJiZWFw",
    color: "bg-green-400",
  },
];

// Static FAQs as fallback
const staticFaqs: FAQ[] = [
  {
    id: "1",
    question: "How do I track my delivery?",
    answer: "You can track your delivery in real-time through the Courial app. Once your order is picked up, you'll see a live map showing your Courial's location and estimated arrival time.",
    category: "delivery",
  },
  {
    id: "2",
    question: "What items can I send with Courial?",
    answer: "You can send most items including documents, packages, food, and retail goods. However, we don't transport hazardous materials, illegal items, or extremely fragile goods without proper packaging.",
    category: "delivery",
  },
  {
    id: "3",
    question: "How do I book a Chauffeur?",
    answer: "Open the Courial app, select 'Chauffeur' service, enter your pickup and destination, choose your vehicle class, and confirm your booking. Your Chauffeur will arrive at the scheduled time.",
    category: "chauffeur",
  },
  {
    id: "4",
    question: "What vehicle types are available for Chauffeur service?",
    answer: "We offer Standard, Premium, and Luxury vehicle classes. Standard includes sedans, Premium offers executive vehicles, and Luxury provides high-end cars like Mercedes S-Class or BMW 7 Series.",
    category: "chauffeur",
  },
  {
    id: "5",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, Apple Pay, Google Pay, and PayPal. You can manage your payment methods in the app under Settings > Payment.",
    category: "payments",
  },
  {
    id: "6",
    question: "How do refunds work?",
    answer: "Refunds are processed within 5-7 business days. If your delivery was damaged or not completed, contact support with your order details for a full refund review.",
    category: "payments",
  },
  {
    id: "7",
    question: "How do I reset my password?",
    answer: "Go to the login screen, tap 'Forgot Password', enter your email, and follow the reset link sent to your inbox. If you don't receive it, check your spam folder.",
    category: "account",
  },
  {
    id: "8",
    question: "How do I update my profile information?",
    answer: "Open the app, go to Settings > Profile, and you can update your name, phone number, email, and profile photo. Some changes may require verification.",
    category: "account",
  },
  {
    id: "9",
    question: "Are Courials background checked?",
    answer: "Yes, all Courials and Chauffeurs undergo comprehensive background checks including criminal history, driving record, and identity verification before joining our platform.",
    category: "safety",
  },
  {
    id: "10",
    question: "What insurance coverage do you provide?",
    answer: "All deliveries are covered by our standard liability insurance. For high-value items, we recommend purchasing additional coverage at checkout.",
    category: "safety",
  },
  {
    id: "11",
    question: "What cities do you operate in?",
    answer: "We currently operate in San Francisco Bay Area, Los Angeles, Boston, New York City, San Diego, and Bangkok (Thailand). Check the app for the full list of service areas.",
    category: "general",
  },
  {
    id: "12",
    question: "How do I become a Courial?",
    answer: "Visit courial.com/courials to apply. You'll need a valid driver's license, vehicle (bike, scooter, or car), smartphone, and pass our background check.",
    category: "general",
  },
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>(staticFaqs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location.hash]);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("helpscout", {
        body: { action: "getFaqs" },
      });

      if (error) {
        console.error("Error fetching FAQs:", error);
        return;
      }

      if (data?.faqs && data.faqs.length > 0) {
        setFaqs(data.faqs);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute displayed FAQs based on mode
  const displayedFaqs = (() => {
    if (searchQuery) {
      // Search mode: show top 5 closest matched by title
      const queryLower = searchQuery.toLowerCase();
      return faqs
        .filter(
          (faq) =>
            faq.question.toLowerCase().includes(queryLower) ||
            faq.answer.toLowerCase().includes(queryLower)
        )
        .sort((a, b) => {
          // Prioritize title matches over answer-only matches
          const aTitle = a.question.toLowerCase().includes(queryLower) ? 0 : 1;
          const bTitle = b.question.toLowerCase().includes(queryLower) ? 0 : 1;
          return aTitle - bTitle;
        })
        .slice(0, 5);
    }
    if (selectedCategory) {
      // Category mode: show top 5 in that category
      return faqs.filter((faq) => faq.category === selectedCategory).slice(0, 5);
    }
    // Default: no buttons selected, no search = show nothing
    return [];
  })();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Support
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground">
              Find answers to your questions or get in touch with our team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse by category or search below
            </p>
          </motion.div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {faqCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:text-primary hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </motion.button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="max-w-sm mx-auto relative mb-12">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
            <Input
              type="text"
              placeholder="Start typing a question..."
              value={searchQuery}
              onFocus={() => setSelectedCategory(null)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 h-12 rounded-xl border-primary/50 bg-background focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* FAQ Accordion - only show when searching or category selected */}
          {(searchQuery || selectedCategory) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="glass-card rounded-3xl overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading FAQs...</p>
                  </div>
                ) : displayedFaqs.length === 0 ? (
                  <div className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No FAQs found matching your search.</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="p-6">
                    {displayedFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border-border">
                        <AccordionTrigger className="text-left hover:text-primary transition-colors py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* API Docs Section */}
      <section id="api-docs" className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass-card rounded-3xl p-8 md:p-12 text-center">
              <Code className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Developer API
              </h2>
              <p className="text-muted-foreground mb-6">
                Looking to integrate Courial into your business?{" "}
                Access our API to seamlessly connect your systems with our delivery and logistics platform.
              </p>
              <ApiDocsDialog
                trigger={
                  <Button variant="hero" size="lg">
                    Request Access
                  </Button>
                }
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Contact Us
            </h2>
            <p className="text-lg text-muted-foreground">
              Reach out through your preferred channel
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={method.title}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                  title={method.title}
                >
                  <div
                    className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
