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
  Building2,
  Smartphone,
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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const BentoGrid = () => {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            We Deliver <span className="gradient-text-orange">Everything</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
          {bentoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-2xl glass-card p-6 md:p-8 
                  transition-all duration-500 hover:scale-[1.02] hover:border-primary/50
                  ${item.className}`}
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 
                    group-hover:bg-primary/20 transition-colors ${item.featured ? 'w-16 h-16' : ''}`}>
                    <Icon className={`text-primary ${item.featured ? 'w-8 h-8' : 'w-6 h-6'}`} />
                  </div>
                  
                  <h3 className={`font-bold mb-2 group-hover:text-primary transition-colors 
                    ${item.featured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                    {item.title}
                  </h3>
                  
                  <p className={`text-muted-foreground ${item.featured ? 'text-base md:text-lg' : 'text-sm'}`}>
                    {item.description}
                  </p>
                  
                  {item.featured && (
                    <div className="mt-auto pt-6">
                      <span className="text-primary font-semibold text-sm group-hover:underline cursor-pointer">
                        Learn more →
                      </span>
                    </div>
                  )}
                </div>

                {/* Corner Accent */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
