import { motion } from "framer-motion";
import { Shield as ShieldIcon, Zap, Users, DollarSign, CheckCircle, ArrowRight, Car, FileCheck, Clock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import shieldIcon from "@/assets/shield-icon.png";

const whyShieldFeatures = [
  {
    icon: ShieldIcon,
    text: "Real coverage for real life: Protection for qualifying parking violations when things go sideways.",
  },
  {
    icon: Zap,
    text: "Fast, no-drama experience: Simple flow, clear steps, and quick resolution.",
  },
  {
    icon: Users,
    text: "Built for everyday drivers + teams: Great for personal use, fleets, and anyone who parks in busy areas.",
  },
  {
    icon: DollarSign,
    text: "Predictable costs: One plan that helps you avoid surprise expenses.",
  },
];

const howItWorks = [
  {
    step: "01",
    icon: CheckCircle,
    title: "Pick your plan",
    description: "Choose the Shield coverage that fits your needs—personal or fleet.",
  },
  {
    step: "02",
    icon: Car,
    title: "Park like normal",
    description: "Go about your day without worrying about every meter and sign.",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Submit if needed",
    description: "If a qualifying ticket hits, submit it in minutes and Shield takes it from there.",
  },
];

const benefits = [
  {
    icon: ShieldIcon,
    title: "Qualifying Violations Covered",
    description: "Protection for common parking violations that catch even careful drivers off guard.",
  },
  {
    icon: Clock,
    title: "Quick Resolution",
    description: "Submit your ticket and get a response fast—no endless back-and-forth.",
  },
  {
    icon: Users,
    title: "Fleet-Friendly",
    description: "Scale protection across your entire team with simple fleet management.",
  },
  {
    icon: DollarSign,
    title: "Predictable Monthly Cost",
    description: "One flat rate means no surprise expenses throwing off your budget.",
  },
  {
    icon: Zap,
    title: "Instant Activation",
    description: "Start your coverage immediately—no waiting periods or complex setup.",
  },
  {
    icon: CheckCircle,
    title: "Peace of Mind",
    description: "Drive and park with confidence, knowing you're covered when it matters.",
  },
];

const Shield = () => {
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
                Courial Shield
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
                Parking protection that's actually simple.
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                Courial Shield helps take the sting out of parking mistakes. When you get hit with a qualifying parking violation, Shield helps cover the cost—so one ticket doesn't wreck your day (or your budget).
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button variant="hero" size="xl" className="group">
                  Get Shield
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="hero-outline" size="xl">
                  See Coverage
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
                src={shieldIcon} 
                alt="Courial Shield icon" 
                className="w-full max-w-[200px] mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Shield Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 grid gap-4"
            >
              {whyShieldFeatures.map((item, index) => (
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
                Why Shield
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Parking tickets happen to everyone. Shield exists so they don't have to ruin your day—or your budget.
              </p>
              <p className="text-lg text-muted-foreground">
                Whether you're an everyday driver or managing a fleet, <span className="font-bold text-foreground">Shield has you covered</span>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to parking peace of mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  className="group rounded-2xl glass-card p-8 text-center transition-all duration-300 hover:border-primary/50 relative"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {step.step}
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 mx-auto group-hover:bg-muted/80 transition-colors">
                    <Icon className="w-7 h-7 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
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
              Shield Benefits
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to park with confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
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
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
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
              Stop paying the "parking tax."
            </h2>
            <p className="text-muted-foreground mb-8">
              Get Courial Shield and drive with peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" className="group">
                Get Shield
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-outline" size="xl">
                See Coverage
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shield;
