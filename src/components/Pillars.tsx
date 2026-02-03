import { motion } from "framer-motion";
import { Users, Building2, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Users,
    title: "For Customers",
    subtitle: "Your Personal Concierge",
    description:
      "Saving money is great, but saving time is invaluable. We handle the small tasks so you can focus on what truly matters.",
    features: [
      "Order anything from anywhere",
      "Same-day delivery available",
      "Real-time tracking",
      "24/7 support",
    ],
    cta: "Book Now",
    accent: "from-primary/20 to-primary/5",
  },
  {
    icon: Building2,
    title: "For Businesses",
    subtitle: "Local Delivery Technology",
    description:
      "Powerful API integration and merchant partnerships to supercharge your delivery operations.",
    features: [
      "Seamless API integration",
      "Custom SLA options",
      "Dedicated account manager",
      "Volume discounts",
    ],
    cta: "Partner With Us",
    accent: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: Heart,
    title: "For Courials",
    subtitle: "True Partner Model",
    description:
      "Keep up to 80% of delivery fees. No gamification algorithms—just fair pay for great work.",
    features: [
      "Keep up to 80% of fees",
      "EV driver incentives",
      "Flexible scheduling",
      "Weekly payouts",
    ],
    cta: "Join Our Team",
    accent: "from-green-500/20 to-green-500/5",
  },
];

export const Pillars = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Three Pillars
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Built for <span className="gradient-text-orange">Everyone</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whether you need a helping hand, want to grow your business, 
            or looking for flexible work—we've got you covered.
          </p>
        </motion.div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative h-full rounded-3xl glass-card p-8 overflow-hidden transition-all duration-500 hover:border-primary/50">
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${pillar.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-muted-foreground font-medium">
                        {pillar.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {pillar.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button variant="hero-outline" className="w-full group/btn">
                      {pillar.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
