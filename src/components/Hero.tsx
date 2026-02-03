import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import phoneMockup1 from "@/assets/phone-mockup-1.png";
import phoneMockup2 from "@/assets/phone-mockup-2.png";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-tight">
              Deliver anything,
              <br />
              anywhere.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              From documents and dry cleaning to furniture and groceries. 
              The trusted on-demand platform that makes complex delivery needs simple.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
              <Button variant="hero" size="lg" className="group min-w-[180px]">
                Book a Delivery
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="hero-outline" size="lg" className="min-w-[180px]">
                Download the App
              </Button>
            </div>

            {/* Stats - horizontal layout */}
            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              {[
                { value: "100K+", label: "Active Courials" },
                { value: "50+", label: "Cities" },
                { value: "99.8%", label: "Success Rate" },
              ].map((stat) => (
                <div key={stat.label} className="text-left">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Floating phone mockups */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-start min-h-[500px] -ml-12"
          >
            {/* Phone 1 - Front */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute z-20 left-0"
            >
              <img 
                src={phoneMockup1} 
                alt="Courial delivery tracking app" 
                className="w-72 md:w-80 drop-shadow-2xl"
              />
            </motion.div>

            {/* Phone 2 - Behind, offset */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute z-10 left-36 top-8"
            >
              <img 
                src={phoneMockup2} 
                alt="Courial order list app" 
                className="w-64 md:w-72 drop-shadow-xl opacity-90"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
