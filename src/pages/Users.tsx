import { motion } from "framer-motion";
import { Package, Clock, MapPin, Smartphone, ShieldCheck, Hand, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import usersIllustration from "@/assets/users-illustration.png";

const features = [
  {
    icon: Package,
    title: "Anything Delivered",
    description:
      "From dry cleaning and documents to TVs, sofas, sandwiches, or groceries—we can handle it all.",
  },
  {
    icon: Clock,
    title: "On Your Schedule",
    description:
      "Tell us when you need it, and we'll make sure it arrives exactly when you want.",
  },
  {
    icon: MapPin,
    title: "Anywhere You Are",
    description:
      "Whether you're at home, the office, or on the go—we deliver to wherever you need.",
  },
  {
    icon: Smartphone,
    title: "Easy Ordering",
    description:
      "Simple app interface to request pickups and deliveries in just a few taps.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure",
    description:
      "Your items are handled with care by vetted Courials with real-time tracking.",
  },
  {
    icon: Hand,
    title: "White-Glove Service",
    description:
      "Premium handling for your most important deliveries with photo confirmation.",
  },
];

const Users = () => {
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
                For Users
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
                Our Users Are Busy People Just Like You
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                You order, we pick up. We're not just another e-commerce platform. 
                Simply tell us what you need, when, and where, and we'll take care of the rest! 
                From dry cleaning and documents to TVs, sofas, sandwiches, or groceries—we can handle it all. 
                Courial is the only platform that seamlessly gets anything you need, whenever you need it.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button variant="hero" size="xl" className="group">
                  Get iOS App
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="hero-outline" size="xl">
                  Book Now
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block"
            >
              <img 
                src={usersIllustration} 
                alt="Busy user illustration" 
                className="w-[65%] max-w-md mx-auto md:w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
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
              Everything You Need, Delivered
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We handle the pickups and deliveries so you can focus on what matters most.
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

      {/* CTA */}
      <section className="py-12 md:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center glass-card rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Ready to Simplify Your Life?
            </h2>
            <p className="text-muted-foreground mb-8">
              Download the app and experience the easiest way to get anything delivered.
            </p>
            <Button variant="hero" size="xl" className="group">
              Get Started Today
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Users;
