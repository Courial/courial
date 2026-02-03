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
  },
];

export const Pillars = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Built for <span className="text-primary">everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                className="group"
              >
                <div className="h-full rounded-xl bg-muted/50 border border-border p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-foreground text-background flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-1 text-foreground">
                      {pillar.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {pillar.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-8">
                    {pillar.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <div className="w-1 h-1 rounded-full bg-foreground" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button variant="hero-outline" size="sm" className="w-full group/btn">
                    {pillar.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};