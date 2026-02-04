import { motion } from "framer-motion";
import { Car, Shield, Clock, Globe, Star, MapPin, ArrowRight, Calendar } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import chauffeurServiceImage from "@/assets/chauffeur-service.jpg";

const features = [
  {
    icon: Car,
    title: "Premium Fleet",
    description:
      "Sedans, SUVs, and vans with clean interiors and comfort-first amenities for every occasion.",
  },
  {
    icon: Shield,
    title: "Professional Chauffeurs",
    description:
      "Trained in etiquette, safety, and clear communication—your comfort is their priority.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Smooth, hospitality-driven experience with support in multiple languages.",
  },
  {
    icon: Clock,
    title: "Flexible Booking",
    description:
      "Request in 10–25 minutes, book hourly, or schedule up to 30 days in advance.",
  },
  {
    icon: Star,
    title: "Thai-Style Hospitality",
    description:
      "Experience the warmth and grace of authentic Thai service culture in every ride.",
  },
  {
    icon: Calendar,
    title: "Get What You Book",
    description:
      "No surprises—actually get the car you booked, every single time.",
  },
];

const markets = [
  { city: "Bangkok", status: "active" },
  { city: "Chiang Mai", status: "coming" },
  { city: "Phuket", status: "coming" },
  { city: "Pattaya", status: "coming" },
];

const Chauffeur = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
                Chauffeur by Courial
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
                Premium Rides, Thai-Style Hospitality
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                An all-luxury ride platform built for comfort, reliability, and service. 
                Request a ride in as little as 10–25 minutes, book hourly, or schedule up to 30 days in advance—and actually get the car you booked.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button variant="hero" size="xl" className="group">
                  Book a Ride
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="hero-outline" size="xl">
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img 
                src={chauffeurServiceImage} 
                alt="Luxury chauffeur service" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-12"
            >
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-lg text-foreground">
                    Premium fleet with clean interiors and comfort-first amenities
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-lg text-foreground">
                    Professional chauffeurs trained in etiquette, safety, and communication
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-lg text-foreground">
                    Multilingual support and hospitality-driven experience designed for Thailand
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text-black-orange">
                What to Expect
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Every ride is designed around you. From the moment you book to the second you arrive, expect nothing less than exceptional service.
              </p>
              <p className="text-lg text-muted-foreground">
                Our chauffeurs don't just drive—they create an experience that reflects the best of <span className="font-bold text-foreground">Thai hospitality</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              The Chauffeur Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Luxury transportation reimagined with Thai-style service and modern convenience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group rounded-2xl glass-card p-8 transition-all duration-300 hover:border-primary/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:bg-muted/80 transition-colors">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Availability
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Currently serving Bangkok with expansion plans across Thailand's top destinations.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {markets.map((market, index) => (
              <motion.div
                key={market.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`rounded-xl glass-card p-6 text-center ${
                  market.status === "coming" ? "opacity-60" : ""
                }`}
              >
                <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                  market.status === "active" ? "bg-primary/10" : "bg-muted"
                }`}>
                  <MapPin className={`w-5 h-5 ${
                    market.status === "active" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <h3 className="font-semibold text-foreground">{market.city}</h3>
                {market.status === "coming" && (
                  <span className="inline-block mt-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Ready for a Premium Ride?
            </h2>
            <p className="text-muted-foreground mb-8">
              Experience luxury transportation with Thai-style hospitality. Book your chauffeur today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" className="group">
                Book Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Chauffeur;
