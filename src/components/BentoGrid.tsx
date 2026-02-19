import { motion } from "framer-motion";
import {
  Package,
  Armchair,
  Pill,
  Shirt,
  ShoppingBag,
  FileText,
  CarFront,
  Leaf,
  Users,
} from "lucide-react";
import chauffeurImage from "@/assets/chauffeur-service.jpg";
import conciergeTaskIcon from "@/assets/concierge-task-icon.png";

const bentoItems: Array<{ title: string; description: string; icon: typeof Users; customIcon?: string; className: string; featured?: boolean; image: string }> = [
  {
    title: "Concierge Tasks",
    description: "Personal assistant at your fingertips",
    icon: Users,
    customIcon: conciergeTaskIcon,
    className: "md:col-span-2",
    featured: true,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
  },
  {
    title: "EV Valet Charging",
    description: "We charge your electric vehicle while you work",
    icon: Leaf,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
  },
  {
    title: "Pharmacy",
    description: "Prescriptions & medical supplies",
    icon: Pill,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
  },
  {
    title: "Dry Cleaning",
    description: "Pick up and delivery to your door",
    icon: Shirt,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80",
  },
  {
    title: "Groceries",
    description: "Fresh from any store you choose",
    icon: ShoppingBag,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  },
  {
    title: "Catering Orders",
    description: "Corporate meals and event catering delivered",
    icon: Package,
    className: "md:col-span-2",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
  },
  {
    title: "Chauffeur Services",
    description: "Professional drivers for any occasion",
    icon: CarFront,
    className: "md:col-span-2",
    image: chauffeurImage,
  },
  {
    title: "Furniture Delivery",
    description: "From small items to full room setups",
    icon: Armchair,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    title: "Office Supplies",
    description: "Documents, packages, and business essentials delivered same-day",
    icon: FileText,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
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
    <section className="pt-12 pb-24 md:pt-16 md:pb-32">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text-black-orange">
            End-to-end solutions. Premium by design.
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From essential logistics to white-glove concierge and chauffeur services, 
            we cater to those who value precision over price. Powered by highly vetted 
            Courials, we deliver an uncompromising standard of service for your most 
            high-value needs.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[110px] md:grid-flow-row-dense gap-4 max-w-6xl mx-auto"
        >
          {bentoItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className={`group relative h-full overflow-hidden rounded-2xl glass-card p-6 md:p-8 
                  transition-all duration-300 hover:border-primary/50
                  ${item.className}`}
              >
                {/* Background image with opacity and gradient fade */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 group-hover:opacity-50 ${item.title === 'Furniture Delivery' ? 'opacity-60' : 'opacity-40'}`}
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Gradient overlay for fade effect */}
                <div className={`absolute inset-0 ${item.title === 'Furniture Delivery' ? 'bg-gradient-to-t from-background via-background/50 to-transparent' : 'bg-gradient-to-t from-background via-background/70 to-background/30'}`} />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className={`aspect-square rounded-xl bg-muted flex items-center justify-center mb-4 
                    group-hover:bg-muted/80 transition-colors ${item.featured ? 'w-14' : 'w-12'}`}>
                    {item.customIcon ? (
                      <img src={item.customIcon} alt={item.title} className={`${item.featured ? 'w-7 h-7' : 'w-6 h-6'} object-contain`} />
                    ) : (
                      <Icon className={`text-foreground ${item.featured ? 'w-7 h-7' : 'w-6 h-6'}`} />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className={`text-muted-foreground ${item.featured ? 'text-base' : 'text-sm'}`}>
                    {item.description}
                  </p>
                  
                  {item.featured && (
                    <div className="mt-auto pt-6">
                      <span className="text-primary font-medium text-sm group-hover:underline cursor-pointer">
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