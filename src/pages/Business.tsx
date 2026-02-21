import { motion } from "framer-motion";
import { Building2, Code, Truck, Clock, Shield, BarChart3, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import businessIllustration from "@/assets/business-handshake.png";

const features = [
  {
    icon: Code,
    title: "API Integration",
    description:
      "Seamlessly integrate our delivery infrastructure into your platform with our robust RESTful API.",
  },
  {
    icon: Truck,
    title: "Same-Day Delivery",
    description:
      "Offer your customers lightning-fast delivery options that set you apart from competitors.",
  },
  {
    icon: Clock,
    title: "Custom SLAs",
    description:
      "Tailored service level agreements to match your business requirements and customer expectations.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 compliant infrastructure with end-to-end encryption and secure payment processing.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Comprehensive dashboards and reporting to optimize your delivery operations.",
  },
  {
    icon: Building2,
    title: "Dedicated Support",
    description:
      "Personal account manager and priority support for enterprise clients.",
  },
];

const Business = () => {
  const handleScheduleDemo = () => {
    const subject = encodeURIComponent("We're Ready to Transform Our Logistics with Courial");
    const body = encodeURIComponent("Hello Courial Support,\n\nWe would love to discuss our company, [Company Name], with Courial regarding onboarding as a B2B client for your logistics and delivery services.\n\nHere are our contact details:\n\nContact Name:\n\nPhone Number:\n\nPrimary Industry:\n\nLooking forward to hearing from you!");
    window.open(`mailto:support@courial.com?subject=${subject}&body=${body}`, "_self");
  };

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
                For Businesses
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
                Power Your Delivery Operations
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                From local merchants to enterprise e-commerce, we provide the
                delivery infrastructure that scales with your business.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Button variant="hero" size="xl" className="group" onClick={handleScheduleDemo}>
                  Contact Sales
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Link to="/help#api-docs">
                  <Button variant="hero-outline" size="xl">
                    View API Docs
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block"
            >
              <img 
                src={businessIllustration} 
                alt="Business partnership illustration" 
                className="w-[65%] max-w-md mx-auto md:w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-black-orange">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build a world-class delivery experience.
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
      <section className="py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group max-w-3xl mx-auto text-center glass-card rounded-3xl p-12 transition-all duration-300 hover:border-primary/50"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-black-orange">
              Ready to Transform Your Logistics?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of businesses that trust Courial for their delivery needs.
            </p>
            <Button variant="hero" size="xl" className="group" onClick={handleScheduleDemo}>
              Schedule a Demo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Business;
