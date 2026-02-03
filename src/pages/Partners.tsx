import { motion } from "framer-motion";
import {
  Heart,
  DollarSign,
  Zap,
  Calendar,
  Shield,
  Award,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: DollarSign,
    title: "Keep Up to 80%",
    description:
      "Unlike other platforms, Courials keep the lion's share of every delivery fee.",
  },
  {
    icon: Zap,
    title: "EV Driver Incentives",
    description:
      "Extra bonuses and priority access for electric vehicle drivers.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description:
      "Work when you want, how you want. No minimum hours required.",
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description:
      "Comprehensive coverage while you're on active deliveries.",
  },
  {
    icon: Award,
    title: "No Gamification",
    description:
      "No manipulative algorithms. Fair, transparent earning potential.",
  },
  {
    icon: Heart,
    title: "True Partnership",
    description:
      "We treat you like a partner, not a contractor. Your success is our success.",
  },
];

const steps = [
  { step: "1", title: "Apply Online", description: "Quick 5-minute application" },
  { step: "2", title: "Background Check", description: "Fast and secure verification" },
  { step: "3", title: "Get Activated", description: "Start earning immediately" },
];

const Partners = () => {
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
              Become a Courial
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Earn More,
              <br />
              <span className="gradient-text-orange">Keep More</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join 100,000+ Courials who earn on their own terms. No games, no
              tricks—just fair pay for great work.
            </p>
            <Button variant="hero" size="xl" className="group">
              Apply to Drive
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 border-y border-border bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "80%", label: "Earning Potential" },
              { value: "Weekly", label: "Payouts" },
              { value: "24/7", label: "Support" },
              { value: "$0", label: "Startup Cost" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Courials <span className="gradient-text-orange">Love Us</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're building the fairest gig platform in the industry.
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
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
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

      {/* How It Works */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Get Started in <span className="gradient-text-orange">3 Steps</span>
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex-1 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Button variant="hero" size="xl" className="group">
              Start Your Application
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;
