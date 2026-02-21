import { motion } from "framer-motion";
import { DollarSign, Clock, MapPin, Zap, ShieldCheck, Car, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import courialsTeamIllustration from "@/assets/courials-team-illustration.png";
import courialsEarningsIllustration from "@/assets/courials-earnings-illustration.png";

const features = [
  {
    icon: DollarSign,
    title: "Keep Up to 80%",
    description:
      "As true partners, Courials keep up to 80% of delivery fees—far more than any other platform.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description:
      "Work when you want, where you want. Set your own hours and be your own boss.",
  },
  {
    icon: MapPin,
    title: "Choose Your Zone",
    description:
      "Select your preferred work locations and neighborhoods. No forced dispatching.",
  },
  {
    icon: Zap,
    title: "Stay Busy",
    description:
      "Deliver anything—from documents to furniture—so you're always earning, never waiting.",
  },
  {
    icon: ShieldCheck,
    title: "No Gamification",
    description:
      "No manipulative algorithms or surge games. Transparent, fair pay every time.",
  },
  {
    icon: Car,
    title: "EV Incentives",
    description:
      "Get rewarded for going green with special bonuses and priority access for EV drivers.",
  },
];

const Courials = () => {
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
                For Courials
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
                The Ultimate<br /> Side-Hustle
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                Our team of experienced Courials is here to save the day. 
                Courials enjoy more than just the flexibility of being their own boss and setting their own schedules—they are true partners with the company.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <a href="https://apps.apple.com/us/app/courial-partner/id1521638474" target="_blank" rel="noopener noreferrer">
                  <Button variant="hero" size="xl" className="group">
                    Get iOS App
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </a>
                <a href="https://play.google.com/store/apps/details?id=live.courial.partner&hl=en_US&pli=1" target="_blank" rel="noopener noreferrer">
                  <Button variant="hero-outline" size="xl">
                    Get Android App
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="block"
            >
              <img 
                src={courialsTeamIllustration} 
                alt="Courial delivery team illustration" 
                className="w-[65%] max-w-md mx-auto md:w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-12 md:py-24 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <img 
                src={courialsEarningsIllustration} 
                alt="Courier earning money illustration" 
                className="w-[65%] max-w-md mx-auto md:w-full"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text-black-orange">
                Earn More, Keep More
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                As partners, our Courials keep up to 80% of delivery fees, determine their earnings, choose their work locations, and get paid for waiting.
              </p>
              <p className="text-lg text-muted-foreground">
                By delivering anything, they stay busy and experience shorter wait times, enabling them to earn <span className="font-bold text-foreground">$30 or more per hour</span>.
              </p>
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
              The True Partner Model
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe in treating our Courials as real partners, not just gig workers. Here's what makes us different.
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
              Ready to Join the Team?
            </h2>
            <p className="text-muted-foreground mb-8">
              Download the Courial app and start earning on your own terms.<br /> Be your own boss while being part of something bigger.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://apps.apple.com/us/app/courial-partner/id1521638474" target="_blank" rel="noopener noreferrer">
                <Button variant="hero" size="xl" className="group">
                  Get iOS App
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="https://play.google.com/store/apps/details?id=live.courial.partner&hl=en_US&pli=1" target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="xl">
                  Get Android App
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courials;
