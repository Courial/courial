import { motion } from "framer-motion";
import { Car, Shield, Clock, Globe, Star, MapPin, ArrowRight, Calendar, Bell, DollarSign, Crown, Headphones, Zap, Settings, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import chauffeurIllustration from "@/assets/chauffeur-illustration.png";

const whyUsFeatures = [
  {
    icon: Shield,
    title: "Relentlessly Safe",
    description:
      "Every chauffeur is trained and background-checked. Every vehicle is inspected—no exceptions.",
  },
  {
    icon: Clock,
    title: "Precision, Every Time",
    description:
      "Our chauffeurs know their cities block by block. Expect exact timing, smooth routes, and zero guesswork.",
  },
  {
    icon: Zap,
    title: "Effortless by Design",
    description:
      "AI-powered, real people behind the wheel—seamless trips from pickup to drop-off, every time.",
  },
];

const chauffeurFeatures = [
  {
    icon: DollarSign,
    title: "Better Pay",
    description:
      "Better pay than the competition—so you keep more of your earnings, every trip, without hidden fees.",
  },
  {
    icon: Crown,
    title: "Luxury Clients",
    description:
      "We serve luxury clientele, which means higher-quality trips, better treatment, and consistently bigger tips.",
  },
  {
    icon: Headphones,
    title: "Exceptional Support",
    description:
      "Our support team is always on, resolving issues fast so chauffeurs can stay focused on driving—not problems.",
  },
];

const regions = [
  {
    name: "Southeast Asia",
    lines: [
      { text: "Bangkok, Thailand", highlight: "(Live)" },
      { text: "Singapore, Hong Kong & Dubai", highlight: "(Coming 2026)" },
    ],
  },
  {
    name: "United States",
    lines: [
      { text: "San Francisco, Los Angeles, Chicago, NYC, DC, Boston, Atlanta & Miami", highlight: "" },
      { text: "", highlight: "(Coming 2026)" },
    ],
  },
];

const Chauffeur = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 relative overflow-hidden">
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
                From Bangkok to New York City
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                The world's first all-luxury ride-hailing and advanced booking platform—where you actually get the car you booked.
              </p>
              <p className="text-lg text-muted-foreground mb-10">
                On-demand rides in as little as 10–25 minutes, flexible hourly bookings, or scheduled service up to 30 days ahead. Fast Ride instantly matches you with the nearest available chauffeur when specific vehicle selection isn't required.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
              <a href="https://chauffeured.ai/booking" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="xl" className="group">
                  Book a Ride
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
                <a href="https://chauffeured.ai" target="_blank" rel="noopener noreferrer">
                  <Button variant="hero-outline" size="xl">
                    Learn More
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block"
            >
              <img 
                src={chauffeurIllustration} 
                alt="Luxury chauffeur service illustration" 
                className="w-[78%] max-w-lg mx-auto md:w-[120%]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Set Your Preferences */}
      <section className="py-12 md:py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 grid gap-4"
            >
              {[
                { icon: Settings, text: "Choose preferred chauffeurs and receive ride acceptances only from drivers you trust" },
                { icon: Car, text: "See the exact vehicle you're booking, including year, color, make/model" },
                { icon: Sparkles, text: "Chilled bottled water, phone chargers, impeccably maintained vehicles no more than five years old" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group rounded-2xl glass-card p-6 transition-all duration-300 hover:border-primary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-muted/80 transition-colors">
                      <item.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <p className="text-lg text-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text-black-orange">
                Set Your Preferences
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Choose preferred chauffeurs and receive ride acceptances only from drivers you trust, creating a seamless, personalized experience. Unlike other platforms, you see the exact vehicle you're booking, including year, color, make/model.
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
                Arrive in Style
              </h2>
              <p className="text-lg text-muted-foreground">
                Chilled bottled water, phone chargers, impeccably maintained vehicles no more than five years old, chauffeurs who open and close doors for you, and a signature service experience crafted to feel effortless and unmistakably elevated.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              Why Us?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {whyUsFeatures.map((feature, index) => {
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

      {/* Chauffeurs Section */}
      <section className="py-12 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              Don't Just Be a Driver,<br />Become a Chauffeur
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Currently available in Bangkok, with expansion to<br />more SEA cities and the U.S. later this year.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16">
            {chauffeurFeatures.map((feature, index) => {
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
      <section className="pt-0 pb-12 md:pt-0 md:pb-24 relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto md:items-start">
            {/* Southeast Asia */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group rounded-2xl glass-card p-6 text-center transition-all duration-300 hover:border-primary/50"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 mx-auto group-hover:bg-muted/80 transition-colors">
                <MapPin className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {regions[0].name}
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {regions[0].lines.map((line) => (
                  <p key={line.text}>
                    {line.text} <span className={line.highlight === "(Live)" ? "text-primary font-semibold" : ""}>{line.highlight}</span>
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Get Notified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="md:self-stretch"
            >
              <div className="group glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:border-primary/50 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Get Notified</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to know when<br />Chauffeur arrives in your city.
                </p>
                <a href="https://chauffeured.ai/#footer" target="_blank" rel="noopener noreferrer">
                  <Button variant="hero" className="whitespace-nowrap">
                    Join Waitlist
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* United States */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group rounded-2xl glass-card p-6 text-center transition-all duration-300 hover:border-primary/50"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 mx-auto group-hover:bg-muted/80 transition-colors">
                <MapPin className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                {regions[1].name}
              </h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {regions[1].lines.map((line) => (
                  <p key={line.text}>
                    {line.text} <span>{line.highlight}</span>
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-0 pb-12 md:pt-0 md:pb-24 relative">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group max-w-xl mx-auto text-center glass-card rounded-3xl p-12 transition-all duration-300 hover:border-primary/50"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Ready for a Premium Ride?
            </h2>
            <p className="text-muted-foreground mb-8">
              Experience luxury transportation with Thai-style hospitality.<br />Book your chauffeur today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://chauffeured.ai/booking" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="xl" className="group">
                  Book Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="/help#contact">
                <Button variant="hero-outline" size="xl">
                  Contact Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Chauffeur;
