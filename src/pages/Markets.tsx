import { motion } from "framer-motion";
import { MapPin, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const markets = [
  { city: "New York", state: "NY", status: "active" },
  { city: "Los Angeles", state: "CA", status: "active" },
  { city: "Chicago", state: "IL", status: "active" },
  { city: "Houston", state: "TX", status: "active" },
  { city: "Miami", state: "FL", status: "active" },
  { city: "Atlanta", state: "GA", status: "active" },
  { city: "Dallas", state: "TX", status: "active" },
  { city: "Phoenix", state: "AZ", status: "active" },
  { city: "Philadelphia", state: "PA", status: "active" },
  { city: "San Francisco", state: "CA", status: "active" },
  { city: "Seattle", state: "WA", status: "active" },
  { city: "Boston", state: "MA", status: "coming" },
  { city: "Denver", state: "CO", status: "coming" },
  { city: "San Diego", state: "CA", status: "coming" },
  { city: "Portland", state: "OR", status: "coming" },
  { city: "Austin", state: "TX", status: "coming" },
];

const Markets = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Coverage
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Our <span className="gradient-text-orange">Markets</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We're rapidly expanding across the nation. Check if Courial is
              available in your city.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Markets Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {markets.map((market, index) => (
              <motion.div
                key={market.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`group rounded-xl glass-card p-6 transition-all duration-300 hover:border-primary/50 ${
                  market.status === "coming" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        market.status === "active"
                          ? "bg-primary/10"
                          : "bg-muted"
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 ${
                          market.status === "active"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {market.city}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {market.state}
                      </p>
                    </div>
                  </div>
                  {market.status === "active" && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                {market.status === "coming" && (
                  <span className="inline-block mt-3 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground mb-4">
              Don't see your city? We're expanding fast.
            </p>
            <Button variant="hero-outline">Request Your City</Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Markets;
