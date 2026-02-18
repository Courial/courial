import { motion } from "framer-motion";
import chauffeurImage from "@/assets/chauffeur-service.jpg";
import conciergeIcon from "@/assets/icons/concierge-task.png";
import evValetIcon from "@/assets/icons/ev-valet-charge.png";
import pharmacyIcon from "@/assets/icons/pharmacy.png";
import dryCleaningIcon from "@/assets/icons/dry-cleaning.png";
import groceriesIcon from "@/assets/icons/groceries.png";
import cateringIcon from "@/assets/icons/catering.png";
import chauffeurIcon from "@/assets/icons/chauffeur.png";
import furnitureIcon from "@/assets/icons/furniture.png";
import officeSuppliesIcon from "@/assets/icons/office-supplies.png";

const bentoItems = [
  {
    title: "Concierge Tasks",
    description: "Personal assistant at your fingertips",
    iconImage: conciergeIcon,
    className: "md:col-span-2",
    featured: true,
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80",
  },
  {
    title: "EV Valet Charging",
    description: "We charge your electric vehicle while you work",
    iconImage: evValetIcon,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80",
  },
  {
    title: "Pharmacy",
    description: "Prescriptions & medical supplies",
    iconImage: pharmacyIcon,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
  },
  {
    title: "Dry Cleaning",
    description: "Pick up and delivery to your door",
    iconImage: dryCleaningIcon,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80",
  },
  {
    title: "Groceries",
    description: "Fresh from any store you choose",
    iconImage: groceriesIcon,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
  },
  {
    title: "Catering Orders",
    description: "Corporate meals and event catering delivered",
    iconImage: cateringIcon,
    className: "md:col-span-2",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
  },
  {
    title: "Chauffeur Services",
    description: "Professional drivers for any occasion",
    iconImage: chauffeurIcon,
    className: "md:col-span-2",
    image: chauffeurImage,
  },
  {
    title: "Furniture Delivery",
    description: "From small items to full room setups",
    iconImage: furnitureIcon,
    className: "md:col-span-1",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  },
  {
    title: "Office Supplies",
    description: "Documents, packages, and business essentials delivered same-day",
    iconImage: officeSuppliesIcon,
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
            One platform for all your needs.
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
          className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[220px] md:grid-flow-row-dense gap-4 max-w-6xl mx-auto"
        >
          {bentoItems.map((item) => {
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className={`group relative h-full overflow-hidden rounded-2xl glass-card p-6 md:p-8 
                  transition-all duration-300 hover:border-primary/50
                  ${item.className}`}
              >
                {/* Background image with 50% opacity and gradient fade */}
                <div 
                  className="absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-50"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                {/* Gradient overlay for fade effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4 
                    group-hover:bg-muted/80 transition-colors">
                    <img src={item.iconImage} alt={item.title} className="w-9 h-9" />
                  </div>
                  
                  <h3 className={`font-bold mb-3 group-hover:text-primary transition-colors
                    ${item.featured ? 'text-3xl' : 'text-xl'}`}>
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