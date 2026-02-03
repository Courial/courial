import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import illustrationDelivery from "@/assets/illustration-delivery.png";
import illustrationMerchant from "@/assets/illustration-merchant.png";
import illustrationApp from "@/assets/illustration-app.png";

const pillars = [
  {
    image: illustrationDelivery,
    title: "Become a Courial",
    description:
      "As a delivery partner, make money and work on your schedule. Sign up in minutes.",
    cta: "Start earning",
  },
  {
    image: illustrationMerchant,
    title: "Become a Merchant",
    description:
      "Attract new customers and grow sales with our local delivery technology.",
    cta: "Partner with us",
  },
  {
    image: illustrationApp,
    title: "Get the Courial experience",
    description:
      "Experience the best your neighborhood has to offer, all in one app.",
    cta: "Get the app",
  },
];

export const Pillars = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              {/* Illustration */}
              <div className="mb-6 flex justify-center">
                <img 
                  src={pillar.image} 
                  alt={pillar.title}
                  className="w-40 h-40 object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-xs mx-auto">
                {pillar.description}
              </p>

              {/* CTA Link */}
              <a 
                href="#" 
                className="inline-flex items-center gap-1 text-primary font-medium text-sm hover:underline group"
              >
                {pillar.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
