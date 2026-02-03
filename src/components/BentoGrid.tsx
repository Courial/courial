import { motion } from "framer-motion";
import {
  Package,
  Armchair,
  Pill,
  Shirt,
  ShoppingBag,
  FileText,
  Car,
  Zap,
  Users,
} from "lucide-react";

const bentoItems = [
  {
    title: "Office Supplies",
    description: "Documents, packages, and business essentials delivered same-day",
    icon: FileText,
    className: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    title: "Furniture Delivery",
    description: "From small items to full room setups",
    icon: Armchair,
    className: "md:col-span-1",
  },
  {
    title: "Pharmacy",
    description: "Prescriptions & medical supplies",
    icon: Pill,
    className: "md:col-span-1",
  },
  {
    title: "Dry Cleaning",
    description: "Pick up and delivery to your door",
    icon: Shirt,
    className: "md:col-span-1",
  },
  {
    title: "Groceries",
    description: "Fresh from any store you choose",
    icon: ShoppingBag,
    className: "md:col-span-1",
  },
  {
    title: "Chauffeur Services",
    description: "Professional drivers for any occasion",
    icon: Car,
    className: "md:col-span-2",
  },
  {
    title: "EV Valet Charging",
    description: "We charge your electric vehicle while you work",
    icon: Zap,
    className: "md:col-span-1",
  },
  {
    title: "Concierge Tasks",
    description: "Personal assistant at your fingertips",
    icon: Users,
    className: "md:col-span-1",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export const BentoGrid = () => {
  return (
    <section className="py-24 md:py-32 bg-muted/30">
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
            We deliver everything
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From essential deliveries to premium concierge services, 
            we're the one platform that handles it all.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto"
        >
          {bentoItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-xl bg-background border border-border p-6 md:p-8 
                  transition-all duration-300 hover:border-foreground/20 hover:shadow-lg
                  ${item.className}`}
              >
                <div className="relative z-10 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 
                    group-hover:bg-foreground group-hover:text-background transition-colors ${item.featured ? 'w-14 h-14' : ''}`}>
                    <Icon className={`${item.featured ? 'w-7 h-7' : 'w-5 h-5'}`} />
                  </div>
                  
                  <h3 className={`font-semibold mb-2 text-foreground
                    ${item.featured ? 'text-2xl' : 'text-lg'}`}>
                    {item.title}
                  </h3>
                  
                  <p className={`text-muted-foreground ${item.featured ? 'text-base' : 'text-sm'}`}>
                    {item.description}
                  </p>
                  
                  {item.featured && (
                    <div className="mt-auto pt-6">
                      <span className="text-foreground font-medium text-sm group-hover:underline cursor-pointer">
                        Learn more →
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};